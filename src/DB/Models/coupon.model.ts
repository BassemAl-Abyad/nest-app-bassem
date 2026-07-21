import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

@Schema({
  timestamps: true,
})
export class Coupon {
  @Prop({
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  code!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
    enum: ["percentage", "fixed"],
  })
  discountType!: string;

  @Prop({
    type: Number,
    required: true,
  })
  discountValue!: number;

  @Prop({
    type: Date,
    required: true,
  })
  startDate!: Date;

  @Prop({
    type: Date,
    required: true,
  })
  endDate!: Date;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  minOrderAmount!: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  usageLimit!: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  usedCount!: number;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  isActive!: boolean;

  @Prop({
    type: String,
    required: false,
  })
  description?: string;

  @Prop({
    type: [mongoose.Types.ObjectId],
    default: [],
    ref: "User",
  })
  usedBy!: string[];

  @Prop({
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  })
  createdBy!: string;
}

export const couponSchema = SchemaFactory.createForClass(Coupon);

export type HCouponDocument = HydratedDocument<Coupon>;
export const CouponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: couponSchema },
]);
