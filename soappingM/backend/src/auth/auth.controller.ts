// backend/src/auth/auth.controller.ts
import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto'; // 👈 1. DTO 불러오기

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  // 👇 2. @Request() req 대신 @Body()와 DTO를 사용하도록 변경
  async login(@Body() loginAuthDto: LoginAuthDto) {
    const user = await this.authService.validateUser(
      loginAuthDto.username,
      loginAuthDto.password,
    );

    if (!user) {
      // 👇 3. 사용자가 없을 경우 명확한 에러를 던지도록 수정
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    return this.authService.login(user);
  }
}
