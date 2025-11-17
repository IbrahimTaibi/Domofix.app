import {
  IsMongoId,
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class SendMessageDto {
  @IsIn(['text', 'image', 'file'])
  kind: 'text' | 'image' | 'file';

  @ValidateIf((o) => o.kind === 'text')
  @IsString()
  @MaxLength(2000)
  text?: string;

  @ValidateIf((o) => o.kind === 'image')
  @IsString()
  imageUrl?: string;

  @ValidateIf((o) => o.kind === 'file')
  @IsString()
  fileName?: string;

  @ValidateIf((o) => o.kind === 'file')
  @IsString()
  fileMime?: string;

  @ValidateIf((o) => o.kind === 'file')
  @IsOptional()
  fileSize?: number;
}
