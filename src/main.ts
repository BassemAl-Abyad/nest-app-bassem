import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SanitizeUsernamePipe } from './auth/pipes/sanitize-username.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new SanitizeUsernamePipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
