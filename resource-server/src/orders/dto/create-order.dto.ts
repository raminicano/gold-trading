import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'yunju', description: '유저 이름' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 1,
    description: 'Item ID (1: 99.9% 금, 2: 99.99% 금)',
  })
  @IsNumber()
  @IsNotEmpty()
  itemId: number;

  @ApiProperty({
    example: '50.75',
    description: 'Quantity in grams, max 2 decimal places',
  })
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 5000, description: 'Price per gram (in KRW)' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: '서울시 강남구...', description: 'Delivery address' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;
}
