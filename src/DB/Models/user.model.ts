import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "src/common/enums/user.enums";
import { hash } from "src/common/security/hash.security";

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20,
    trim: true,
  })
  firstName!: string;

  @Prop({
    type: String,
    required: true,
    minLength: 2,
    maxLength: 20,
    trim: true,
  })
  lastName!: string;
  username!: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    type: String,
    required: function (this: any) {
      return this.provider === ProviderEnum.GOOGLE ? false : true;
    },
  })
  password!: string;

  @Prop({
    type: Date,
  })
  confirmEmail!: Date;

  @Prop({
    type: String,
    default: undefined,
  })
  confirmEmailOTP!: string | undefined;

  @Prop({
    type: String,
    default: undefined,
  })
  OTPExpiresAt!: Date | undefined;

  @Prop({
    type: String,
    enum: {
      values: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
  })
  gender!: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
  })
  provider!: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
  })
  role!: string;
}
export const userSchema = SchemaFactory.createForClass(User);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash(this.password);
  }
});

userSchema
  .virtual("username")
  .get(function (this: any) {
    return this.firstName + " " + this.lastName;
  })
  .set(function (this: any, value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.firstName = firstName;
    this.lastName = lastName;
  });

export type HUserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);
