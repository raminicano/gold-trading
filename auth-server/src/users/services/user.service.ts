import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

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

  // 사용자 검색 후 패스워드 변경
  async updateUser(id: number, password: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { password },
    });
  }

  // 사용자 이름으로 검색
  async findUserByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  // 사용자 아이디로 검색
  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // 사용자 비밀번호 업데이트
  async changePassword(id: number, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
