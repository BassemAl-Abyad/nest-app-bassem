import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart, HCartDocument } from "src/DB/Models/cart.model";
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
      { items: [], total: 0 },
      { new: true },
    );

    if (!updated) throw new NotFoundException("Cart not found..");

    return updated;
  }

  async checkout(id: string) {
    const updated = await this.cartModel.findByIdAndUpdate(
      id,
      { status: "checkedOut" },
      { new: true },
    );

    if (!updated) throw new NotFoundException("Cart not found..");

    return updated;
  }
}
