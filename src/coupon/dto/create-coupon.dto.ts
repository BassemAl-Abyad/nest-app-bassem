import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export enum CouponDiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty({ message: "Coupon code is required.." })
  @Length(2, 50, {
    message: "Coupon code must be between 2 and 50 characters long",
  })
  code!: string;

  @IsString()
  @IsNotEmpty({ message: "Coupon name is required.." })
  name!: string;

  @IsEnum(CouponDiscountType)
  @IsNotEmpty({ message: "Discount type is required.." })
  discountType!: CouponDiscountType;

  @IsNumber()
  @Min(0)
  discountValue!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  @Min(0)
  minOrderAmount!: number;

  @IsInt()
  @Min(0)
  usageLimit!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
