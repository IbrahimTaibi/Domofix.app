import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Invoice,
  InvoiceDocument,
  InvoiceStatusEnum,
} from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.invoiceModel.countDocuments();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
    return invoiceNumber;
  }

  /**
   * Calculate invoice totals
   */
  private calculateTotals(lineItems: any[]): {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
  } {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    lineItems.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;

      // Calculate discount
      let itemDiscount = 0;
      if (item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemDiscount = (itemSubtotal * item.discount) / 100;
        } else {
          itemDiscount = item.discount;
        }
      }
      discountAmount += itemDiscount;

      // Calculate tax on discounted amount
      const taxableAmount = itemSubtotal - itemDiscount;
      const itemTax = (taxableAmount * (item.taxRate || 0)) / 100;
      taxAmount += itemTax;
    });

    const totalAmount = subtotal - discountAmount + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  /**
   * Create a new invoice
   */
  async create(
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
  ): Promise<Invoice> {
    // Validate order exists
    const order = await this.orderModel
      .findById(createInvoiceDto.orderId)
      .populate('customerId')
      .populate('providerId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if user is the provider of this order
    if (order.providerId.toString() !== userId) {
      throw new ForbiddenException(
        'Only the provider can create an invoice for this order',
      );
    }

    // Check if invoice already exists for this order
    const existingInvoice = await this.invoiceModel
      .findOne({ orderId: createInvoiceDto.orderId })
      .exec();

    if (existingInvoice) {
      throw new BadRequestException(
        'An invoice already exists for this order',
      );
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const totals = this.calculateTotals(createInvoiceDto.lineItems);

    // Create invoice
    const invoice = new this.invoiceModel({
      invoiceNumber,
      orderId: createInvoiceDto.orderId,
      customerId: order.customerId,
      providerId: order.providerId,
      billTo: createInvoiceDto.billTo,
      billFrom: createInvoiceDto.billFrom,
      issueDate: createInvoiceDto.issueDate || new Date(),
      dueDate: createInvoiceDto.dueDate,
      lineItems: createInvoiceDto.lineItems,
      notes: createInvoiceDto.notes,
      termsAndConditions: createInvoiceDto.termsAndConditions,
      taxId: createInvoiceDto.taxId,
      status: createInvoiceDto.status || InvoiceStatusEnum.DRAFT,
      ...totals,
    });

    return invoice.save();
  }

  /**
   * Find all invoices with filters
   */
  async findAll(queryDto: QueryInvoiceDto, userId: string, userRole: string) {
    const {
      customerId,
      providerId,
      orderId,
      status,
      issueDateFrom,
      issueDateTo,
      page = 1,
      limit = 10,
    } = queryDto;

    const filter: any = {};

    // Role-based filtering
    if (userRole === 'customer') {
      filter.customerId = userId;
    } else if (userRole === 'provider') {
      filter.providerId = userId;
    }

    // Apply additional filters
    if (customerId) filter.customerId = customerId;
    if (providerId) filter.providerId = providerId;
    if (orderId) filter.orderId = orderId;
    if (status) filter.status = status;

    if (issueDateFrom || issueDateTo) {
      filter.issueDate = {};
      if (issueDateFrom) filter.issueDate.$gte = new Date(issueDateFrom);
      if (issueDateTo) filter.issueDate.$lte = new Date(issueDateTo);
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .populate('customerId', 'firstName lastName email')
        .populate('providerId', 'firstName lastName email')
        .populate('orderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.invoiceModel.countDocuments(filter).exec(),
    ]);

    return {
      data: invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find invoice by ID
   */
  async findOne(id: string, userId: string, userRole: string): Promise<InvoiceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid invoice ID');
    }

    const invoice = await this.invoiceModel
      .findById(id)
      .populate('customerId', 'firstName lastName email')
      .populate('providerId', 'firstName lastName email')
      .populate('orderId')
      .exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check permissions
    if (
      userRole !== 'admin' &&
      invoice.customerId.toString() !== userId &&
      invoice.providerId.toString() !== userId
    ) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    return invoice;
  }

  /**
   * Find invoice by invoice number
   */
  async findByInvoiceNumber(
    invoiceNumber: string,
    userId: string,
    userRole: string,
  ): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel
      .findOne({ invoiceNumber })
      .populate('customerId', 'firstName lastName email')
      .populate('providerId', 'firstName lastName email')
      .populate('orderId')
      .exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check permissions
    if (
      userRole !== 'admin' &&
      invoice.customerId.toString() !== userId &&
      invoice.providerId.toString() !== userId
    ) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    return invoice;
  }

  /**
   * Update invoice
   */
  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    userId: string,
    userRole: string,
  ): Promise<InvoiceDocument> {
    const invoice = await this.findOne(id, userId, userRole);

    // Only provider can update invoice if it's in draft status
    if (invoice.status !== InvoiceStatusEnum.DRAFT) {
      if (
        updateInvoiceDto.status ||
        updateInvoiceDto.paymentInfo ||
        updateInvoiceDto.paidDate
      ) {
        // Allow status and payment updates for non-draft invoices
      } else {
        throw new BadRequestException(
          'Can only update draft invoices. Use status updates for sent invoices.',
        );
      }
    }

    // Check if user is the provider
    if (invoice.providerId.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException(
        'Only the provider can update this invoice',
      );
    }

    // Recalculate totals if line items changed
    if (updateInvoiceDto.lineItems) {
      const totals = this.calculateTotals(updateInvoiceDto.lineItems);
      Object.assign(updateInvoiceDto, totals);
    }

    // Update sent timestamp if status changed to sent
    if (
      updateInvoiceDto.status === InvoiceStatusEnum.SENT &&
      invoice.status !== InvoiceStatusEnum.SENT
    ) {
      updateInvoiceDto['sentAt'] = new Date();
    }

    // Update paid date if status changed to paid
    if (
      updateInvoiceDto.status === InvoiceStatusEnum.PAID &&
      invoice.status !== InvoiceStatusEnum.PAID
    ) {
      updateInvoiceDto.paidDate = new Date();
    }

    Object.assign(invoice, updateInvoiceDto);
    return invoice.save();
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(
    id: string,
    paymentInfo: any,
    userId: string,
    userRole: string,
  ): Promise<InvoiceDocument> {
    const invoice = await this.findOne(id, userId, userRole);

    if (invoice.status === InvoiceStatusEnum.PAID) {
      throw new BadRequestException('Invoice is already paid');
    }

    invoice.status = InvoiceStatusEnum.PAID;
    invoice.paidDate = new Date();
    invoice.paymentInfo = paymentInfo;

    return invoice.save();
  }

  /**
   * Cancel invoice
   */
  async cancel(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<InvoiceDocument> {
    const invoice = await this.findOne(id, userId, userRole);

    if (invoice.status === InvoiceStatusEnum.PAID) {
      throw new BadRequestException('Cannot cancel a paid invoice');
    }

    if (invoice.providerId.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Only the provider can cancel this invoice');
    }

    invoice.status = InvoiceStatusEnum.CANCELED;
    return invoice.save();
  }

  /**
   * Delete invoice (only drafts)
   */
  async remove(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    const invoice = await this.findOne(id, userId, userRole);

    if (invoice.status !== InvoiceStatusEnum.DRAFT) {
      throw new BadRequestException('Can only delete draft invoices');
    }

    if (invoice.providerId.toString() !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Only the provider can delete this invoice');
    }

    await this.invoiceModel.findByIdAndDelete(id).exec();
  }

  /**
   * Get invoice statistics for dashboard
   */
  async getStatistics(userId: string, userRole: string) {
    const filter: any = {};

    if (userRole === 'provider') {
      filter.providerId = userId;
    } else if (userRole === 'customer') {
      filter.customerId = userId;
    }

    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      pendingRevenue,
    ] = await Promise.all([
      this.invoiceModel.countDocuments(filter),
      this.invoiceModel.countDocuments({
        ...filter,
        status: InvoiceStatusEnum.PAID,
      }),
      this.invoiceModel.countDocuments({
        ...filter,
        status: { $in: [InvoiceStatusEnum.SENT, InvoiceStatusEnum.DRAFT] },
      }),
      this.invoiceModel.countDocuments({
        ...filter,
        status: InvoiceStatusEnum.OVERDUE,
      }),
      this.invoiceModel
        .aggregate([
          { $match: { ...filter, status: InvoiceStatusEnum.PAID } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ])
        .then((res) => res[0]?.total || 0),
      this.invoiceModel
        .aggregate([
          {
            $match: {
              ...filter,
              status: { $in: [InvoiceStatusEnum.SENT, InvoiceStatusEnum.OVERDUE] },
            },
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ])
        .then((res) => res[0]?.total || 0),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      pendingRevenue,
    };
  }
}
