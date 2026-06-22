import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayDayRegistrationsService {
  async create(data: any) {
    return { success: true, registration: data };
  }

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return { id };
  }

  async remove(id: string) {
    return { id, removed: true };
  }
}
