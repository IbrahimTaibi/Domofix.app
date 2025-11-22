import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsMongoId()
  reviewId?: string; // Made optional since it comes from URL params

  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;

  @IsString()
  @MinLength(1)
  content: string;
}
