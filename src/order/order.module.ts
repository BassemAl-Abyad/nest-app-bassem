import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { AuthGuard } from "src/common/guards/auth.guard";
import { JwtService } from "src/common/services/jwt.service";
import { TokenService } from "src/common/services/token.service";
import { OrderModel } from "src/DB/Models/order.model";
import { CartModel } from "src/DB/Models/cart.model";
import { UserModel } from "src/DB/Models/user.model";
import { ProductModel } from "src/DB/Models/product.model";
import { CouponModel } from "src/DB/Models/coupon.model";

@Module({
  imports: [OrderModel, CartModel, UserModel, ProductModel, CouponModel],
  providers: [OrderService, AuthGuard, TokenService, JwtService],
  controllers: [OrderController],
})
export class OrderModule {}
