import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReaccessDto {
  @ApiProperty({
    description: 'Refresh token required to get a new access token',
    example: 'your-refresh-token',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
