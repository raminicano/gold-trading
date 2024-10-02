import {
  Body,
  Controller,
  Post,
  Req,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/createUser.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/loginUser.dto';
import { ReaccessDto } from '../dto/reaccess.dto';
import { Request } from 'express';
import { UpdateUserDto } from 'users/dto/updateUser.dto';
import { JwtGuard } from 'auth/guards/jwt.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtGuard: JwtGuard,
  ) {}

  // 회원가입 API
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({
    status: 400,
    description: '형식 오류 (username/password 형식이 맞지 않음)',
  })
  @ApiResponse({ status: 409, description: '이미 존재하는 사용자' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerUser(createUserDto);
  }

  // 로그인 API
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '비밀번호가 틀림' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log(loginDto);
    return this.userService.loginUser(loginDto);
  }

  // 액세스 토큰 재발급 API
  @ApiOperation({ summary: 'AccessToken 재발급' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh')
  async refreshAccessToken(@Body() reaccessDto: ReaccessDto) {
    return this.userService.refreshToken(reaccessDto);
  }

  // 로그아웃 API
  @ApiOperation({ summary: '사용자 로그아웃' })
  @ApiBearerAuth() // Swagger에서 Authorization 헤더 사용 설정
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer access token',
  })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Access Token' })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @Post('logout')
  async logout(@Req() request: Request) {
    // 1. Request 객체에서 Authorization 헤더 추출
    const token = this.jwtGuard.extractTokenFromHeader(request);
    if (!token) {
      throw new BadRequestException('유효한 Access Token이 아닙니다.');
    }

    // 2. userservice에서 로그아웃 로직 수행
    return await this.userService.logout(token);
  }

  // 비밀번호 재발급 API
  @ApiOperation({ summary: '비밀번호 재발급' })
  @ApiBearerAuth() // Swagger에서 Authorization 헤더 사용 설정
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer access token',
  })
  @ApiResponse({ status: 204, description: '비밀번호 업데이트 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Access Token' })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @Patch('modify')
  async modifyPassword(
    @Req() request: Request,
    @Body() modifyPasswordDto: UpdateUserDto, // 요청 바디에서 비밀번호 수신
  ) {
    // 1. Request 객체에서 Authorization 헤더 추출
    const authorizationHeader = request.headers['authorization'];
    console.log(authorizationHeader);

    if (!authorizationHeader) {
      throw new BadRequestException('Access Token이 누락되었습니다.');
    }

    const token = authorizationHeader.split(' ')[1]; // Bearer {token}에서 {token}만 추출

    if (!token) {
      throw new BadRequestException('유효한 Access Token이 아닙니다.');
    }

    // 2. AuthService에서 비밀번호 업데이트 로직 수행
    const { password } = modifyPasswordDto; // 요청 바디에서 비밀번호 추출

    if (!password) {
      throw new BadRequestException('비밀번호가 누락되었습니다.');
    }

    // UserService에 token과 password 전달하여 비밀번호 변경 로직 수행
    return await this.userService.modifyPassword(token, password);
  }
}
