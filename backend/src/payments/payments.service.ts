import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  async create(data: any) {
    return { success: true, payment: data };
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

  async confirmPayment(id: string) {
    return { id, confirmed: true };
  }

  async remove(id: string) {
    return { id, removed: true };
  }
}
