import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

export class ListMessagesQueryDto {
  @IsOptional()
  @IsString()
  before?: string; // ISO date to page backwards

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
