
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name is required..' })
  @Length(2, 50, {
    message: 'Category Name must be between 2 and 50 character long',
  })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Category name is required..' })
  logo!: string;
}