import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty({ message: "Brand name is required.." })
  @Length(2, 50, {
    message: "Brand name must be between 2 and 50 characters long",
  })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: "Brand logo is required.." })
  logo!: string;
}
