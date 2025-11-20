import type { ApplyForRequestRequest } from '@domofix/shared-types';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsISO8601,
  IsNumber,
  Min,
} from 'class-validator';

export class ApplyForRequestDto implements ApplyForRequestRequest {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsISO8601()
  proposedEts?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedPriceMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedPriceMax?: number;
}
