// src/auth/dto/create-user.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username must be unique and have 3-20 characters.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
