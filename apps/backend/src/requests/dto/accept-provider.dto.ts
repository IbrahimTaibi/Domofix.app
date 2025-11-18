import type { AcceptProviderRequest } from '@domofix/shared-types';
import { IsString, IsMongoId } from 'class-validator';

export class AcceptProviderDto implements AcceptProviderRequest {
  @IsString()
  @IsMongoId()
  providerId: string;
}
