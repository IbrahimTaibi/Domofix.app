import { IsArray, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateReviewDto {
  @IsMongoId()
  bookingId: string

  @IsMongoId()
  customerId: string

  @IsMongoId()
  providerId: string

  @IsMongoId()
  serviceId: string

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @IsOptional()
  @IsString()
  comment?: string

  @IsOptional()
  @IsArray()
  images?: string[]
}
