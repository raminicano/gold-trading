import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'example_user',
    description: 'The username of the user',
  })
  username: string;

  @ApiProperty({
    example: 'Example@123',
    description: 'The password of the user',
  })
  password: string;
}
