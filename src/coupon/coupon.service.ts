import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Coupon, HCouponDocument } from "src/DB/Models/coupon.model";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<HCouponDocument>,
  ) {}

  async create(dto: CreateCouponDto, adminId: string) {
    const normalizedCode = dto.code.toUpperCase();
    const coupon = await this.couponModel.findOne({ code: normalizedCode });

    if (coupon) throw new ConflictException("Coupon already exists!");

    const newCoupon = new this.couponModel({
      ...dto,
      code: normalizedCode,
      createdBy: adminId,
      isActive: true,
      usedCount: 0,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });

    return newCoupon.save();
  }

  async update(dto: UpdateCouponDto, id: string) {
    const updatedPayload: any = { ...dto };

    if (dto.code) {
      updatedPayload.code = dto.code.toUpperCase();
    }
    if (dto.startDate) {
      updatedPayload.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      updatedPayload.endDate = new Date(dto.endDate);
    }

    const updated = await this.couponModel.findByIdAndUpdate(id, updatedPayload, {
      new: true,
    });

    if (!updated) throw new NotFoundException("Coupon doc not found..");

    return updated;
  }

  async findAll() {
    return this.couponModel
      .find()
      .populate("createdBy", "firstName lastName email");
  }

  async findById(id: string) {
    const coupon = await this.couponModel
      .findById(id)
      .populate("createdBy", "firstName lastName email");

    if (!coupon) throw new NotFoundException("Coupon not found!");

    return coupon;
  }

  async delete(id: string) {
    const deleted = await this.couponModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException("Coupon doc not found..");

    return { message: "Coupon deleted successfully", deleted };
  }

  async validateCoupon(payload: { code: string; orderAmount: number; userId?: string }) {
    const code = payload.code.toUpperCase();
    const coupon = await this.couponModel.findOne({ code });

    if (!coupon) throw new NotFoundException("Coupon not found!");

    const now = new Date();
    const isExpired = now < new Date(coupon.startDate) || now > new Date(coupon.endDate);
    const isExceeded = coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;
    const isInactive = coupon.isActive === false;
    const belowMinimum = payload.orderAmount < coupon.minOrderAmount;
    const alreadyUsedByUser = Boolean(
      payload.userId && coupon.usedBy?.some((userId: any) => userId.toString() === payload.userId),
    );

    if (isExpired || isExceeded || isInactive || belowMinimum || alreadyUsedByUser) {
      throw new BadRequestException("Coupon is not valid for this order");
    }

    return coupon;
  }

  async redeemCoupon(payload: { code: string; orderAmount: number; userId: string }) {
    const coupon = await this.validateCoupon(payload);

    coupon.usedCount += 1;
    coupon.usedBy = coupon.usedBy || [];
    if (!coupon.usedBy.some((userId: any) => userId.toString() === payload.userId)) {
      coupon.usedBy.push(payload.userId as any);
    }

    await coupon.save();

    return coupon;
  }
}
