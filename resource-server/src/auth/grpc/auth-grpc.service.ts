import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CreateUserRequest,
  UserResponse,
  AuthService,
} from '../../../../auth-server/generated/auth'; // 인증 서버에서 컴파일된 auth.ts 사용

@Injectable()
export class AuthGrpcService implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('auth') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  // gRPC 클라이언트를 통해 인증 서버에 회원가입 요청
  registerUser(username: string, password: string): Promise<UserResponse> {
    const request: CreateUserRequest = { username, password };
    return this.authService.RegisterUser(request);
  }
}
