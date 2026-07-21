import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart, HCartDocument } from "src/DB/Models/cart.model";
import { Coupon, HCouponDocument } from "src/DB/Models/coupon.model";
import { Order, HOrderDocument } from "src/DB/Models/order.model";
import { Product, HProductDocument } from "src/DB/Models/product.model";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<HOrderDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<HCartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<HProductDocument>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<HCouponDocument>,
  ) {}

  private async validateCartOwnership(cartId: string, userId: string) {
    const cart = await this.cartModel.findById(cartId);

    if (!cart) throw new NotFoundException("Cart not found!");
    if (cart.user.toString() !== userId) {
      throw new BadRequestException("You can only create an order from your own cart");
    }

    return cart;
  }

  private async validateCoupon(code: string, orderAmount: number, userId: string) {
    const normalizedCode = code.toUpperCase();
    const coupon = await this.couponModel.findOne({ code: normalizedCode });

    if (!coupon) throw new NotFoundException("Coupon not found!");

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

    return { coupon, discountAmount, finalTotal: orderAmount - discountAmount };
  }

  async create(dto: CreateOrderDto, userId: string) {
    const cart = await this.validateCartOwnership(dto.cartId, userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    const itemPayload = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new NotFoundException(`Product with id ${item.productId} not found`);
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      }),
    );

    const total = itemPayload.reduce((sum, item) => sum + item.quantity * item.price, 0);
    let discountAmount = 0;
    let finalTotal = total;

    if (cart.couponCode) {
      const validatedCoupon = await this.validateCoupon(cart.couponCode, total, userId);
      discountAmount = validatedCoupon.discountAmount;
      finalTotal = validatedCoupon.finalTotal;

      validatedCoupon.coupon.usedCount += 1;
      validatedCoupon.coupon.usedBy = validatedCoupon.coupon.usedBy || [];
      if (!validatedCoupon.coupon.usedBy.some((usedUserId: any) => usedUserId.toString() === userId)) {
        validatedCoupon.coupon.usedBy.push(userId as any);
      }

      await validatedCoupon.coupon.save();
    }

    const order = await this.orderModel.create({
      items: itemPayload,
      user: userId,
      total,
      discountAmount,
      finalTotal,
      couponCode: cart.couponCode,
      coupon: cart.coupon,
      shippingAddress: dto.shippingAddress,
      phoneNumber: dto.phoneNumber,
      paymentMethod: dto.paymentMethod || "cash",
      createdBy: userId,
    });

    cart.status = "checkedOut";
    await cart.save();

    return order;
  }

  async update(id: string, dto: UpdateOrderDto, userId: string) {
    const order = await this.orderModel.findById(id);

    if (!order) throw new NotFoundException("Order not found!");
    if (order.user.toString() !== userId) {
      throw new BadRequestException("You can only update your own order");
    }

    const updated = await this.orderModel.findByIdAndUpdate(id, dto, { new: true });

    if (!updated) throw new NotFoundException("Order not found!");

    return updated;
  }

  async findAll() {
    return this.orderModel
      .find()
      .populate("user", "firstName lastName email")
      .populate("items.productId", "name price images")
      .populate("coupon", "code name discountType discountValue");
  }

  async findById(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate("user", "firstName lastName email")
      .populate("items.productId", "name price images")
      .populate("coupon", "code name discountType discountValue");

    if (!order) throw new NotFoundException("Order not found!");

    return order;
  }

  async findByUserId(userId: string) {
    return this.orderModel
      .find({ user: userId })
      .populate("user", "firstName lastName email")
      .populate("items.productId", "name price images")
      .populate("coupon", "code name discountType discountValue");
  }
}
