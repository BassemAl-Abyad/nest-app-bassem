import {
  IsEmail,
  IsInt,
  IsString,
  Length,
  Min,
  Max,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @Length(3, 20, { message: 'Username must be between 3 and 20 characters' })
  username: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsInt()
  @Min(0, { message: 'Age must be a positive integer' })
  @Max(120, { message: 'Age must be less than or equal to 120' })
  age: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsPhoneNumber('EG')
  @IsOptional()
  phone?: string;
}
