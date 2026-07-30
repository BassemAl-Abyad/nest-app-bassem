import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateStripeCouponDto } from './dto/create-stripe-coupon.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('coupons')
  @UseGuards(AuthGuard)
  async createCoupon(@Body() createCouponDto: CreateStripeCouponDto) {
    const params = {
      ...createCouponDto,
      redeemBy: createCouponDto.redeemBy ? new Date(createCouponDto.redeemBy) : undefined,
    };
    return this.paymentService.createCoupon(params);
  }

  @Get('coupons/:id')
  async retrieveCoupon(@Param('id') id: string) {
    return this.paymentService.retrieveCoupon(id);
  }

  @Get('coupons')
  async listCoupons(
    @Query('limit') limit?: string,
    @Query('startingAfter') startingAfter?: string,
  ) {
    return this.paymentService.listCoupons({
      limit: limit ? parseInt(limit) : undefined,
      startingAfter,
    });
  }

  @Delete('coupons/:id')
  @UseGuards(AuthGuard)
  async deleteCoupon(@Param('id') id: string) {
    return this.paymentService.deleteCoupon(id);
  }
}
