import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart, HCartDocument } from "src/DB/Models/cart.model";
import { Coupon, HCouponDocument } from "src/DB/Models/coupon.model";
import { Product, HProductDocument } from "src/DB/Models/product.model";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<HCartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<HProductDocument>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<HCouponDocument>,
  ) {}

  private calculateTotal(items: Array<{ quantity: number; price: number }>) {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  }

  private async resolveItemsWithPrices(
    items: Array<{ productId?: string; quantity?: number; price?: number }>,
  ) {
    const resolvedItems: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const item of items) {
      if (!item.productId || item.quantity === undefined) {
        throw new BadRequestException("Each cart item must include a productId and quantity");
      }

      const product = await this.productModel.findById(item.productId);

      if (!product) {
        throw new NotFoundException(`Product with id ${item.productId} not found`);
      }

      resolvedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    return resolvedItems;
  }

  private async validateCouponForCart(
    code: string,
    orderAmount: number,
    userId: string,
  ) {
    const normalizedCode = code.toUpperCase();
    const coupon = await this.couponModel.findOne({ code: normalizedCode });

    if (!coupon) {
      throw new NotFoundException("Coupon not found!");
    }

    const now = new Date();
    const isExpired = now < new Date(coupon.startDate) || now > new Date(coupon.endDate);
    const isExceeded = coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
    const isInactive = coupon.isActive === false;
    const belowMinimum = orderAmount < coupon.minOrderAmount;
    const alreadyUsed = coupon.usedBy?.some((usedUserId: any) => usedUserId.toString() === userId);

    if (isExpired || isExceeded || isInactive || belowMinimum || alreadyUsed) {
      throw new BadRequestException("Coupon is not valid for this order");
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderAmount);

    return {
      coupon,
      discountAmount,
      finalTotal: orderAmount - discountAmount,
    };
  }

  async create(dto: CreateCartDto, userId: string) {
    const existingCart = await this.cartModel.findOne({
      user: userId,
      status: "active",
    });

    if (existingCart) {
      throw new ConflictException(
        "User already has an active cart! Please update the existing cart.",
      );
    }

    const resolvedItems = await this.resolveItemsWithPrices(dto.items);
    const total = this.calculateTotal(resolvedItems);

    const newCart = new this.cartModel({
      ...dto,
      items: resolvedItems,
      user: userId,
      total,
      createdBy: userId,
    });

    return newCart.save();
  }

  async update(dto: UpdateCartDto, id: string) {
    const updatedPayload: any = { ...dto };

    if (dto.items && dto.items.length > 0) {
      const resolvedItems = await this.resolveItemsWithPrices(dto.items);
      updatedPayload.items = resolvedItems;
      updatedPayload.total = this.calculateTotal(resolvedItems);
    }

    const updated = await this.cartModel.findByIdAndUpdate(
      id,
      updatedPayload,
      { new: true },
    );

    if (!updated) throw new NotFoundException("Cart not found..");

    return updated;
  }

  async findAll() {
    return this.cartModel
      .find()
      .populate("user", "firstName lastName email")
      .populate("items.productId", "name price images")
      .populate("createdBy", "firstName lastName email");
  }

  async findById(id: string) {
    const cart = await this.cartModel
      .findById(id)
      .populate("user", "firstName lastName email")
      .populate("items.productId", "name price images")
      .populate("createdBy", "firstName lastName email");

    if (!cart) throw new NotFoundException("Cart not found!");

    return cart;
  }

  async findByUserId(userId: string, status: string = "active") {
    const cart = await this.cartModel
      .findOne({ user: userId, status })
      .populate("user", "firstName lastName email")
      .populate("items.productId", "name price images")
      .populate("createdBy", "firstName lastName email");

    if (!cart) throw new NotFoundException("Cart not found for this user!");

    return cart;
  }

  async addItemToCart(id: string, productId: string, quantity: number) {
    const cart = await this.cartModel.findById(id);

    if (!cart) throw new NotFoundException("Cart not found..");

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        productId: productId as any,
        quantity,
        price: product.price,
      } as any);
    }

    cart.total = this.calculateTotal(cart.items as any);
    return cart.save();
  }

  async removeItemFromCart(id: string, productId: string) {
    const cart = await this.cartModel.findById(id);

    if (!cart) throw new NotFoundException("Cart not found..");

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    cart.total = this.calculateTotal(cart.items as any);
    return cart.save();
  }

  async delete(id: string) {
    const deleted = await this.cartModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException("Cart not found..");

    return deleted;
  }

  async clearCart(id: string) {
    const updated = await this.cartModel.findByIdAndUpdate(
      id,
      { items: [], total: 0, discountAmount: 0, finalTotal: 0, couponCode: undefined, coupon: undefined },
      { new: true },
    );

    if (!updated) throw new NotFoundException("Cart not found..");

    return updated;
  }

  async applyCouponToCart(id: string, code: string, userId: string) {
    const cart = await this.cartModel.findById(id);

    if (!cart) throw new NotFoundException("Cart not found..");
    if (cart.user.toString() !== userId) {
      throw new ForbiddenException("You can only apply a coupon to your own cart");
    }

    const subtotal = cart.total || this.calculateTotal(cart.items as any);
    const validatedCoupon = await this.validateCouponForCart(code, subtotal, userId);

    cart.couponCode = validatedCoupon.coupon.code;
    cart.coupon = validatedCoupon.coupon._id as any;
    cart.discountAmount = validatedCoupon.discountAmount;
    cart.finalTotal = validatedCoupon.finalTotal;

    return cart.save();
  }

  async checkout(id: string, userId: string) {
    const cart = await this.cartModel.findById(id);

    if (!cart) throw new NotFoundException("Cart not found..");
    if (cart.user.toString() !== userId) {
      throw new ForbiddenException("You can only checkout your own cart");
    }

    if (cart.couponCode) {
      const validatedCoupon = await this.validateCouponForCart(
        cart.couponCode,
        cart.total || this.calculateTotal(cart.items as any),
        userId,
      );

      validatedCoupon.coupon.usedCount += 1;
      validatedCoupon.coupon.usedBy = validatedCoupon.coupon.usedBy || [];
      if (!validatedCoupon.coupon.usedBy.some((usedUserId: any) => usedUserId.toString() === userId)) {
        validatedCoupon.coupon.usedBy.push(userId as any);
      }
      await validatedCoupon.coupon.save();
    }

    cart.status = "checkedOut";
    return cart.save();
  }
}
