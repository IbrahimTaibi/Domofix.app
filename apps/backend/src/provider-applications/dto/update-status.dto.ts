import { IsEnum } from 'class-validator';

export class UpdateProviderApplicationStatusDto {
  @IsEnum(['pending', 'approved', 'rejected', 'needs_info'])
  status: 'pending' | 'approved' | 'rejected' | 'needs_info';
}