import { Controller, Post, Body, Get, UseGuards, Request, Req, Param, Query, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, OAuthLoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    return this.authService.login(loginDto.email, loginDto.password, clientIp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Request email verification link (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('request-email-verification')
  async requestEmailVerification(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.authService.requestEmailVerification(userId);
  }

  // Verify email via token link
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // Forgot password
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // Reset password using token
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('oauth/:provider')
  async oauthLogin(
    @Param('provider') provider: 'facebook' | 'google',
    @Body() body: OAuthLoginDto,
    @Req() req: any,
  ) {
    const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    return this.authService.oauthLogin(provider, body, clientIp);
  }

  // Change password for authenticated user
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }
}
