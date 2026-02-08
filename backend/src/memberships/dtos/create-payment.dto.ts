import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentType!: string; // MEMBERSHIP_YEARLY, MEMBERSHIP_MONTHLY, PUNCH_CARD, PER_SESSION

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  trainingDate?: string; // For PER_SESSION payments

  @IsOptional()
  @IsString()
  trainingTime?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
