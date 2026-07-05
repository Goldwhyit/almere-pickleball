import { IsOptional, IsString } from 'class-validator';

export class ExpireTrialDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  feedback?: string;
}
