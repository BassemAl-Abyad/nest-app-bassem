/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Model } from "mongoose";
import { HUserDocument, User } from "src/DB/Models/user.model";
import { CreateUserDTO } from "./dto/createUser.dto";
import { hash } from "bcrypt";
import { InjectModel } from "@nestjs/mongoose";
import { MailService } from "src/mail/mail.service";
import { ConfirmEmailDTO } from "./dto/confirm-email.dto";
import { compare } from "src/common/security/hash.security";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<HUserDocument>,
    private readonly mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDTO) {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser)
      throw new ConflictException(
        "An Account with this email address already exits",
      );

    // generate otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await hash(otp, Number(process.env.SALT));

    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 5);

    const hashedPassword = await hash(
      createUserDto.password,
      Number(process.env.SALT),
    );

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      confirmEmailOTP: hashedOTP,
      OTPExpiresAt: expireTime,
    });

    const savedUser = await newUser.save();
    await this.mailService.sendVerificationOtp(savedUser.email, otp);
    return savedUser;
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDTO) {
    const user = await this.userModel.findOne({
      email: confirmEmailDto.email,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.confirmEmail) {
      throw new BadRequestException("Email already confirmed");
    }

    if (
      !user.confirmEmailOTP ||
      !compare(confirmEmailDto.confirmEmailOTP, user.confirmEmailOTP)
    ) {
      throw new BadRequestException("Invalid OTP");
    }

    if (new Date() > user.OTPExpiresAt!) {
      throw new BadGatewayException("OTP has expired");
    }

    user.confirmEmail = new Date();
    user.confirmEmailOTP = undefined;
    user.OTPExpiresAt = undefined;
  }

  create() {
    return "This action adds a new auth";
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
