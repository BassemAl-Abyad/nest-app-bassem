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
import { FileInterceptor } from "@nestjs/platform-express";
import { BrandService } from "./brand.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { AuthGuard } from "src/common/guards/auth.guard";
import { multerOptions } from "src/common/utils/multer.utils";

@Controller("brand")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async findAll() {
    return this.brandService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.brandService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async create(
    @UploadedFile() file: MulterFile,
    @Body() createBrandDto: CreateBrandDto,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException("A brand logo image file is required!");
    }

    const logoUrl = `http://localhost:3000/${file.path.replace(/\\/g, "/")}`;
    const adminId = req.user._id;

    return this.brandService.create(createBrandDto, logoUrl, adminId);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("file", multerOptions))
  async update(
    @UploadedFile() file: MulterFile,
    @Body() updateBrandDto: UpdateBrandDto,
    @Param("id") id: string,
  ) {
    if (!file) {
      throw new BadRequestException("A brand logo image file is required!");
    }

    const logoUrl = `http://localhost:3000/${file.path.replace(/\\/g, "/")}`;

    return this.brandService.update(updateBrandDto, logoUrl, id);
  }
}
