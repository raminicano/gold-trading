// src/auth/services/auth.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  // JWT 토큰 생성 함수
  generateToken(userId: number): string {
    const payload = { userId };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    return accessToken;
  }

  // refreshToken 생성 및 저장 함수
  async generateAndStoreRefreshToken(userId: number): Promise<string> {
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    }); // 7일 동안 유효
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 유효기간 7일 설정

    await this.prisma.token.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });

    return refreshToken;
  }

  // 로그인 로직
  async login(
    username: string,
    password: string,
  ): Promise<{ isValid: boolean; accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const isValid = false;
      return { isValid, accessToken: '', refreshToken: '' };
    }
    const isValid = true;
    const accessToken = this.generateToken(user.id);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return { isValid, accessToken, refreshToken };
  }
}
