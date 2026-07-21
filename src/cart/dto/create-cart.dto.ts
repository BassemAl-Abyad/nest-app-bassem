import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CartItemDto {
  @IsString()
  @IsNotEmpty({ message: "Product ID is required.." })
  productId!: string;

  @IsNumber()
  @IsNotEmpty({ message: "Quantity is required.." })
  @Min(1, { message: "Quantity must be at least 1" })
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: "Price must be a positive number" })
  price?: number;
}

export class CreateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsNotEmpty({ message: "Items are required.." })
  items!: CartItemDto[];
}
