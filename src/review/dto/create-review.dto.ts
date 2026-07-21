import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty({ message: "Review rating is required.." })
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating must be at most 5" })
  rating!: number;

  @IsString()
  @IsNotEmpty({ message: "Review comment is required.." })
  comment!: string;

  @IsString()
  @IsNotEmpty({ message: "Product ID is required.." })
  product!: string;
}
