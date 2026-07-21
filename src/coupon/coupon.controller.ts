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
  UseGuards,
} from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { AuthGuard } from "src/common/guards/auth.guard";

@Controller("coupon")
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  async findAll() {
    return this.couponService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.couponService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createCouponDto: CreateCouponDto, @Req() req: any) {
    if (!req.user?._id) {
      throw new BadRequestException("Authenticated admin is required");
    }

    return this.couponService.create(createCouponDto, req.user._id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(@Body() updateCouponDto: UpdateCouponDto, @Param("id") id: string) {
    return this.couponService.update(updateCouponDto, id);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: string) {
    return this.couponService.delete(id);
  }

  @Post("validate")
  async validate(@Body() payload: { code: string; orderAmount: number }) {
    return this.couponService.validateCoupon(payload);
  }
}
