import type { ApplyForRequestRequest } from '@darigo/shared-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyForRequestDto implements ApplyForRequestRequest {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}