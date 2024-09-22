import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs'; // Observable을 Promise로 변환하는 함수
import {
  CreateUserRequest,
  UserResponse,
  LoginUserRequest,
  LoginUserResponse,
} from '../../../generated/auth'; // gRPC에서 생성된 타입

// 새로운 인터페이스 정의 (기존 gRPC AuthService를 래핑)
interface AuthServiceWrapper {
  RegisterUser(request: CreateUserRequest): Observable<UserResponse>;
  LoginUser(request: LoginUserRequest): Observable<LoginUserResponse>;
}

@Injectable()
export class AuthGrpcService implements OnModuleInit {
  private authService: AuthServiceWrapper; // 래핑된 인터페이스 타입 사용

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceWrapper>('AuthService');
  }

  // gRPC 클라이언트를 통해 인증 서버에 회원가입 요청
  async registerUser(
    username: string,
    password: string,
  ): Promise<UserResponse> {
    const request: CreateUserRequest = { username, password };

    // 요청 직전 로그
    console.log('Sending gRPC request to AuthService:', request);

    // Observable을 반환하는 gRPC 호출을 Promise로 변환
    const observableResponse: Observable<UserResponse> =
      this.authService.RegisterUser(request);

    // Observable을 Promise로 변환하고 비동기 처리
    const response: UserResponse = await lastValueFrom(observableResponse);

    return response; // gRPC 응답 반환
  }

  // gRPC 클라이언트를 통해 로그인 요청
  async loginUser(
    username: string,
    password: string,
  ): Promise<LoginUserResponse> {
    const request: LoginUserRequest = { username, password };
    console.log('Sending gRPC request to AuthService:', request);
    // gRPC 호출
    const observableResponse: Observable<LoginUserResponse> =
      this.authService.LoginUser(request);
    return await lastValueFrom(observableResponse); // Observable을 Promise로 변환 후 반환
  }
}
