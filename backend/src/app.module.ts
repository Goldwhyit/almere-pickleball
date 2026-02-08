import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { MembershipsModule } from "./memberships/memberships.module";
import { PhotosModule } from "./photos/photos.module";
import { PrismaModule } from "./prisma/prisma.module";
import { TrialLessonsModule } from "./trial-lessons/trial-lessons.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    PrismaModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev-secret",
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || "24h" },
    }),
    AuthModule,
    TrialLessonsModule,
    MembershipsModule,
    AdminModule,
    PhotosModule,
  ],
})
export class AppModule {}
