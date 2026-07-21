import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { JwtService } from 'src/common/services/jwt.service';
import { TokenService } from 'src/common/services/token.service';
import { CategoryModel } from 'src/DB/Models/category.model';
import { UserModel } from 'src/DB/Models/user.model';

@Module({
  imports: [UserModel, CategoryModel],
  providers: [CategoryService, AuthGuard, TokenService, JwtService],
  controllers: [CategoryController],
})
export class CategoryModule {}
