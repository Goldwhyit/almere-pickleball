import { IsDateString } from 'class-validator';

export class BookTrialDateDto {
  @IsDateString()
  date!: string;
}
