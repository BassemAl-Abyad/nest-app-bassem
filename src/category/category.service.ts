import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category, HCategoryDocument } from "src/DB/Models/category.model";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly CategoryModel: Model<HCategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto, logoUrl: string, adminId: string) {
    const category = await this.CategoryModel.findOne({
      name: CreateCategoryDto.name,
    });
    if (category) throw new ConflictException("Category already exists!");
    const newCategory = new this.CategoryModel({
      ...dto,
      logo: logoUrl,
      createdBy: adminId,
    });

    return newCategory.save();
  }

  async update(dto: UpdateCategoryDto, logoUrl: string, id: string) {
    const updatedPayload = { ...dto };
    if (logoUrl) updatedPayload.logo = logoUrl;

    const updated = await this.CategoryModel.findByIdAndUpdate(
      id,
      updatedPayload,
      { new: true },
    );

    if (!updated) throw new NotFoundException("Category doc not found..");

    return updated;
  }

  async findAll() {
    return this.CategoryModel.find().populate(
      "createdBy",
      "firstName lastName email",
    );
  }

  async findById(id: string) {
    const category =
      await this.CategoryModel.findById(id).populate("createdBy");

    if (!category) throw new NotFoundException("Category not found!");

    return category;
  }
}
