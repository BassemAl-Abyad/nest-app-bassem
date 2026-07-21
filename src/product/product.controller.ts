import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { File as MulterFile } from "multer";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AuthGuard } from "src/common/guards/auth.guard";
import { multerOptions } from "src/common/utils/multer.utils";

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor("files", 5, multerOptions))
  async create(
    @UploadedFiles() files: MulterFile[],
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        "At least one product image file is required!"
      );
    }

    const imageUrls = files.map(
      (file) => `http://localhost:3000/${file.path.replace(/\\/g, "/")}`
    );
    const adminId = req.user._id;

    return this.productService.create(createProductDto, imageUrls, adminId);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor("files", 5, multerOptions))
  async update(
    @UploadedFiles() files: MulterFile[],
    @Body() updateProductDto: UpdateProductDto,
    @Param("id") id: string,
  ) {
    let imageUrls: string[] | undefined;
    if (files && files.length > 0) {
      imageUrls = files.map(
        (file) => `http://localhost:3000/${file.path.replace(/\\/g, "/")}`
      );
    }

    return this.productService.update(updateProductDto, imageUrls, id);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: string) {
    return this.productService.delete(id);
  }
}
