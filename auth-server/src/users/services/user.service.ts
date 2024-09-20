import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, Token } from '@prisma/client';

// 사용자 등록과 관련된 로직
// 새로운 사용자를 데이터베이스에 저장하고 사용자 정보를 반환
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // 사용자 생성
  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 저장
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'user', // 기본 역할 설정
      },
    });

    await this.prisma.token.create({
      data: {
        userId: user.id,
        refreshToken: 'sample',
        createdAt: new Date(),
        expiresAt: new Date(),
      },
    });

    return user;
  }

  async findUserByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async createToken(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<Token> {
    return this.prisma.token.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });
  }

  async findTokenByUserId(userId: number) {
    return this.prisma.token.findMany({
      where: { userId },
    });
  }
}
