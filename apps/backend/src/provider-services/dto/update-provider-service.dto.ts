import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderServiceDto } from './create-provider-service.dto';

export class UpdateProviderServiceDto extends PartialType(
  CreateProviderServiceDto,
) {}
