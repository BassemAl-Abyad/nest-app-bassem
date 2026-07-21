import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

@Schema({
  timestamps: true,
})
export class Cart {
  @Prop({
    type: [
      {
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
      },
    ],
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
    type: String,
    enum: ["active", "checkedOut", "abandoned"],
    default: "active",
  })
  status!: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  })
  createdBy!: string;
}

export const cartSchema = SchemaFactory.createForClass(Cart);

export type HCartDocument = HydratedDocument<Cart>;
export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: cartSchema },
]);
