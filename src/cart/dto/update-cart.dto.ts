import {
  IsArray,
  IsOptional,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export class CartItemDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1, { message: "Quantity must be at least 1" })
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: "Price must be a positive number" })
  price?: number;
}

export class UpdateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsOptional()
  items?: CartItemDto[];

  @IsString()
  @IsEnum(["active", "checkedOut", "abandoned"])
  @IsOptional()
  status?: string;
}
