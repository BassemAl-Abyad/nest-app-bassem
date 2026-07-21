import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { AuthGuard } from "src/common/guards/auth.guard";
import { JwtService } from "src/common/services/jwt.service";
import { TokenService } from "src/common/services/token.service";
import { CartModel } from "src/DB/Models/cart.model";
import { UserModel } from "src/DB/Models/user.model";
import { ProductModel } from "src/DB/Models/product.model";

@Module({
  imports: [CartModel, UserModel, ProductModel],
  providers: [CartService, AuthGuard, TokenService, JwtService],
  controllers: [CartController],
})
export class CartModule {}
