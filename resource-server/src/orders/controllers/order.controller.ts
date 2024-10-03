import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Get,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth('accessToken') // Swagger에 Bearer 토큰 적용
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 주문 생성
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

  // 단일 주문 조회
  @UseGuards(JwtGuard)
  @Get('api/:type/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single order' })
  @ApiParam({
    name: 'type',
    enum: ['buy', 'sell'],
    description: 'Order type (buy or sell)',
  })
  @ApiParam({ name: 'orderId', description: 'Order ID to retrieve' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not allowed to view this order',
  })
  async getOrder(
    @Param('type') type: 'buy' | 'sell',
    @Param('orderId') orderId: string,
    @Req() request: Request,
  ) {
    const userId = Number(request['userId']); // jwt guard에서 추출한 userid
    return await this.orderService.getOrderById(type, orderId, userId);
  }
}
