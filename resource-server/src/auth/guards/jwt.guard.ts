import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthGrpcService } from '../grpc/auth-grpc.service'; // gRPC 통신을 위한 서비스

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly authGrpcService: AuthGrpcService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    // console.log(token);
    if (!token) {
      return false;
    }

    try {
      // gRPC를 통해 인증서버에 토큰 유효성 검증 요청
      const response = await this.authGrpcService.validateToken(token);

      return response.isValid;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  // Authorization 헤더에서 Bearer 토큰을 추출하는 함수
  extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    console.log(authHeader);
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
