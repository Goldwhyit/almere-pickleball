import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        member: {
            id: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date | null;
            phone: string | null;
            address: string | null;
            membershipType: string;
            membershipStart: Date;
            membershipEnd: Date | null;
            duprRating: import("@prisma/client/runtime/library").Decimal;
            skillLevel: string;
            playPreferences: import("@prisma/client/runtime/library").JsonValue | null;
            profilePhotoUrl: string | null;
            userId: string;
        };
    }>;
}
export {};
