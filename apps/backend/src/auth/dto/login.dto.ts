import { IsEmail, IsString } from 'class-validator';
import type { LoginRequest } from '@darigo/shared-types';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
