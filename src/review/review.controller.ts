import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { AuthGuard } from "src/common/guards/auth.guard";

@Controller("review")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async findAll() {
    return this.reviewService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.reviewService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req: any) {
    return this.reviewService.create(createReviewDto, req.user._id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(
    @Body() updateReviewDto: UpdateReviewDto,
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.reviewService.update(updateReviewDto, id, req.user._id);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: string, @Req() req: any) {
    return this.reviewService.delete(id, req.user._id);
  }
}
