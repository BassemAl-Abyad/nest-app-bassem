import { Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { AuthModule } from './auth/auth.module';
import { Connection } from 'mongoose';
import { MailModule } from './mail/mail.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { ReviewModule } from './review/review.module';
import { CouponModule } from './coupon/coupon.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    CacheModule.register({ isGlobal: true, ttl: 60 }),
    ConfigModule.forRoot({
      envFilePath: resolve('./config/dev.env'),
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
        onConnectionCreate: (connection: Connection) => {
          connection.on("connected", () => {
            console.log("MongoDB connected successfully");
          });
        },
      }),
    }),
    AuthModule,
    MailModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    CartModule,
    ReviewModule,
    CouponModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
