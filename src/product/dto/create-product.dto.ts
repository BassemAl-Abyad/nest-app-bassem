import { IsString, IsNotEmpty, IsNumber, IsArray, Length, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: "Product name is required.." })
  @Length(2, 100, {
    message: "Product name must be between 2 and 100 characters long",
  })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: "Product overview is required.." })
  overview!: string;

  @IsNumber()
  @IsNotEmpty({ message: "Product price is required.." })
  @Min(0, { message: "Price must be a positive number" })
  price!: number;

  @IsNumber()
  @IsNotEmpty({ message: "Product stock is required.." })
  @Min(0, { message: "Stock must be a positive number" })
  stock!: number;

  @IsString()
  @IsNotEmpty({ message: "Category ID is required.." })
  category!: string;

  @IsString()
  @IsNotEmpty({ message: "Brand ID is required.." })
  brand!: string;
}
