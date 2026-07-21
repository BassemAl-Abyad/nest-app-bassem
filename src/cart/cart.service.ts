import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cart, HCartDocument } from "src/DB/Models/cart.model";
import { CreateCartDto } from "./dto/create-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<HCartDocument>,
  ) {}

  private calculateTotal(items: Array<{ quantity: number; price: number }>) {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
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

    const total = this.calculateTotal(dto.items);

    const newCart = new this.cartModel({
      ...dto,
      user: userId,
      total,
      createdBy: userId,
    });

    return newCart.save();
  }

  async update(dto: UpdateCartDto, id: string) {
    const updatedPayload: any = { ...dto };

    if (dto.items && dto.items.length > 0) {
      const validItems = dto.items.filter(
        (item) => item.quantity !== undefined && item.price !== undefined,
      ) as Array<{ quantity: number; price: number }>;
      updatedPayload.total = this.calculateTotal(validItems);
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

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: productId as any,
        quantity,
        price: 0, // Price should be provided separately or fetched from product
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
