import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password required');
    }

    try {
      const email = body.email.trim().toLowerCase();
      console.log(`[AUTH] login attempt`, { email });
      return await this.authService.login(email, body.password);
    } catch (error: any) {
      console.warn('[AUTH] login failed', { email: body.email, reason: error?.message });
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
