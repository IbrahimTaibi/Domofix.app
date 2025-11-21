import type { Address } from '@domofix/shared-types';
import {
  IsOptional,
  IsString,
  IsISO8601,
  ValidateIf,
  IsDefined,
} from 'class-validator';
import { IsPhoneNumberFormat } from '@/common/validators/phone-number.validator';
import { IsFutureDate } from '@/common/validators/future-date.validator';

/**
 * DTO for creating a request directly from a provider service
 * The category and serviceId are automatically determined from the service
 */
export class CreateServiceRequestDto {
  // Provide address when location is absent
  @ValidateIf((o: any) => !o.location)
  @IsDefined({ message: 'Either address or location must be provided' })
  address?: Address;

  // Provide location when address is absent
  @ValidateIf((o: any) => !o.address)
  @IsDefined({ message: 'Either address or location must be provided' })
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };

  @IsString()
  @IsPhoneNumberFormat()
  phone: string;

  @IsISO8601()
  @IsFutureDate()
  estimatedTimeOfService: string;

  @IsOptional()
  @IsString()
  details?: string;
}
