import { IsEmail, IsString } from 'class-validator';
import type { LoginRequest } from '@domofix/shared-types';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
