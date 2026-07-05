import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTrialSignupDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsBoolean()
  agreedToTerms!: boolean;
}
