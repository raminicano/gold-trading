import { Injectable } from '@nestjs/common';
import { UserService } from '../../users/services/user.service';
import { JwtService } from '@nestjs/jwt';

// 토큰 검증과 토큰에서 사용자 정보 추출을 담당

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // 유효한 토큰인지 확인
  async verifyToken(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);
      return !!decoded;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // 토큰에서 사용자 ID 추출
  async getUserIdFromToken(token: string): Promise<string | null> {
    try {
      const decoded = this.jwtService.decode(token);
      return decoded ? decoded['userId'] : null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
