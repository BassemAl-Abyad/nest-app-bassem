import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Brand, HBrandDocument } from "src/DB/Models/brand.model";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<HBrandDocument>,
  ) {}

  async create(dto: CreateBrandDto, logoUrl: string, adminId: string) {
    const brand = await this.brandModel.findOne({ name: dto.name });
    if (brand) throw new ConflictException("Brand already exists!");

    const newBrand = new this.brandModel({
      ...dto,
      logo: logoUrl,
      createdBy: adminId,
    });

    return newBrand.save();
  }

  async update(dto: UpdateBrandDto, logoUrl: string, id: string) {
    const updatedPayload = { ...dto };
    if (logoUrl) updatedPayload.logo = logoUrl;

    const updated = await this.brandModel.findByIdAndUpdate(
      id,
      updatedPayload,
      { new: true },
    );

    if (!updated) throw new NotFoundException("Brand doc not found..");

    return updated;
  }

  async findAll() {
    return this.brandModel.find().populate("createdBy", "firstName lastName email");
  }

  async findById(id: string) {
    const brand = await this.brandModel.findById(id).populate("createdBy");

    if (!brand) throw new NotFoundException("Brand not found!");

    return brand;
  }
}
