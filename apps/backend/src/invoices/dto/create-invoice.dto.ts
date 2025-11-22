import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  Min,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  InvoiceStatusEnum,
  PaymentMethodEnum,
} from '../schemas/invoice.schema';

export class CreateInvoiceLineItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsEnum(['amount', 'percentage'])
  @IsOptional()
  discountType?: string;
}

export class CreateBillingAddressDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;
}

export class CreatePaymentInfoDto {
  @IsEnum(PaymentMethodEnum)
  @IsOptional()
  method?: PaymentMethodEnum;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  paidAt?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateInvoiceDto {
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ValidateNested()
  @Type(() => CreateBillingAddressDto)
  billTo: CreateBillingAddressDto;

  @ValidateNested()
  @Type(() => CreateBillingAddressDto)
  billFrom: CreateBillingAddressDto;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  issueDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemDto)
  lineItems: CreateInvoiceLineItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsEnum(InvoiceStatusEnum)
  @IsOptional()
  status?: InvoiceStatusEnum;
}
