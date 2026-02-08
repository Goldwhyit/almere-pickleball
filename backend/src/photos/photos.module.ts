import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PhotosController } from "./photos.controller";
import { PhotosService } from "./photos.service";

@Module({
  imports: [PrismaModule],
  providers: [PhotosService],
  controllers: [PhotosController],
  exports: [PhotosService],
})
export class PhotosModule {}
