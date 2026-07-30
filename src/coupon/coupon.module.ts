import { Module } from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CouponController } from "./coupon.controller";
import { AuthGuard } from "src/common/guards/auth.guard";
import { JwtService } from "src/common/services/jwt.service";
import { TokenService } from "src/common/services/token.service";
import { CouponModel } from "src/DB/Models/coupon.model";
import { UserModel } from "src/DB/Models/user.model";
import { CouponResolver } from "./coupon.resolver";

@Module({
  imports: [UserModel, CouponModel],
  providers: [CouponService, CouponResolver, AuthGuard, TokenService, JwtService],
  controllers: [CouponController],
})
export class CouponModule {}
