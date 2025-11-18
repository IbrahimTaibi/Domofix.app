import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { ServiceStatus } from '../schemas/provider-service.schema';

export class QueryProviderServicesDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
