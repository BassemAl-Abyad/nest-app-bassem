import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({
    type: [{
      productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    }],
    required: true,
    default: [],
  })
  items!: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;

  @Prop({
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  })
  user!: string;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  total!: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  discountAmount!: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  finalTotal!: number;

  @Prop({
    type: String,
    required: false,
    trim: true,
  })
  couponCode?: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    required: false,
    ref: "Coupon",
  })
  coupon?: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  shippingAddress!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  phoneNumber!: string;

  @Prop({
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  })
  status!: string;

  @Prop({
    type: String,
    enum: ["cash", "card", "online"],
    default: "cash",
  })
  paymentMethod!: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  })
  createdBy!: string;
}

export const orderSchema = SchemaFactory.createForClass(Order);

export type HOrderDocument = HydratedDocument<Order>;
export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: orderSchema },
]);
