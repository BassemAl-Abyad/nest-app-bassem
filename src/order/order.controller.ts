import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { AuthGuard } from "src/common/guards/auth.guard";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll() {
    return this.orderService.findAll();
  }

  @Get("user")
  @UseGuards(AuthGuard)
  async findByUser(@Req() req: any) {
    return this.orderService.findByUserId(req.user._id);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.orderService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.create(dto, req.user._id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  async update(@Param("id") id: string, @Body() dto: UpdateOrderDto, @Req() req: any) {
    return this.orderService.update(id, dto, req.user._id);
  }
}
