import { Injectable, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationOtp(email: string, otp: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: "Your Account Activation Code",
        template: "./otp",
        context: { confirmEmailOTP: otp },
      });
      this.logger.log(`Verification code successfully dispatched to :${email}`);
    } catch {
      this.logger.error(`Failed to send email to: ${email}`);
    }
  }
}
