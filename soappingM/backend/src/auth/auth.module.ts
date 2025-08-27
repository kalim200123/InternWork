import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule, // UsersModule을 import
    PassportModule,
    JwtModule.register({
      secret: 'YOUR_SECRET_KEY', // 👈 매우 중요한 비밀키! 나중에 .env 파일로 옮겨야 합니다.
      signOptions: { expiresIn: '60m' }, // 👈 토큰 유효 시간 (예: 60분)
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController], // 다른 모듈에서 AuthService를 사용할 수 있도록 export
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
