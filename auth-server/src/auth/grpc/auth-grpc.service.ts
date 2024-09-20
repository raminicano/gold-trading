// src/auth/grpc/auth-grpc.service.ts

import { Injectable } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import {
  TokenRequest,
  TokenResponse,
  CreateUserRequest,
  UserResponse,
} from '../../../generated/auth';
import { UserService } from 'src/users/services/user.service';

// grpc 요청을 받아서 인증관련 작업을 처리하는 역할
// auth.service.ts와 user.service.ts를 호출해 사용자 인증 및 토큰 발급 등 비즈니스 로직을 수행
@Injectable()
export class AuthGrpcService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // gRPC에서 ValidateToken 메서드 처리
  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: TokenRequest): Promise<TokenResponse> {
    const isValid = await this.authService.verifyToken(data.accessToken);
    const userId = isValid
      ? await this.authService.getUserIdFromToken(data.accessToken)
      : null;
    return { isValid, userId };
  }

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
}
