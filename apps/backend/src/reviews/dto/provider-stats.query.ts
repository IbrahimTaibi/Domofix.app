import { IsMongoId, IsOptional } from 'class-validator';

export class ProviderStatsQueryDto {
  @IsOptional()
  @IsMongoId()
  providerId?: string;
}
