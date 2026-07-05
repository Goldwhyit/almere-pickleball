import { IsArray, IsString } from 'class-validator';

export class BookTrialDatesDto {
  @IsArray()
  @IsString({ each: true })
  dates!: string[];
}
