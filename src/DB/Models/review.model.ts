import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

@Schema({
  timestamps: true,
})
export class Review {
  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 5,
  })
  rating!: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  comment!: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Product",
  })
  product!: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  })
  user!: string;
}

export const reviewSchema = SchemaFactory.createForClass(Review);

export type HReviewDocument = HydratedDocument<Review>;
export const ReviewModel = MongooseModule.forFeature([
  { name: Review.name, schema: reviewSchema },
]);
