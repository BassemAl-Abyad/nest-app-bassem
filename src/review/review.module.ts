import { Module } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";
import { AuthGuard } from "src/common/guards/auth.guard";
import { JwtService } from "src/common/services/jwt.service";
import { TokenService } from "src/common/services/token.service";
import { ReviewModel } from "src/DB/Models/review.model";
import { UserModel } from "src/DB/Models/user.model";
import { ProductModel } from "src/DB/Models/product.model";

@Module({
  imports: [ReviewModel, UserModel, ProductModel],
  providers: [ReviewService, AuthGuard, TokenService, JwtService],
  controllers: [ReviewController],
})
export class ReviewModule {}
