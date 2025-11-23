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
  DocumentTypeEnum,
} from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import PDFDocument from 'pdfkit';

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
   * Generate unique invoice or quote number
   * Handles race conditions by finding the highest existing number
   */
  private async generateInvoiceNumber(documentType: DocumentTypeEnum = DocumentTypeEnum.INVOICE): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = documentType === DocumentTypeEnum.QUOTE ? 'QUOTE' : 'INV';
    const prefixPattern = `${prefix}-${year}-`;

    // Find all invoices of this type and year
    const invoices = await this.invoiceModel
      .find({
        documentType,
        invoiceNumber: { $regex: `^${prefixPattern}` },
      })
      .select('invoiceNumber')
      .exec();

    let nextNumber = 1;
    if (invoices.length > 0) {
      // Extract all numbers and find the maximum
      const numbers = invoices
        .map(inv => {
          const numberStr = inv.invoiceNumber.replace(prefixPattern, '');
          return parseInt(numberStr, 10);
        })
        .filter(num => !isNaN(num));

      if (numbers.length > 0) {
        const maxNumber = Math.max(...numbers);
        nextNumber = maxNumber + 1;
      }
    }

    const number = `${prefix}-${year}-${String(nextNumber).padStart(6, '0')}`;
    return number;
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
   * Create a new invoice or quote
   */
  async create(
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
  ): Promise<Invoice> {
    let order = null;
    let customerIdToSave: any;
    let providerIdToSave: any = new Types.ObjectId(userId); // Provider is the current user - CONVERT TO ObjectId!

    // Determine document type first
    const documentType = createInvoiceDto.documentType || DocumentTypeEnum.INVOICE;

    // For invoices, orderId is required. For quotes, it's optional
    if (documentType === DocumentTypeEnum.INVOICE && !createInvoiceDto.orderId) {
      throw new BadRequestException(
        'orderId is required for invoices',
      );
    }

    // Process orderId if provided
    if (createInvoiceDto.orderId) {
      // Validate order exists
      order = await this.orderModel
        .findById(createInvoiceDto.orderId)
        .populate('customerId')
        .populate('providerId')
        .exec();

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Check if user is the provider of this order
      const providerIdStr = typeof order.providerId === 'object' && order.providerId
        ? (order.providerId as any)._id.toString()
        : (order.providerId as any).toString();

      if (providerIdStr !== userId) {
        throw new ForbiddenException(
          'Only the provider can create an invoice for this order',
        );
      }

      // Check if invoice already exists for this order (only for invoices, not quotes)
      if (documentType === DocumentTypeEnum.INVOICE) {
        const existingInvoice = await this.invoiceModel
          .findOne({ orderId: createInvoiceDto.orderId, documentType: DocumentTypeEnum.INVOICE })
          .exec();

        if (existingInvoice) {
          throw new BadRequestException(
            'An invoice already exists for this order',
          );
        }
      }

      // Extract IDs from populated fields
      customerIdToSave = typeof order.customerId === 'object' && order.customerId
        ? (order.customerId as any)._id
        : order.customerId;
      providerIdToSave = typeof order.providerId === 'object' && order.providerId
        ? (order.providerId as any)._id
        : order.providerId;
    } else if (createInvoiceDto.customerId) {
      // For quotes without order, use provided customerId
      customerIdToSave = createInvoiceDto.customerId;
    }
    // For standalone quotes without orderId or customerId, customerIdToSave remains null

    // Calculate totals
    const totals = this.calculateTotals(createInvoiceDto.lineItems);

    // Create invoice/quote with retry logic for duplicate invoice numbers
    let savedInvoice: InvoiceDocument;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        // Generate invoice/quote number
        const invoiceNumber = await this.generateInvoiceNumber(documentType);

        console.log('[InvoicesService.create] Creating document (attempt', attempts + 1, '):', {
          invoiceNumber,
          documentType,
          orderId: createInvoiceDto.orderId || null,
          customerId: customerIdToSave,
          providerId: providerIdToSave,
        });

        // Create invoice/quote
        const invoice = new this.invoiceModel({
          invoiceNumber,
          documentType,
          orderId: createInvoiceDto.orderId || null,
          customerId: customerIdToSave || null,
          providerId: providerIdToSave,
          billTo: createInvoiceDto.billTo,
          billFrom: createInvoiceDto.billFrom,
          issueDate: createInvoiceDto.issueDate || new Date(),
          dueDate: createInvoiceDto.dueDate,
          expiryDate: createInvoiceDto.expiryDate, // Pour devis uniquement
          lineItems: createInvoiceDto.lineItems,
          notes: createInvoiceDto.notes,
          termsAndConditions: createInvoiceDto.termsAndConditions,
          taxId: createInvoiceDto.taxId,
          status: createInvoiceDto.status || InvoiceStatusEnum.DRAFT,
          ...totals,
        });

        savedInvoice = await invoice.save();
        break; // Success, exit loop
      } catch (error: any) {
        // Check if it's a duplicate key error
        if (error.code === 11000 && error.message?.includes('invoiceNumber')) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw new BadRequestException(
              'Failed to generate unique invoice number after multiple attempts. Please try again.',
            );
          }
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        }
        // If it's not a duplicate key error, rethrow
        throw error;
      }
    }
    console.log('[InvoicesService.create] Document saved successfully:', {
      id: savedInvoice._id,
      invoiceNumber: savedInvoice.invoiceNumber,
      documentType: savedInvoice.documentType,
    });

    return savedInvoice;
  }

  /**
   * Find all invoices with filters
   */
  async findAll(queryDto: QueryInvoiceDto, userId: string, userRole: string) {
    const {
      customerId,
      providerId,
      orderId,
      documentType,
      status,
      issueDateFrom,
      issueDateTo,
      page = 1,
      limit = 10,
    } = queryDto;

    const filter: any = {};

    console.log('[InvoicesService.findAll] Called with:', { userId, userRole, queryDto });

    // Build the main filter
    const roleFilter: any = {};

    // Role-based filtering - Support both ObjectId and string (for backwards compatibility)
    if (userRole === 'customer') {
      roleFilter.customerId = new Types.ObjectId(userId);
    } else if (userRole === 'provider') {
      // Search for both ObjectId and string versions of providerId
      roleFilter.$or = [
        { providerId: new Types.ObjectId(userId) },
        { providerId: userId }, // For old records stored as strings
      ];
    }

    // Apply additional filters
    if (customerId) filter.customerId = customerId;
    if (providerId) filter.providerId = providerId;
    if (orderId) filter.orderId = orderId;
    if (documentType) filter.documentType = documentType;
    if (status) filter.status = status;

    if (issueDateFrom || issueDateTo) {
      filter.issueDate = {};
      if (issueDateFrom) filter.issueDate.$gte = new Date(issueDateFrom);
      if (issueDateTo) filter.issueDate.$lte = new Date(issueDateTo);
    }

    // Combine role filter with other filters
    const finalFilter = Object.keys(filter).length > 0
      ? { $and: [roleFilter, filter] }
      : roleFilter;

    console.log('[InvoicesService.findAll] Final filter:', JSON.stringify(finalFilter, null, 2));

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.invoiceModel
        .find(finalFilter)
        .populate('customerId', 'firstName lastName email')
        .populate('providerId', 'firstName lastName email')
        .populate('orderId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.invoiceModel.countDocuments(finalFilter).exec(),
    ]);

    console.log('[InvoicesService.findAll] Found invoices:', invoices.length, 'Total:', total);
    console.log('[InvoicesService.findAll] Returned docs:', invoices.map(inv => ({
      id: inv._id,
      number: inv.invoiceNumber,
      type: inv.documentType,
      status: inv.status,
      customerId: inv.customerId,
      providerId: inv.providerId,
    })));

    // Debug: Check all docs for this provider with both string and ObjectId
    const allProviderDocs = await this.invoiceModel
      .find(roleFilter)
      .select('invoiceNumber documentType status customerId providerId')
      .exec();
    console.log('[InvoicesService.findAll] ALL docs for this provider (including string IDs):', allProviderDocs.map(doc => ({
      number: doc.invoiceNumber,
      type: doc.documentType,
      status: doc.status,
      providerId: doc.providerId,
      providerIdType: typeof doc.providerId,
      customerId: doc.customerId?.toString() || 'null',
    })));

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
    const customerIdStr = invoice.customerId
      ? (typeof invoice.customerId === 'object' && invoice.customerId
        ? ((invoice.customerId as any)._id?.toString() || (invoice.customerId as any).toString())
        : (invoice.customerId as any).toString())
      : null;
    const providerIdStr = typeof invoice.providerId === 'object' && invoice.providerId
      ? ((invoice.providerId as any)._id?.toString() || (invoice.providerId as any).toString())
      : (invoice.providerId as any).toString();

    if (
      userRole !== 'admin' &&
      customerIdStr !== userId &&
      providerIdStr !== userId
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
    const customerIdStr = invoice.customerId
      ? (typeof invoice.customerId === 'object' && invoice.customerId
        ? ((invoice.customerId as any)._id?.toString() || (invoice.customerId as any).toString())
        : (invoice.customerId as any).toString())
      : null;
    const providerIdStr = typeof invoice.providerId === 'object' && invoice.providerId
      ? ((invoice.providerId as any)._id?.toString() || (invoice.providerId as any).toString())
      : (invoice.providerId as any).toString();

    if (
      userRole !== 'admin' &&
      customerIdStr !== userId &&
      providerIdStr !== userId
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
    const providerIdStr = typeof invoice.providerId === 'object' && invoice.providerId
      ? ((invoice.providerId as any)._id?.toString() || (invoice.providerId as any).toString())
      : (invoice.providerId as any).toString();

    if (providerIdStr !== userId && userRole !== 'admin') {
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

  /**
   * Generate PDF for invoice
   */
  async generatePdf(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<Buffer> {
    const invoice = await this.findOne(id, userId, userRole);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header - Different for quote vs invoice
        const documentTitle = invoice.documentType === DocumentTypeEnum.QUOTE ? 'DEVIS' : 'FACTURE';
        doc
          .fontSize(28)
          .font('Helvetica-Bold')
          .text(documentTitle, 50, 50);

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`#${invoice.invoiceNumber}`, 50, 85);

        // Status badge - Include quote-specific statuses
        const statusLabels = {
          draft: 'BROUILLON',
          sent: 'ENVOYÉE',
          accepted: 'ACCEPTÉE',
          rejected: 'REJETÉE',
          expired: 'EXPIRÉE',
          paid: 'PAYÉE',
          overdue: 'EN RETARD',
          canceled: 'ANNULÉE',
          refunded: 'REMBOURSÉE',
        };

        doc
          .fontSize(10)
          .text(statusLabels[invoice.status] || invoice.status.toUpperCase(), 450, 50, {
            width: 100,
            align: 'right',
          });

        // Dates
        let dateY = 70;
        doc
          .fontSize(9)
          .text(`Date d'émission :`, 370, dateY, { continued: true })
          .text(` ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}`, { align: 'right' });

        dateY += 15;
        doc
          .text(`Date d'échéance :`, 370, dateY, { continued: true })
          .text(` ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, { align: 'right' });

        // Show expiry date for quotes
        if (invoice.documentType === DocumentTypeEnum.QUOTE && invoice.expiryDate) {
          dateY += 15;
          doc
            .text(`Date d'expiration :`, 370, dateY, { continued: true })
            .text(` ${new Date(invoice.expiryDate).toLocaleDateString('fr-FR')}`, { align: 'right' });
        }

        // Show accepted date for quotes
        if (invoice.documentType === DocumentTypeEnum.QUOTE && invoice.acceptedDate) {
          dateY += 15;
          doc
            .text(`Date d'acceptation :`, 370, dateY, { continued: true })
            .text(` ${new Date(invoice.acceptedDate).toLocaleDateString('fr-FR')}`, { align: 'right' });
        }

        if (invoice.paidDate) {
          dateY += 15;
          doc
            .text(`Date de paiement :`, 370, dateY, { continued: true })
            .text(` ${new Date(invoice.paidDate).toLocaleDateString('fr-FR')}`, { align: 'right' });
        }

        // Line
        doc
          .moveTo(50, 120)
          .lineTo(550, 120)
          .stroke();

        // Bill From & Bill To
        let yPosition = 140;

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('FACTURER DE', 50, yPosition);

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('FACTURER À', 320, yPosition);

        yPosition += 15;

        // Bill From
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(invoice.billFrom.fullName, 50, yPosition);

        if (invoice.billFrom.companyName) {
          yPosition += 15;
          doc.font('Helvetica').text(invoice.billFrom.companyName, 50, yPosition);
        }

        yPosition += 15;
        doc.font('Helvetica').text(invoice.billFrom.street, 50, yPosition);
        yPosition += 15;
        doc.text(`${invoice.billFrom.city}, ${invoice.billFrom.state || ''} ${invoice.billFrom.zipCode}`, 50, yPosition);
        yPosition += 15;
        doc.text(invoice.billFrom.country, 50, yPosition);

        if (invoice.billFrom.phone) {
          yPosition += 15;
          doc.text(invoice.billFrom.phone, 50, yPosition);
        }

        if (invoice.billFrom.email) {
          yPosition += 15;
          doc.text(invoice.billFrom.email, 50, yPosition);
        }

        // Bill To
        yPosition = 155;

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(invoice.billTo.fullName, 320, yPosition);

        if (invoice.billTo.companyName) {
          yPosition += 15;
          doc.font('Helvetica').text(invoice.billTo.companyName, 320, yPosition);
        }

        yPosition += 15;
        doc.font('Helvetica').text(invoice.billTo.street, 320, yPosition);
        yPosition += 15;
        doc.text(`${invoice.billTo.city}, ${invoice.billTo.state || ''} ${invoice.billTo.zipCode}`, 320, yPosition);
        yPosition += 15;
        doc.text(invoice.billTo.country, 320, yPosition);

        if (invoice.billTo.phone) {
          yPosition += 15;
          doc.text(invoice.billTo.phone, 320, yPosition);
        }

        if (invoice.billTo.email) {
          yPosition += 15;
          doc.text(invoice.billTo.email, 320, yPosition);
        }

        // Line Items Table
        yPosition = 320;

        // Table headers
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Description', 50, yPosition)
          .text('Qté', 300, yPosition, { width: 40, align: 'center' })
          .text('Prix', 340, yPosition, { width: 50, align: 'right' })
          .text('TVA', 390, yPosition, { width: 40, align: 'right' })
          .text('Remise', 430, yPosition, { width: 50, align: 'right' })
          .text('Montant', 480, yPosition, { width: 70, align: 'right' });

        yPosition += 20;

        // Draw line under headers
        doc
          .moveTo(50, yPosition - 5)
          .lineTo(550, yPosition - 5)
          .stroke();

        // Line items
        doc.font('Helvetica');

        invoice.lineItems.forEach((item) => {
          const itemTotal = item.quantity * item.unitPrice;
          let discount = 0;

          if (item.discount && item.discount > 0) {
            discount =
              item.discountType === 'percentage'
                ? (itemTotal * item.discount) / 100
                : item.discount;
          }

          const afterDiscount = itemTotal - discount;
          const tax = (afterDiscount * (item.taxRate || 0)) / 100;
          const lineTotal = afterDiscount + tax;

          doc
            .text(item.description, 50, yPosition, { width: 240 })
            .text(item.quantity.toString(), 300, yPosition, { width: 40, align: 'center' })
            .text(`${item.unitPrice.toFixed(3)} DT`, 340, yPosition, { width: 50, align: 'right' })
            .text(`${item.taxRate || 0}%`, 390, yPosition, { width: 40, align: 'right' })
            .text(
              item.discount
                ? `${item.discount}${item.discountType === 'percentage' ? '%' : ' DT'}`
                : '-',
              430,
              yPosition,
              { width: 50, align: 'right' }
            )
            .text(`${lineTotal.toFixed(3)} DT`, 480, yPosition, { width: 70, align: 'right' });

          yPosition += 20;
        });

        // Totals section
        yPosition += 20;

        doc
          .moveTo(350, yPosition)
          .lineTo(550, yPosition)
          .stroke();

        yPosition += 15;

        doc
          .text('Sous-total :', 350, yPosition)
          .text(`${invoice.subtotal.toFixed(3)} DT`, 480, yPosition, { width: 70, align: 'right' });

        if (invoice.discountAmount > 0) {
          yPosition += 15;
          doc
            .text('Remise :', 350, yPosition)
            .text(`-${invoice.discountAmount.toFixed(3)} DT`, 480, yPosition, { width: 70, align: 'right' });
        }

        if (invoice.taxAmount > 0) {
          yPosition += 15;
          doc
            .text('TVA :', 350, yPosition)
            .text(`${invoice.taxAmount.toFixed(3)} DT`, 480, yPosition, { width: 70, align: 'right' });
        }

        yPosition += 20;

        doc
          .moveTo(350, yPosition - 5)
          .lineTo(550, yPosition - 5)
          .stroke();

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Total :', 350, yPosition)
          .text(`${invoice.totalAmount.toFixed(3)} DT`, 480, yPosition, { width: 70, align: 'right' });

        // Notes and Terms
        yPosition += 40;

        if (invoice.taxId) {
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Numéro de TVA', 50, yPosition);
          yPosition += 15;
          doc.font('Helvetica').text(invoice.taxId, 50, yPosition);
          yPosition += 25;
        }

        if (invoice.notes) {
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Notes', 50, yPosition);
          yPosition += 15;
          doc.font('Helvetica').text(invoice.notes, 50, yPosition, { width: 500 });
          yPosition += doc.heightOfString(invoice.notes, { width: 500 }) + 15;
        }

        if (invoice.termsAndConditions) {
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Conditions générales', 50, yPosition);
          yPosition += 15;
          doc
            .font('Helvetica')
            .text(invoice.termsAndConditions, 50, yPosition, { width: 500 });
        }

        // Footer
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
            50,
            750,
            { align: 'center', width: 500 }
          )
          .text('Merci pour votre confiance !', 50, 765, { align: 'center', width: 500 });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convert a quote to an invoice
   */
  async convertQuoteToInvoice(
    quoteId: string,
    userId: string,
    userRole: string,
  ): Promise<InvoiceDocument> {
    // Find the quote
    const quote = await this.findOne(quoteId, userId, userRole);

    // Validate it's a quote
    if (quote.documentType !== DocumentTypeEnum.QUOTE) {
      throw new BadRequestException('Only quotes can be converted to invoices');
    }

    // Check if quote is accepted
    if (quote.status !== InvoiceStatusEnum.ACCEPTED) {
      throw new BadRequestException('Only accepted quotes can be converted to invoices');
    }

    // Check if already converted
    if (quote.convertedToInvoiceId) {
      throw new BadRequestException('This quote has already been converted to an invoice');
    }

    // Check permissions - only provider can convert
    const providerIdStr = typeof quote.providerId === 'object' && quote.providerId
      ? ((quote.providerId as any)._id?.toString() || (quote.providerId as any).toString())
      : (quote.providerId as any).toString();

    if (providerIdStr !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Only the provider can convert this quote to an invoice');
    }

    // Generate new invoice number
    const invoiceNumber = await this.generateInvoiceNumber(DocumentTypeEnum.INVOICE);

    // Create new invoice from quote
    const invoice = new this.invoiceModel({
      invoiceNumber,
      documentType: DocumentTypeEnum.INVOICE,
      orderId: quote.orderId,
      customerId: quote.customerId,
      providerId: quote.providerId,
      billTo: quote.billTo,
      billFrom: quote.billFrom,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      lineItems: quote.lineItems,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      discountAmount: quote.discountAmount,
      totalAmount: quote.totalAmount,
      notes: quote.notes,
      termsAndConditions: quote.termsAndConditions,
      taxId: quote.taxId,
      status: InvoiceStatusEnum.DRAFT,
    });

    const savedInvoice = await invoice.save();

    // Update the quote with the invoice reference
    quote.convertedToInvoiceId = savedInvoice._id;
    await quote.save();

    return savedInvoice;
  }

  /**
   * Accept a quote (customer only)
   */
  async acceptQuote(
    quoteId: string,
    userId: string,
    userRole: string,
  ): Promise<InvoiceDocument> {
    const quote = await this.findOne(quoteId, userId, userRole);

    // Validate it's a quote
    if (quote.documentType !== DocumentTypeEnum.QUOTE) {
      throw new BadRequestException('Only quotes can be accepted');
    }

    // Check if already accepted/rejected
    if (quote.status === InvoiceStatusEnum.ACCEPTED) {
      throw new BadRequestException('This quote has already been accepted');
    }
    if (quote.status === InvoiceStatusEnum.REJECTED) {
      throw new BadRequestException('This quote has been rejected');
    }

    // Check permissions - only customer can accept
    const customerIdStr = typeof quote.customerId === 'object' && quote.customerId
      ? ((quote.customerId as any)._id?.toString() || (quote.customerId as any).toString())
      : (quote.customerId as any).toString();

    if (customerIdStr !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Only the customer can accept this quote');
    }

    // Update quote status
    quote.status = InvoiceStatusEnum.ACCEPTED;
    quote.acceptedDate = new Date();

    return quote.save();
  }

  /**
   * Reject a quote (customer only)
   */
  async rejectQuote(
    quoteId: string,
    userId: string,
    userRole: string,
  ): Promise<InvoiceDocument> {
    const quote = await this.findOne(quoteId, userId, userRole);

    // Validate it's a quote
    if (quote.documentType !== DocumentTypeEnum.QUOTE) {
      throw new BadRequestException('Only quotes can be rejected');
    }

    // Check if already accepted/rejected
    if (quote.status === InvoiceStatusEnum.ACCEPTED) {
      throw new BadRequestException('This quote has already been accepted');
    }
    if (quote.status === InvoiceStatusEnum.REJECTED) {
      throw new BadRequestException('This quote has already been rejected');
    }

    // Check permissions - only customer can reject
    const customerIdStr = typeof quote.customerId === 'object' && quote.customerId
      ? ((quote.customerId as any)._id?.toString() || (quote.customerId as any).toString())
      : (quote.customerId as any).toString();

    if (customerIdStr !== userId && userRole !== 'admin') {
      throw new ForbiddenException('Only the customer can reject this quote');
    }

    // Update quote status
    quote.status = InvoiceStatusEnum.REJECTED;

    return quote.save();
  }
}
