import type { AcceptProviderRequest } from '@darigo/shared-types';
import { IsString, IsMongoId } from 'class-validator';

export class AcceptProviderDto implements AcceptProviderRequest {
  @IsString()
  @IsMongoId()
  providerId: string;
}