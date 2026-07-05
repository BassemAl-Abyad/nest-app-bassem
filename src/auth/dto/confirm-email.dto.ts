import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ConfirmEmailDTO {
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email address" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.toLowerCase().trim() : value,
  )
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "OTP Verification is required" })
  confirmEmailOTP!: string;
}
