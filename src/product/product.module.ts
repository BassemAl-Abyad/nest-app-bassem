import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { AuthGuard } from "src/common/guards/auth.guard";
import { JwtService } from "src/common/services/jwt.service";
import { TokenService } from "src/common/services/token.service";
import { ProductModel } from "src/DB/Models/product.model";
import { UserModel } from "src/DB/Models/user.model";
import { BrandModel } from "src/DB/Models/brand.model";
import { CategoryModel } from "src/DB/Models/category.model";

@Module({
  imports: [ProductModel, UserModel, BrandModel, CategoryModel],
  providers: [ProductService, AuthGuard, TokenService, JwtService],
  controllers: [ProductController],
})
export class ProductModule {}
