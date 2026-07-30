import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType("Coupon")
export class CouponType {
  @Field(() => ID)
  _id!: any;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field()
  discountType!: string;

  @Field()
  discountValue!: number;

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field()
  minOrderAmount!: number;

  @Field()
  usageLimit!: number;

  @Field()
  usedCount!: number;

  @Field()
  isActive!: boolean;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
