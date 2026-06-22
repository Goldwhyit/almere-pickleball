import { Injectable } from '@nestjs/common';

@Injectable()
export class TournamentsService {
  async create(data: any) {
    return { success: true };
  }

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return { id };
  }

  async update(id: string, data: any) {
    return { id, ...data };
  }

  async remove(id: string) {
    return { id, removed: true };
  }
}
