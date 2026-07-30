import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CouponService } from "./coupon.service";
import { CouponType } from "./dto/coupon.type";
import { CreateCouponInput } from "./dto/create-coupon.input";

@Resolver(() => CouponType)
export class CouponResolver {
  constructor(private readonly couponService: CouponService) {}

  @Query(() => [CouponType], { name: "coupons" })
  async findAll(): Promise<CouponType[]> {
    return this.couponService.findAll();
  }

  @Mutation(() => CouponType, { name: "createCoupon" })
  async create(
    @Args("input") input: CreateCouponInput,
    @Args("adminId", { type: () => String }) adminId: string,
  ): Promise<CouponType> {
    return this.couponService.create(input as any, adminId);
  }
}
