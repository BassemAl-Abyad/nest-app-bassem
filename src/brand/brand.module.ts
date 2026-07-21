import { Module } from "@nestjs/common";
import { BrandService } from "./brand.service";
import { BrandController } from "./brand.controller";
import { AuthGuard } from "src/common/guards/auth.guard";
import { JwtService } from "src/common/services/jwt.service";
import { TokenService } from "src/common/services/token.service";
import { BrandModel } from "src/DB/Models/brand.model";
import { UserModel } from "src/DB/Models/user.model";

@Module({
  imports: [UserModel, BrandModel],
  providers: [BrandService, AuthGuard, TokenService, JwtService],
  controllers: [BrandController],
})
export class BrandModule {}
