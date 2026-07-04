import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SanitizeUsernamePipe } from './pipes/sanitize-username.pipe';
import { CreateUserDTO } from './dto/createUser.dto';

@Controller('auth')
@UsePipes(new SanitizeUsernamePipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDTO) {
    const user = await this.authService.register(createUserDto);
    return {
      success: true,
      message: 'User registered successfully, please check your email for verification',
      user: user,
    }
  }
}
