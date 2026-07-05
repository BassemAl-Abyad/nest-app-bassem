import { Transform } from "class-transformer";
import {
  IsEmail,
  IsString,
  Length,
  IsOptional,
  IsNotEmpty,
  ValidateIf,
  IsEnum,
} from "class-validator";
import { GenderEnum, ProviderEnum, RoleEnum } from "src/common/enums/user.enums";

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty({ message: "First name is required" })
  @Length(3, 20, { message: "First name must be between 3 and 20 characters" })
  @Transform(({ value }: { value?: string }) => value?.trim())
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "Last name is required" })
  @Length(3, 20, { message: "Last name must be between 3 and 20 characters" })
  @Transform(({ value }: { value?: string }) => value?.trim())
  lastName!: string;

  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email address" })
  @Transform(({ value }: { value?: string }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @Length(8, 20, { message: "Password must be between 8 and 20 characters" })
  @ValidateIf((dto: CreateUserDTO) => dto.provider !== ProviderEnum.GOOGLE)
  password!: string;

  @IsEnum(GenderEnum, { message: "Gender value must be valid" })
  @IsOptional()
  gender?: GenderEnum;

  @IsEnum(ProviderEnum, { message: "Provider value must be valid" })
  @IsOptional()
  provider?: ProviderEnum;

  @IsEnum(RoleEnum, { message: "Role value must be valid" })
  @IsOptional()
  role?: RoleEnum;
}
