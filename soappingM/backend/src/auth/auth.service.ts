import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/users/entities/user.entity';
import { UsersService } from '../users/users.service';

// 👇 1. JWT payload에 들어갈 user 정보의 타입을 명확하게 정의합니다.
interface UserPayload {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByUsername(username);

    // 👇 user가 존재하고, user.password가 있을 때만 bcrypt.compare를 실행하도록 수정
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 👇 2. user의 타입을 any 대신 우리가 정의한 UserPayload로 변경합니다.
  login(user: UserPayload) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      name: user.name,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
