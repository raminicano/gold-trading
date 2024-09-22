import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthGrpcService } from '../../auth/grpc/auth-grpc.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { LoginDto } from 'users/dto/loginUser.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authGrpcService: AuthGrpcService,
  ) {}

  // 회원가입 처리
  async registerUser(createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    // 1. 유저가 이미 존재하는지 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT); // 409
    }

    // 2. 정규 표현식으로 username 및 password 검증
    const usernameRegex = /^[a-zA-Z0-9._]{3,20}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!usernameRegex.test(username)) {
      throw new HttpException(
        'Invalid username format',
        HttpStatus.BAD_REQUEST,
      ); // 400
    }

    if (!passwordRegex.test(password)) {
      throw new HttpException(
        'Invalid password format',
        HttpStatus.BAD_REQUEST,
      ); // 400
    }

    // 3. 인증 서버에 gRPC 요청을 통해 회원가입
    const grpcResponse = await this.authGrpcService.registerUser(
      username,
      password,
    );

    // 4. 자원 서버에 사용자 정보 저장 (userId와 username만 저장)
    await this.prisma.user.create({
      data: {
        userId: grpcResponse.id, // 인증 서버에서 받은 userId
        username: grpcResponse.username,
      },
    });

    return { statusCode: HttpStatus.CREATED }; // 201
  }

  // 로그인 처리
  async loginUser(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 1. 유저가 없는 경우 (자원서버의 User 테이블 조회)
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND); // 404
    }

    // 2. gRPC 클라이언트를 통해 인증 서버에 로그인 요청
    const grpcResponse = await this.authGrpcService.loginUser(
      username,
      password,
    );

    // 3. isValid 값으로 유효성 검증
    if (!grpcResponse.isValid) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED); // 401
    }

    return {
      success: true,
      message: 'User login successfully',
      data: {
        accessToken: grpcResponse.accessToken,
        refreshToken: grpcResponse.refreshToken,
      },
    };
  }
}
