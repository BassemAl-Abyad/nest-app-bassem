import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Review, HReviewDocument } from "src/DB/Models/review.model";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<HReviewDocument>,
  ) {}

  async create(dto: CreateReviewDto, userId: string) {
    const newReview = await this.reviewModel.create({
      ...dto,
      user: userId,
    });

    return newReview;
  }

  async update(dto: UpdateReviewDto, id: string, userId: string) {
    const review = await this.reviewModel.findById(id);

    if (!review) throw new NotFoundException("Review not found!");
    if (review.user.toString() !== userId) {
      throw new ForbiddenException("You can only update your own review");
    }

    const updated = await this.reviewModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    return updated;
  }

  async findAll() {
    return this.reviewModel
      .find()
      .populate("user", "firstName lastName email")
      .populate("product", "name price images");
  }

  async findById(id: string) {
    const review = await this.reviewModel
      .findById(id)
      .populate("user", "firstName lastName email")
      .populate("product", "name price images");

    if (!review) throw new NotFoundException("Review not found!");

    return review;
  }

  async delete(id: string, userId: string) {
    const review = await this.reviewModel.findById(id);

    if (!review) throw new NotFoundException("Review not found!");
    if (review.user.toString() !== userId) {
      throw new ForbiddenException("You can only delete your own review");
    }

    const deleted = await this.reviewModel.findByIdAndDelete(id);

    return { message: "Review deleted successfully", deleted };
  }
}
