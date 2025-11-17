import { IsOptional, IsString } from 'class-validator';

export class MarkReadDto {
  @IsOptional()
  @IsString()
  upToMessageId?: string;
}
