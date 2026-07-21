import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export enum OrderPaymentMethod {
  CASH = "cash",
  CARD = "card",
  ONLINE = "online",
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: "Cart ID is required.." })
  cartId!: string;

  @IsString()
  @IsNotEmpty({ message: "Shipping address is required.." })
  @MinLength(5, { message: "Shipping address must be at least 5 characters" })
  shippingAddress!: string;

  @IsString()
  @IsNotEmpty({ message: "Phone number is required.." })
  phoneNumber!: string;

  @IsOptional()
  @IsEnum(OrderPaymentMethod)
  paymentMethod?: OrderPaymentMethod;
}
