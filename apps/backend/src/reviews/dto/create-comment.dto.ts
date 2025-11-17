import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsMongoId()
  reviewId: string;

  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;

  @IsString()
  content: string;
}
