import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ApplyMembershipDto {
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

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  houseNumber?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  emergencyName?: string;

  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @IsOptional()
  @IsString()
  emergencyRelation?: string;

  @IsOptional()
  @IsString()
  membershipType?: string;

  @IsBoolean()
  agreedToTerms!: boolean;

  @IsBoolean()
  agreedToPrivacy!: boolean;

  @IsOptional()
  @IsBoolean()
  newsletter?: boolean;

  @IsString()
  @MinLength(8)
  password!: string;
}
