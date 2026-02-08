import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePhotoDto, UpdatePhotoDto } from "./dtos";

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async create(createPhotoDto: CreatePhotoDto) {
    const maxOrder = await this.prisma.photo.aggregate({
      _max: { order: true },
    });

    return this.prisma.photo.create({
      data: {
        ...createPhotoDto,
        isActive: true, // Explicitly set to active when creating
        order: (maxOrder._max.order || 0) + 1,
      },
    });
  }

  async findAll() {
    return this.prisma.photo.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  }

  async findAllIncludingInactive() {
    return this.prisma.photo.findMany({
      orderBy: { order: "asc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.photo.findUnique({
      where: { id },
    });
  }

  async update(id: string, updatePhotoDto: UpdatePhotoDto) {
    return this.prisma.photo.update({
      where: { id },
      data: updatePhotoDto,
    });
  }

  async remove(id: string) {
    return this.prisma.photo.delete({
      where: { id },
    });
  }

  async reorder(photos: Array<{ id: string; order: number }>) {
    const updates = photos.map((photo) =>
      this.prisma.photo.update({
        where: { id: photo.id },
        data: { order: photo.order },
      }),
    );
    return Promise.all(updates);
  }

  async toggleActive(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) {
      throw new BadRequestException("Foto niet gevonden");
    }
    return this.prisma.photo.update({
      where: { id },
      data: { isActive: !photo.isActive },
    });
  }
}
