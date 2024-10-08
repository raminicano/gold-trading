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
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';

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
    const role = request['role'];
    return await this.orderService.getOrderById(type, orderId, userId, role);
  }

  // 사용자 주문 조회
  @UseGuards(AdminGuard)
  @Get('admin/:type/:username')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Get buy orders by username (Admin or user's own orders)",
  })
  @ApiParam({
    name: 'type',
    enum: ['buy', 'sell'],
    description: 'Order type (buy or sell)',
  })
  @ApiParam({
    name: 'username',
    description: 'Username of the user to retrieve orders',
  })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOrders(
    @Param('username') username: string,
    @Param('type') type: 'buy' | 'sell',
  ) {
    return await this.orderService.getOrdersByUsername(type, username);
  }

  // 페이지네이션을 통한 주문 내역 조회 API
  @UseGuards(JwtGuard)
  @Get('api/:type/all/pagination')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '페이지네이션을 통한 주문 내역 조회' })
  @ApiParam({
    name: 'type',
    enum: ['buy', 'sell'],
    description: 'Order type (buy or sell)',
  })
  @ApiResponse({ status: 200, description: 'Search successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrdersWithPagination(
    @Param('type') type: 'buy' | 'sell',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Req() request: Request,
  ) {
    // JWT에서 userId 추출
    const userId = Number(request['userId']);

    // 서비스로 전달
    return await this.orderService.getOrdersWithPagination(
      type,
      userId,
      startDate,
      endDate,
      Number(limit),
      Number(offset),
    );
  }

  // 주문 수정
  @UseGuards(JwtGuard)
  @Patch('api/:type/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({
    name: 'type',
    enum: ['buy', 'sell'],
    description: 'Order type (buy or sell)',
  })
  @ApiParam({ name: 'orderId', description: 'Order ID to update' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not allowed to modify this order',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Invalid state transition',
  })
  async updateOrder(
    @Param('type') type: 'buy' | 'sell',
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() request: Request,
  ) {
    const userId = Number(request['userId']); // JWT에서 추출된 userId
    const userRole = request['role']; // JWT에서 추출된 role

    // 주문 수정 로직을 서비스로 전달
    return await this.orderService.updateOrder(
      type,
      orderId,
      userId,
      userRole,
      updateOrderDto,
    );
  }

  // Soft delete 주문 삭제 API
  @UseGuards(JwtGuard)
  @Delete('api/:type/:orderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an order' })
  @ApiParam({
    name: 'type',
    enum: ['buy', 'sell'],
    description: 'Order type (buy or sell)',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID to delete',
  })
  @ApiResponse({ status: 204, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async softDeleteOrder(
    @Param('type') type: 'buy' | 'sell',
    @Param('orderId') orderId: string,
    @Req() request: Request,
  ) {
    const userId = Number(request['userId']);
    const role = request['role'];

    // Soft delete: `deletedAt` 필드만 업데이트
    await this.orderService.softDeleteOrder(type, orderId, userId, role);
  }

  // Hard delete 주문 삭제 API
  @UseGuards(JwtGuard)
  @Delete('api/:type/:orderId/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete an order' })
  @ApiParam({
    name: 'type',
    enum: ['buy', 'sell'],
    description: 'Order type (buy or sell)',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID to hard delete',
  })
  @ApiResponse({ status: 204, description: 'Order hard deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async hardDeleteOrder(
    @Param('type') type: 'buy' | 'sell',
    @Param('orderId') orderId: string,
    @Req() request: Request,
  ) {
    const userId = Number(request['userId']);
    const role = request['role'];

    // Hard delete: 주문을 데이터베이스에서 완전히 삭제
    await this.orderService.hardDeleteOrder(type, orderId, userId, role);
  }
}
