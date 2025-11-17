import { IsOptional, IsString } from 'class-validator';

export class StartOrderDto {
  @IsOptional()
  @IsString()
  note?: string;
}
