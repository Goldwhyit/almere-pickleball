import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateMembershipApplicationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  membershipType!: string; // BASIC, INTERMEDIATE, ADVANCED, UNLIMITED

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  houseNumber?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  emergencyName?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsString()
  @IsOptional()
  emergencyRelation?: string;

  @IsString()
  @IsOptional()
  hasPlayedBefore?: string;

  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @IsString()
  @IsOptional()
  otherSports?: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  paymentType!: string; // MEMBERSHIP_YEARLY, MEMBERSHIP_MONTHLY, PUNCH_CARD, PER_SESSION

  @IsNotEmpty()
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
