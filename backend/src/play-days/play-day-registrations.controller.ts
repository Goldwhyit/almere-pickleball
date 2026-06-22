import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PlayDayRegistrationsService } from './play-day-registrations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('play-days')
@UseGuards(JwtAuthGuard)
export class PlayDayRegistrationsController {
  constructor(private readonly playDayRegistrationsService: PlayDayRegistrationsService) {}

  @Post('register')
  create(@Body() data: any) {
    return this.playDayRegistrationsService.create(data);
  }

  @Get('my-registrations')
  findAll() {
    return this.playDayRegistrationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playDayRegistrationsService.findOne(id);
  }

  @Delete('registrations/:id')
  remove(@Param('id') id: string) {
    return this.playDayRegistrationsService.remove(id);
  }
}
