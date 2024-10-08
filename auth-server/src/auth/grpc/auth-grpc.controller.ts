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
import { LoggingService } from '../../logging/elastic-logger.service'; // 로그 서비스

// 컨트롤러로 변경하여 gRPC 요청을 직접 처리하는 역할
// auth.service.ts와 user.service.ts를 호출해 사용자 인증 및 토큰 발급 등 비즈니스 로직을 수행
@Controller()
export class AuthGrpcController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  // gRPC에서 RegisterUser 메서드 처리
  @GrpcMethod('AuthService', 'RegisterUser')
  async registerUser(data: CreateUserRequest): Promise<UserResponse> {
    await this.loggingService.logInfo('grpc-logs', {
      message: `RegisterUser 요청 수신: ${data.username}`,
    });

    const user = await this.userService.createUser(
      data.username,
      data.password,
    );
    await this.loggingService.logInfo('grpc-logs', {
      message: `RegisterUser 성공: ${user.id}`,
    });
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
    await this.loggingService.logInfo('grpc-logs', {
      message: `LoginUser 요청 수신: ${data.username}`,
    });

    const tokens = await this.authService.login(username, password);
    await this.loggingService.logInfo('grpc-logs', {
      message: `LoginUser 응답: ${tokens.isValid}`,
    });
    return tokens;
  }

  // gRPC에서 RefreshAccessToken 메서드 처리
  @GrpcMethod('AuthService', 'RefreshAccessToken')
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const { refreshToken } = data;
    await this.loggingService.logInfo('grpc-logs', {
      message: `RefreshAccessToken 요청 수신: ${data.refreshToken}`,
    });
    const response = await this.authService.refreshToken(refreshToken);
    await this.loggingService.logInfo('grpc-logs', {
      message: `RefreshAccessToken 응답: ${response.isValid}`,
    });
    return response;
  }

  // gRPC에서 LogoutUser 메서드 처리
  @GrpcMethod('AuthService', 'LogoutUser')
  async logoutUser(data: TokenRequest): Promise<TokenResponse> {
    const { accessToken } = data;
    await this.loggingService.logInfo('grpc-logs', {
      message: `LogoutUser 요청 수신: ${data.accessToken}`,
    });
    const response = await this.authService.logout(accessToken);
    await this.loggingService.logInfo('grpc-logs', {
      message: `LogoutUser 응답: ${response.userId}, ${response.isValid}`,
    });
    return response;
  }

  // gRPC에서 modifyPassword 메서드 처리
  @GrpcMethod('AuthService', 'ModifyPassword')
  async modifyPassword(
    data: ModifyPasswordRequest,
  ): Promise<ModifyPasswordResponse> {
    const { accessToken, password } = data;
    await this.loggingService.logInfo('grpc-logs', {
      message: `ModifyPassword 요청 수신: ${data.accessToken}`,
    });
    const response = await this.authService.modifyPassword(
      accessToken,
      password,
    );
    await this.loggingService.logInfo('grpc-logs', {
      message: `ModifyPassword 응답: ${response.status}, ${response.isValid}`,
    });
    return response;
  }

  // gRPC에서 토큰 유효성 검증 및 userId 추출
  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: TokenRequest): Promise<TokenResponse> {
    const { accessToken } = data;
    await this.loggingService.logInfo('grpc-logs', {
      message: `ValidateToken 요청 수신: ${data.accessToken}`,
    });
    const response = await this.authService.validateToken(accessToken);
    await this.loggingService.logInfo('grpc-logs', {
      message: `ValidateToken 응답: ${response.userId}, ${response.isValid}`,
    });
    return response;
  }
}
