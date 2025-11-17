import { IsMongoId, IsArray, ArrayMinSize, IsIn } from 'class-validator';

export class CreateThreadDto {
  @IsMongoId()
  orderId: string;

  @IsArray()
  @ArrayMinSize(2)
  participants: Array<{ userId: string; role: 'customer' | 'provider' }>;
}
