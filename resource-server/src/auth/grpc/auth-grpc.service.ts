import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs'; // Observable을 Promise로 변환하는 함수
import {
  CreateUserRequest,
  UserResponse,
  AuthService,
} from '../../../generated/auth';  // gRPC에서 생성된 타입

@Injectable()
export class AuthGrpcService implements OnModuleInit {
  private authService: AuthService;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  // gRPC 클라이언트를 통해 인증 서버에 회원가입 요청
  async registerUser(username: string, password: string): Promise<UserResponse> {
    const request: CreateUserRequest = { username, password };

    // 요청 직전 로그
    console.log('Sending gRPC request to AuthService:', request);

    // Observable을 반환하는 gRPC 호출
    const response = this.authService.RegisterUser(request);

    // Observable을 Promise로 변환하고 비동기 처리
    // const response: UserResponse = await lastValueFrom(observableResponse);
    
    console.log('gRPC response from AuthService:', response);
    return response; // gRPC 응답 반환
  }
}
