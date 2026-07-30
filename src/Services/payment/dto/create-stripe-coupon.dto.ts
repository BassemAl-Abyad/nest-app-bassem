import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export enum StripeCouponDuration {
  ONCE = 'once',
  REPEATING = 'repeating',
  FOREVER = 'forever',
}

export enum StripeCouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export class CreateStripeCouponDto {
  @IsEnum(StripeCouponDiscountType)
  @IsNotEmpty()
  discountType!: StripeCouponDiscountType;

  @IsNumber()
  @Min(0)
  discountValue!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(StripeCouponDuration)
  @IsNotEmpty()
  duration!: StripeCouponDuration;

  @IsNumber()
  @IsOptional()
  @Min(1)
  durationInMonths?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxRedemptions?: number;

  @IsDateString()
  @IsOptional()
  redeemBy?: string;

  @IsOptional()
  metadata?: Record<string, string>;
}
