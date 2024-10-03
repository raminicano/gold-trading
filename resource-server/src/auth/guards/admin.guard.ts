import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGrpcService } from '../grpc/auth-grpc.service'; // gRPC 통신을 위한 서비스

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authGrpcService: AuthGrpcService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return false;
    }
    try {
      // gRPC를 통해 인증서버에 토큰 유효성 검증 요청
      const response = await this.authGrpcService.validateToken(token);
      console.log(response.role);

      if (!response.isValid) {
        throw new UnauthorizedException('유효하지 않은 Access Token입니다.');
      }

      if (response.role !== 'admin') {
        throw new ForbiddenException('관리자 권한이 필요합니다.');
      }

      // userId 추출
      request['userId'] = response.userId;
      // role 추출
      request['role'] = response.role;

      return true;
    } catch (err) {
      console.log(err);
      if (err instanceof ForbiddenException) {
        throw new ForbiddenException('관리자 권한이 필요합니다.');
      }
      // 에러가 발생하면 UnauthorizedException을 던짐
      throw new UnauthorizedException('Access Token 검증 실패');
    }
  }

  // Authorization 헤더에서 Bearer 토큰을 추출하는 함수
  extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
