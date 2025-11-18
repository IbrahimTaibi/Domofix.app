import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  IsArray,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { PricingType, ServiceStatus } from '../schemas/provider-service.schema';

export class CreateProviderServiceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères' })
  @MaxLength(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, {
    message: 'La description doit contenir au moins 10 caractères',
  })
  @MaxLength(2000, {
    message: 'La description ne peut pas dépasser 2000 caractères',
  })
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(PricingType, {
    message: 'Le type de tarification doit être: fixed, hourly, range ou negotiable',
  })
  pricingType: PricingType;

  @ValidateIf((o) => o.pricingType === PricingType.FIXED || o.pricingType === PricingType.HOURLY)
  @IsNumber({}, { message: 'Le prix de base doit être un nombre' })
  @Min(0, { message: 'Le prix de base doit être positif' })
  basePrice?: number;

  @ValidateIf((o) => o.pricingType === PricingType.RANGE)
  @IsNumber({}, { message: 'Le prix minimum doit être un nombre' })
  @Min(0, { message: 'Le prix minimum doit être positif' })
  minPrice?: number;

  @ValidateIf((o) => o.pricingType === PricingType.RANGE)
  @IsNumber({}, { message: 'Le prix maximum doit être un nombre' })
  @Min(0, { message: 'Le prix maximum doit être positif' })
  maxPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(ServiceStatus, {
    message: 'Le statut doit être: active, inactive ou draft',
  })
  status?: ServiceStatus;

  @IsOptional()
  metadata?: Record<string, any>;
}
