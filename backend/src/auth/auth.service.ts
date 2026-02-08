import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { member: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      accountType: user.member?.accountType || 'MEMBER',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        member: user.member,
      },
    };
  }

  /**
   * Generate a signed JWT access token for a user
   */
  generateAccessToken(
    userId: string,
    email: string,
    accountType: string,
  ): string {
    return this.jwtService.sign({ sub: userId, email, accountType });
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      throw new Error('Invalid token');
    }
  }
}
