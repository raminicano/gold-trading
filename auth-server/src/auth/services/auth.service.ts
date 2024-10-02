// src/auth/services/auth.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'auth/guards/jwt.guard';
import { Token } from '@prisma/client';
import { UserService } from 'users/services/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtGuard: JwtAuthGuard,
    private readonly userService: UserService,
  ) {}

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
    // 1. 토큰 재생성
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    }); // 7일 동안 유효
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 유효기간 7일 설정

    // 2. userId로 토큰이 있는지 확인
    const existingToken = await this.prisma.token.findFirst({
      where: { userId },
    });

    if (existingToken) {
      // 3. 기존 토큰이 있으면 업데이트
      await this.prisma.token.updateMany({
        where: { userId }, // userId로 업데이트
        data: {
          refreshToken,
          expiresAt,
        },
      });
    } else {
      // 4. 기존 토큰이 없으면 새로 생성
      await this.prisma.token.create({
        data: {
          userId,
          refreshToken,
          expiresAt,
        },
      });
    }

    return refreshToken;
  }

  // 로그인 로직
  async login(
    username: string,
    password: string,
  ): Promise<{ isValid: boolean; accessToken: string; refreshToken: string }> {
    const user = await this.userService.findUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const isValid = false;
      return { isValid, accessToken: '', refreshToken: '' };
    }
    const isValid = true;
    const accessToken = this.generateToken(user.id);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    return { isValid, accessToken, refreshToken };
  }

  // refreshToken을 받아 accessToken을 재발급하는 로직
  async refreshToken(
    refreshToken: string,
  ): Promise<{ isValid: boolean; accessToken: string }> {
    //  1. refreshToken에서 userId 추출 및 만료 여부 판별
    const userId = this.jwtGuard.verifyToken(refreshToken);
    let isValid = false;
    let accessToken = '';

    if (!userId) {
      return { isValid, accessToken };
    }

    // 2. DB에서 userId와 refreshToken이 일치하는지 확인
    const tokenEntry: Token = await this.prisma.token.findFirst({
      where: {
        userId: userId,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. DB에 저장된 refreshToken과 전송된 refreshToken비교
    if (!tokenEntry || tokenEntry.refreshToken !== refreshToken) {
      return { isValid, accessToken };
    }

    // 4. 새 accessToken 발급
    const newAccessToekn = this.generateToken(userId);
    isValid = true;
    accessToken = newAccessToekn;
    return { isValid, accessToken };
  }

  // 로그아웃 로직
  async logout(
    accessToken: string,
  ): Promise<{ isValid: boolean; userId: string }> {
    // 1. 액세스토큰을 통해 사용자 정보 추출 (유효성 검증 포함)
    const userId = this.jwtGuard.verifyToken(accessToken);
    let isValid = false;

    if (!userId) {
      return { isValid, userId: '' };
    }

    // 2. 사용자 id로 토큰테이블에서 refreshToken을 업데이트
    await this.prisma.token.updateMany({
      where: { userId: userId },
      data: { refreshToken: '' },
    });

    isValid = true;

    return { isValid, userId };
  }

  // 패스워드 수정 로직
  async modifyPassword(
    accessToken: string,
    password: string,
  ): Promise<{ isValid: boolean; status: number }> {
    // 1. 액세스토큰을 통해 사용자 정보 추출 (유효성 검증 포함)
    const userId = this.jwtGuard.verifyToken(accessToken);
    let isValid = false;

    if (!userId) {
      return { isValid, status: 401 };
    }

    // 2. 사용자 id로 유저테이블에서 비밀번호 업데이트
    await this.userService.changePassword(userId, password);
    isValid = true;

    return { isValid, status: 204 };
  }

  // 토큰 유효성 검증
  async validateToken(
    accessToken: string,
  ): Promise<{ isValid: boolean; userId: string }> {
    const userId = this.jwtGuard.verifyToken(accessToken);

    if (!userId) {
      return { isValid: false, userId: '' };
    }

    return { isValid: true, userId: userId };
  }
}
