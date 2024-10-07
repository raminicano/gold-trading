// src/auth/services/auth.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'auth/guards/jwt.guard';
import { Token } from '@prisma/client';
import { UserService } from 'users/services/user.service';
import { LoggingService } from 'logging/elastic-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtGuard: JwtAuthGuard,
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  // JWT 토큰 생성 함수
  generateToken(userId: number, role: string): string {
    const payload = { userId, role };
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
      await this.loggingService.logWarn('auth-logs', {
        message: `로그인 실패: ${username}`,
      });
      const isValid = false;
      return { isValid, accessToken: '', refreshToken: '' };
    }
    const isValid = true;
    const accessToken = this.generateToken(user.id, user.role);
    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    await this.loggingService.logInfo('auth-logs', {
      message: `로그인 성공: ${username}`,
    });

    return { isValid, accessToken, refreshToken };
  }

  // refreshToken을 받아 accessToken을 재발급하는 로직
  async refreshToken(
    refreshToken: string,
  ): Promise<{ isValid: boolean; accessToken: string }> {
    //  1. refreshToken에서 userId 추출 및 만료 여부 판별
    const data = this.jwtGuard.verifyToken(refreshToken);
    let isValid = false;
    let accessToken = '';

    if (!data.userId) {
      await this.loggingService.logError('auth-logs', {
        message: '유효하지 않은 Refresh Token',
        token: refreshToken,
      });
      return { isValid, accessToken };
    }

    // 2. DB에서 userId와 refreshToken이 일치하는지 확인
    const tokenEntry: Token = await this.prisma.token.findFirst({
      where: {
        userId: data.userId,
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
      await this.loggingService.logError('auth-logs', {
        message: 'RefreshToken이 일치하지 않음',
        token: refreshToken,
      });
      return { isValid, accessToken };
    }

    // 4. 새 accessToken 발급
    const newAccessToekn = this.generateToken(data.userId, data.role);
    await this.loggingService.logInfo('auth-logs', {
      message: '새로운 Access Token 발급 성공',
      userId: data.userId,
    });
    isValid = true;
    accessToken = newAccessToekn;
    return { isValid, accessToken };
  }

  // 로그아웃 로직
  async logout(
    accessToken: string,
  ): Promise<{ isValid: boolean; userId: string; role: string }> {
    // 1. 액세스토큰을 통해 사용자 정보 추출 (유효성 검증 포함)
    const data = this.jwtGuard.verifyToken(accessToken);
    let isValid = false;
    const userId = data.userId;
    const role = data.role;

    if (!userId) {
      await this.loggingService.logError('auth-logs', {
        message: '잘못된 Access Token으로 로그아웃 시도',
        token: accessToken,
      });
      return { isValid, userId: '', role: '' };
    }

    // 2. 사용자 id로 토큰테이블에서 refreshToken을 업데이트
    await this.prisma.token.updateMany({
      where: { userId: userId },
      data: { refreshToken: '' },
    });

    isValid = true;
    await this.loggingService.logInfo('auth-logs', {
      message: `로그아웃 성공: ${userId}`,
    });
    return { isValid, userId, role };
  }

  // 패스워드 수정 로직
  async modifyPassword(
    accessToken: string,
    password: string,
  ): Promise<{ isValid: boolean; status: number }> {
    // 1. 액세스토큰을 통해 사용자 정보 추출 (유효성 검증 포함)
    const data = this.jwtGuard.verifyToken(accessToken);
    let isValid = false;
    const userId = data.userId;

    if (!userId) {
      await this.loggingService.logError('auth-logs', {
        message: '잘못된 Access Token으로 패스워드 수정 시도',
        token: accessToken,
      });
      return { isValid, status: 401 };
    }

    // 2. 사용자 id로 유저테이블에서 비밀번호 업데이트
    await this.userService.changePassword(userId, password);
    isValid = true;

    await this.loggingService.logInfo('auth-logs', {
      message: `패스워드 변경 성공: ${userId}`,
    });
    return { isValid, status: 204 };
  }

  // 토큰 유효성 검증
  async validateToken(
    accessToken: string,
  ): Promise<{ isValid: boolean; userId: string; role: string }> {
    try {
      const user = this.jwtGuard.verifyToken(accessToken);

      if (!user.userId) {
        await this.loggingService.logError('auth-logs', {
          message: '잘못된 Access Token으로 토큰 유효성 검증 시도',
          token: accessToken,
        });
        return { isValid: false, userId: '', role: '' };
      } else {
        await this.loggingService.logInfo('auth-logs', {
          message: `토큰 유효성 검증 성공: ${user.userId}`,
        });
        return { isValid: true, userId: user.userId, role: user.role };
      }
    } catch (error) {
      // gRPC에서 Unauthorized 에러를 처리하고 반환
      throw error; // NestJS가 자동으로 401 에러를 발생시킴
    }
  }
}
