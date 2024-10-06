import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    example: '입금 완료',
    description: 'Order status, only admins can change this',
    enum: ['주문 완료', '입금 완료', '발송 완료', '송금 완료', '수령 완료'],
  })
  @IsOptional() // 필수값이 아님
  @IsString()
  @IsIn(['주문 완료', '입금 완료', '발송 완료', '송금 완료', '수령 완료']) // 가능한 상태 목록
  status?: string;

  @ApiPropertyOptional({
    example: 60.0,
    description: 'Order quantity in grams, can only be updated by the user',
  })
  @IsOptional()
  @IsNumber()
  @Min(1) // 최소 주문량 제한
  quantity?: number;

  @ApiPropertyOptional({
    example: '서울시 서초구...',
    description:
      'Delivery address for the order, can only be updated by the user',
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}
