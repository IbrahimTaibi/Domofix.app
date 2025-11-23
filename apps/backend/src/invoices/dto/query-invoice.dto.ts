import { IsEnum, IsOptional, IsMongoId, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatusEnum, DocumentTypeEnum } from '../schemas/invoice.schema';

export class QueryInvoiceDto {
  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @IsMongoId()
  @IsOptional()
  providerId?: string;

  @IsMongoId()
  @IsOptional()
  orderId?: string;

  @IsEnum(DocumentTypeEnum)
  @IsOptional()
  documentType?: DocumentTypeEnum;

  @IsEnum(InvoiceStatusEnum)
  @IsOptional()
  status?: InvoiceStatusEnum;

  @IsDateString()
  @IsOptional()
  issueDateFrom?: string;

  @IsDateString()
  @IsOptional()
  issueDateTo?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
