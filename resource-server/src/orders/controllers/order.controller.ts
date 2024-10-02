import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtGuard)
  @Post('api/:type')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiParam({
    name: 'type',
    enum: ['buy', 'sell'],
    description: 'Order type (buy or sell)',
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Price conflict, order creation failed',
  })
  async createOrder(
    @Param('type') type: 'buy' | 'sell',
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return await this.orderService.createOrder(type, createOrderDto);
  }
}
