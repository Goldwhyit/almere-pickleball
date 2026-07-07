import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_SETTINGS: Record<string, string> = {
  yearly_discount_percentage: '10',
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(key: string) {
    const setting = await this.prisma.appSetting.findUnique({ where: { key } });
    return { key, value: setting?.value ?? DEFAULT_SETTINGS[key] ?? null };
  }

  async set(key: string, value: string) {
    const setting = await this.prisma.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return { key: setting.key, value: setting.value };
  }
}
