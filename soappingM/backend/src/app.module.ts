// soappingM/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // 데이터베이스 타입
      host: 'localhost', // 보통 localhost
      port: 5432, // PostgreSQL 기본 포트
      username: 'postgres', // PostgreSQL 설치 시 설정한 사용자 이름
      password: '1234', // PostgreSQL 설치 시 설정한 비밀번호
      database: 'soappingM_db', // 사용할 데이터베이스 이름
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 개발 환경에서만 true로 설정! 스키마를 자동으로 동기화
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
