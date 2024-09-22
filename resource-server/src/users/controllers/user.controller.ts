import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dto/loginUser.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    return this.userService.loginUser(loginDto);
  }
}
