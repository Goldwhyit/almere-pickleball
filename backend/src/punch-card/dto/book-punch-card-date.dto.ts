import { IsDateString } from 'class-validator';

export class BookPunchCardDateDto {
  @IsDateString()
  date!: string;
}
