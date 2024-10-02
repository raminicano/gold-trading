import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
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
} from '../../../generated/auth';
import { UserService } from '../../users/services/user.service';

// 컨트롤러로 변경하여 gRPC 요청을 직접 처리하는 역할
// auth.service.ts와 user.service.ts를 호출해 사용자 인증 및 토큰 발급 등 비즈니스 로직을 수행
@Controller()
export class AuthGrpcController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // gRPC에서 RegisterUser 메서드 처리
  @GrpcMethod('AuthService', 'RegisterUser')
  async registerUser(data: CreateUserRequest): Promise<UserResponse> {
    const user = await this.userService.createUser(
      data.username,
      data.password,
    );
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  // gRPC에서 LoginUser 메서드 처리
  @GrpcMethod('AuthService', 'LoginUser')
  async login(data: LoginUserRequest): Promise<LoginUserResponse> {
    const { username, password } = data;
    console.log('gRPC 로그인 요청 감지:', username);

    const tokens = await this.authService.login(username, password);
    return tokens;
  }

  // gRPC에서 RefreshAccessToken 메서드 처리
  @GrpcMethod('AuthService', 'RefreshAccessToken')
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { refreshToken } = data;
    const response = await this.authService.refreshToken(refreshToken);
    return response;
  }

  // gRPC에서 LogoutUser 메서드 처리
  @GrpcMethod('AuthService', 'LogoutUser')
  async logoutUser(data: TokenRequest): Promise<TokenResponse> {
    const { accessToken } = data;
    const response = await this.authService.logout(accessToken);
    return response;
  }

  // gRPC에서 modifyPassword 메서드 처리
  @GrpcMethod('AuthService', 'ModifyPassword')
  async modifyPassword(
    data: ModifyPasswordRequest,
  ): Promise<ModifyPasswordResponse> {
    const { accessToken, password } = data;
    const response = await this.authService.modifyPassword(
      accessToken,
      password,
    );
    return response;
  }

  // gRPC에서 토큰 유효성 검증 및 userId 추출
  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: TokenRequest): Promise<TokenResponse> {
    const { accessToken } = data;
    const response = await this.authService.validateToken(accessToken);
    return response;
  }
}
