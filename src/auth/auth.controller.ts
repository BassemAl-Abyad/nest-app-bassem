import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SanitizeUsernamePipe } from './pipes/sanitize-username.pipe';
import { CreateUserDTO } from './dto/createUser.dto';

@Controller('auth')
@UsePipes(new SanitizeUsernamePipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  findOne(@Body(new ValidationPipe()) CreateUserDTO: CreateUserDTO) {
    return { status: 'Success', data: CreateUserDTO };
  }
}
