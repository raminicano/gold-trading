import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs'; // Observable을 Promise로 변환하는 함수
import {
  CreateUserRequest,
  UserResponse,
  LoginUserRequest,
  LoginUserResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  TokenRequest,
  TokenResponse,
  ModifyPasswordRequest,
  ModifyPasswordResponse,
} from '../../../generated/auth'; // gRPC에서 생성된 타입

// 새로운 인터페이스 정의 (기존 gRPC AuthService를 래핑)
interface AuthServiceWrapper {
  RegisterUser(request: CreateUserRequest): Observable<UserResponse>;
  LoginUser(request: LoginUserRequest): Observable<LoginUserResponse>;
  RefreshAccessToken(
    request: RefreshTokenRequest,
  ): Observable<RefreshTokenResponse>;
  LogoutUser(request: TokenRequest): Observable<TokenResponse>;
  ModifyPassword(
    request: ModifyPasswordRequest,
  ): Observable<ModifyPasswordResponse>;
  ValidateToken(request: TokenRequest): Observable<TokenResponse>;
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

  // accessToken 재발급 요청
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    const observableResponse: Observable<RefreshTokenResponse> =
      this.authService.RefreshAccessToken(request);
    return await lastValueFrom(observableResponse);
  }

  // 로그아웃 요청
  async logoutUser(accessToken: string): Promise<TokenResponse> {
    const request: TokenRequest = { accessToken };
    const observableResponse: Observable<TokenResponse> =
      this.authService.LogoutUser(request);
    return await lastValueFrom(observableResponse);
  }

  // 비밀번호 변경 요청
  async modifyPassword(accessToken: string, password: string) {
    const request: ModifyPasswordRequest = { accessToken, password };
    const observableResponse: Observable<ModifyPasswordResponse> =
      this.authService.ModifyPassword(request);
    return await lastValueFrom(observableResponse);
  }

  // 토큰 유효성 검증
  async validateToken(accessToken: string): Promise<TokenResponse> {
    const request: TokenRequest = { accessToken };
    const observableResponse: Observable<TokenResponse> =
      this.authService.ValidateToken(request);
    return await lastValueFrom(observableResponse);
  }
}
