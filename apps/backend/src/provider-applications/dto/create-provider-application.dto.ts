import { IsString, IsOptional, MinLength } from 'class-validator';
import type { CreateProviderApplicationRequest } from '@darigo/shared-types';

export class CreateProviderApplicationDto
  implements CreateProviderApplicationRequest
{
  @IsString()
  @MinLength(2)
  businessName: string;

  @IsString()
  @MinLength(6)
  phone: string;

  @IsString()
  @MinLength(2)
  category: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
