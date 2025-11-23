import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto, CreatePaymentInfoDto } from './create-invoice.dto';
import {
  IsEnum,
  IsOptional,
  ValidateNested,
  IsDate,
  IsString,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatusEnum } from '../schemas/invoice.schema';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsEnum(InvoiceStatusEnum)
  @IsOptional()
  status?: InvoiceStatusEnum;

  @ValidateNested()
  @Type(() => CreatePaymentInfoDto)
  @IsOptional()
  paymentInfo?: CreatePaymentInfoDto;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  paidDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  acceptedDate?: Date; // Pour devis uniquement

  @IsMongoId()
  @IsOptional()
  convertedToInvoiceId?: string; // Si devis converti en facture

  @IsString()
  @IsOptional()
  pdfUrl?: string;
}
