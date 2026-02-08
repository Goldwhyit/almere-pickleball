import { IsEmail, IsString, MinLength, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class SignupTrialDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;
}

export class BookTrialDatesDto {
  @IsDateString({ strict: true })
  @IsNotEmpty()
  date1!: string;

  @IsDateString({ strict: true })
  @IsNotEmpty()
  date2!: string;

  @IsDateString({ strict: true })
  @IsNotEmpty()
  date3!: string;
}

export class RescheduleLessonDto {
  @IsDateString({ strict: true })
  @IsNotEmpty()
  newDate!: string;

  @IsString()
  @IsNotEmpty()
  newTime!: string;
}

export class DeclineTrialDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsOptional()
  feedback?: string;
}

export class MarkLessonCompletedDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BookTrainingDto {
  @IsDateString({ strict: true })
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;
}
