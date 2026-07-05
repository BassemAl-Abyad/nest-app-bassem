import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { EjsAdapter } from "@nestjs-modules/mailer/adapters/ejs.adapter";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: "gmail",
          auth: {
            user: configService.get<string>("EMAIL_USER"),
            pass: configService.get<string>("EMAIL_PASSWORD"),
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get<string>("EMAIL_USER")}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new EjsAdapter(),
          options: { strict: false },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
