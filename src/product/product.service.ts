import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product, HProductDocument } from "src/DB/Models/product.model";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<HProductDocument>,
  ) {}

  async create(
    dto: CreateProductDto,
    imageUrls: string[],
    adminId: string
  ) {
    const product = await this.productModel.findOne({ name: dto.name });
    if (product) throw new ConflictException("Product already exists!");

    const newProduct = new this.productModel({
      ...dto,
      images: imageUrls,
      createdBy: adminId,
    });

    return newProduct.save();
  }

  async update(
    dto: UpdateProductDto,
    imageUrls: string[] | undefined,
    id: string
  ) {
    const updatedPayload: any = { ...dto };
    if (imageUrls && imageUrls.length > 0) {
      updatedPayload.images = imageUrls;
    }

    const updated = await this.productModel.findByIdAndUpdate(
      id,
      updatedPayload,
      { new: true }
    );

    if (!updated) throw new NotFoundException("Product doc not found..");

    return updated;
  }

  async findAll() {
    return this.productModel
      .find()
      .populate("createdBy", "firstName lastName email")
      .populate("category", "name logo")
      .populate("brand", "name logo");
  }

  async findById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate("createdBy", "firstName lastName email")
      .populate("category", "name logo")
      .populate("brand", "name logo");

    if (!product) throw new NotFoundException("Product not found!");

    return product;
  }

  async delete(id: string) {
    const deleted = await this.productModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException("Product doc not found..");

    return { message: "Product deleted successfully", deleted };
  }
}
