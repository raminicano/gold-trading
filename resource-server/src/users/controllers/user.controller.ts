import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
}
