import { Field, InputType, Int } from "@nestjs/graphql";
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";

export enum CouponDiscountTypeGraphQL {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

@InputType()
export class CreateCouponInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: "Coupon code is required.." })
  @Length(2, 50, {
    message: "Coupon code must be between 2 and 50 characters long",
  })
  code!: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: "Coupon name is required.." })
  name!: string;

  @Field()
  @IsEnum(CouponDiscountTypeGraphQL)
  @IsNotEmpty({ message: "Discount type is required.." })
  discountType!: CouponDiscountTypeGraphQL;

  @Field()
  @IsNumber()
  @Min(0)
  discountValue!: number;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field()
  @IsNumber()
  @Min(0)
  minOrderAmount!: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  usageLimit!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
