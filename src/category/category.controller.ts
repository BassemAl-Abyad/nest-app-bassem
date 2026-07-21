import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { File as MulterFile } from "multer";
import { CategoryService } from "./category.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { AuthGuard } from "src/common/guards/auth.guard";
import { multerOptions } from "src/common/utils/multer.utils";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.categoryService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async create(
    @UploadedFile() file: MulterFile,
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: any,
  ) {
    if (!file)
      throw new BadRequestException("A category logo image file is required!");
    const logoUrl = `http://localhost:3000/${file.path.replace(/\\/g, "/")}`;
    const adminId = req.user._id;

    return this.categoryService.create(createCategoryDto, logoUrl, adminId);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async update(
    @UploadedFile() file: MulterFile,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Param("id") id: string,
  ) {
    if (!file)
      throw new BadRequestException("A category logo image file is required!");
    const logoUrl = `http://localhost:3000/${file.path.replace(/\\/g, "/")}`;

    return this.categoryService.update(updateCategoryDto, logoUrl, id);
  }
}
