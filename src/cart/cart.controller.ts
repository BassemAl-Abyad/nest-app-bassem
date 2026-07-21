import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { AuthGuard } from "src/common/guards/auth.guard";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async findAll() {
    return this.cartService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.cartService.findById(id);
  }

  @Get("user/active")
  @UseGuards(AuthGuard)
  async getUserActiveCart(@Req() req: any) {
    const userId = req.user._id;
    return this.cartService.findByUserId(userId, "active");
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createCartDto: CreateCartDto, @Req() req: any) {
    const userId = req.user._id;
    return this.cartService.create(createCartDto, userId);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(
    @Body() updateCartDto: UpdateCartDto,
    @Param("id") id: string,
  ) {
    return this.cartService.update(updateCartDto, id);
  }

  @Post(":id/add-item")
  @UseGuards(AuthGuard)
  async addItem(
    @Param("id") id: string,
    @Body() body: { productId: string; quantity: number },
  ) {
    return this.cartService.addItemToCart(id, body.productId, body.quantity);
  }

  @Delete(":id/remove-item/:productId")
  @UseGuards(AuthGuard)
  async removeItem(
    @Param("id") id: string,
    @Param("productId") productId: string,
  ) {
    return this.cartService.removeItemFromCart(id, productId);
  }

  @Delete(":id/clear")
  @UseGuards(AuthGuard)
  async clearCart(@Param("id") id: string) {
    return this.cartService.clearCart(id);
  }

  @Post(":id/apply-coupon")
  @UseGuards(AuthGuard)
  async applyCoupon(
    @Param("id") id: string,
    @Body() body: { code: string },
    @Req() req: any,
  ) {
    return this.cartService.applyCouponToCart(id, body.code, req.user._id);
  }

  @Patch(":id/checkout")
  @UseGuards(AuthGuard)
  async checkout(@Param("id") id: string, @Req() req: any) {
    return this.cartService.checkout(id, req.user._id);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: string) {
    return this.cartService.delete(id);
  }
}
