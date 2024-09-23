import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: '비밀번호 재생성',
    example: 'Test1234!',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
