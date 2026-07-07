import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { member: true },
    });

    if (!user) {
      throw new UnauthorizedException('Ongeldige inloggegevens');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Dit account is gedeactiveerd');
    }

    const isValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Ongeldige inloggegevens');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const { password, ...userSafe } = user;
    return { accessToken, refreshToken, user: userSafe };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        role: 'MEMBER',
        isActive: true,
      },
      include: { member: true },
    });
    const { password, ...userSafe } = user;
    return userSafe;
  }

  async forgotPassword(email: string) {
    return { success: true, message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    return { success: true, message: 'Password reset successful' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    return { success: true, message: 'Password changed successfully' };
  }

  async refreshToken(refreshToken: string) {
    const decoded = this.jwtService.verify(refreshToken);
    const payload = { sub: decoded.sub, email: decoded.email, role: decoded.role };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
