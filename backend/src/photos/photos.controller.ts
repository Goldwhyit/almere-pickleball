import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import * as fs from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreatePhotoDto, UpdatePhotoDto } from "./dtos";
import { PhotosService } from "./photos.service";

@Controller("photos")
export class PhotosController {
  constructor(private photosService: PhotosService) {}

  // Public endpoint - get all active photos
  @Get()
  findAll() {
    return this.photosService.findAll();
  }

  // Admin endpoint - get all photos including inactive
  @UseGuards(JwtAuthGuard)
  @Get("admin/all")
  findAllIncludingInactive() {
    return this.photosService.findAllIncludingInactive();
  }

  // Admin endpoint - create photo
  @UseGuards(JwtAuthGuard)
  @Post("admin")
  create(@Body() createPhotoDto: CreatePhotoDto) {
    return this.photosService.create(createPhotoDto);
  }

  // Admin endpoint - upload photo file
  @UseGuards(JwtAuthGuard)
  @Post("admin/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (
          req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          const uploadDir = join(process.cwd(), "uploads", "photos");
          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (
          req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (!file.mimetype.startsWith("image/")) {
          return cb(
            new BadRequestException(
              "Alleen afbeeldingsbestanden zijn toegestaan",
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) {
      throw new BadRequestException("Geen bestand geüpload");
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return {
      imageUrl: `${baseUrl}/uploads/photos/${file.filename}`,
      filename: file.filename,
    };
  }

  // Admin endpoint - update photo
  @UseGuards(JwtAuthGuard)
  @Patch("admin/:id")
  update(@Param("id") id: string, @Body() updatePhotoDto: UpdatePhotoDto) {
    return this.photosService.update(id, updatePhotoDto);
  }

  // Admin endpoint - delete photo
  @UseGuards(JwtAuthGuard)
  @Delete("admin/:id")
  remove(@Param("id") id: string) {
    return this.photosService.remove(id);
  }

  // Admin endpoint - toggle active status
  @UseGuards(JwtAuthGuard)
  @Patch("admin/:id/toggle")
  toggleActive(@Param("id") id: string) {
    return this.photosService.toggleActive(id);
  }

  // Admin endpoint - reorder photos
  @UseGuards(JwtAuthGuard)
  @Post("admin/reorder")
  reorder(@Body() photos: Array<{ id: string; order: number }>) {
    return this.photosService.reorder(photos);
  }

  // Test endpoint - create sample photos (for development only)
  @Post("test/seed")
  async seedPhotos() {
    const samplePhotos = [
      {
        title: "Pickleball Match",
        alt: "Spelers spelen pickleball",
        imageUrl: "https://via.placeholder.com/300?text=Pickleball+1",
      },
      {
        title: "Team Training",
        alt: "Team training sessie",
        imageUrl: "https://via.placeholder.com/300?text=Training",
      },
      {
        title: "Club Event",
        alt: "Club evenement",
        imageUrl: "https://via.placeholder.com/300?text=Event",
      },
    ];

    const created = await Promise.all(
      samplePhotos.map((photo) => this.photosService.create(photo)),
    );

    return {
      message: "Sample photos created",
      count: created.length,
      photos: created,
    };
  }
}
