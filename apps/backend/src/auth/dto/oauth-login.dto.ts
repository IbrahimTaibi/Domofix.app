import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';

export class OAuthLoginDto {
  @IsEnum(['facebook', 'google'])
  provider: 'facebook' | 'google';

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;
}