import { IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class ListCommentsQueryDto {
  @IsOptional()
  @IsMongoId()
  parentCommentId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
