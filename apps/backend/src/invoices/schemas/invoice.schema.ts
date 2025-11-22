import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

export enum InvoiceStatusEnum {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

export enum PaymentMethodEnum {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_PAYMENT = 'mobile_payment',
  OTHER = 'other',
}

@Schema({ _id: false })
export class InvoiceLineItem {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ default: 0 })
  taxRate: number; // Percentage (e.g., 20 for 20%)

  @Prop({ default: 0 })
  discount: number; // Amount or percentage based on discountType

  @Prop({ enum: ['amount', 'percentage'], default: 'amount' })
  discountType: string;
}

@Schema({ _id: false })
export class BillingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ default: null })
  companyName?: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ default: null })
  state?: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ default: null })
  phone?: string;

  @Prop({ default: null })
  email?: string;
}

@Schema({ _id: false })
export class PaymentInfo {
  @Prop({ enum: Object.values(PaymentMethodEnum), default: null })
  method?: PaymentMethodEnum;

  @Prop({ default: null })
  transactionId?: string;

  @Prop({ default: null })
  paidAt?: Date;

  @Prop({ default: null })
  notes?: string;
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true, index: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  providerId: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(InvoiceStatusEnum),
    default: InvoiceStatusEnum.DRAFT,
    index: true,
  })
  status: InvoiceStatusEnum;

  // Billing details
  @Prop({ type: BillingAddress, required: true })
  billTo: BillingAddress;

  @Prop({ type: BillingAddress, required: true })
  billFrom: BillingAddress;

  // Invoice dates
  @Prop({ required: true, default: () => new Date() })
  issueDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ default: null })
  paidDate?: Date;

  // Line items
  @Prop({ type: [InvoiceLineItem], required: true })
  lineItems: InvoiceLineItem[];

  // Totals
  @Prop({ required: true, default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ required: true })
  totalAmount: number;

  // Payment information
  @Prop({ type: PaymentInfo, default: {} })
  paymentInfo: PaymentInfo;

  // Additional fields
  @Prop({ default: null })
  notes?: string;

  @Prop({ default: null })
  termsAndConditions?: string;

  @Prop({ default: null })
  taxId?: string; // Tax identification number for provider

  // Metadata
  @Prop({ default: null })
  pdfUrl?: string; // URL to generated PDF

  @Prop({ default: null })
  sentAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const InvoiceLineItemSchema = SchemaFactory.createForClass(InvoiceLineItem);
export const BillingAddressSchema = SchemaFactory.createForClass(BillingAddress);
export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes for efficient querying
InvoiceSchema.index({ customerId: 1, status: 1, issueDate: -1 });
InvoiceSchema.index({ providerId: 1, status: 1, issueDate: -1 });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ orderId: 1 });
InvoiceSchema.index({ dueDate: 1, status: 1 });
