import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  houseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  emergencyPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyRelation?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/, {
    message: 'Ongeldig IBAN-formaat',
  })
  iban?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  ibanAccountHolder?: string;

  @IsOptional()
  @IsBoolean()
  sepaMandateConsent?: boolean;
}
