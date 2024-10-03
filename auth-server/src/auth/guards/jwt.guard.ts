import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// JWT 인증을 처리하는 Guard로 JWT토큰을 검증하고 유효성을 확인하는 역할
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.userId;
      const role = payload.role;

      return { userId, role };
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('유효하지 않은 Access Token입니다.');
    }
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('JWT token is missing');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      // 토큰이 유효한 경우 요청 객체에 사용자 정보를 추가
      request.user = payload;
      return true;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : null;
  }
}
