import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UserService } from 'users/services/user.service';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { LoggingService } from 'logging/elastic-logger.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  private generateOrderId(username: string): string {
    const date = new Date();

    // 년월일을 6자리로 생성 (YYYYMMDD 형식)
    const datePart = `${date.getFullYear().toString().slice(2, 4)}${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    // username의 앞 2글자 추출, 없을 시 default 처리
    const userPart = username.substring(0, 2).toLowerCase();

    // 3자리 랜덤 코드 생성 (숫자/알파벳 혼합)
    const randomCode = Math.random().toString(36).substring(2, 5);

    // 최종 주문번호 생성 (예: "240916-yu-392")
    return `${datePart}-${userPart}-${randomCode}`;
  }

  async createOrder(type: 'buy' | 'sell', createOrderDto: CreateOrderDto) {
    const { username, itemId, quantity, price, deliveryAddress } =
      createOrderDto;

    // 서버에서 관리하는 최신 가격과 클라이언트에서 받은 가격 비교
    const latestPrice = await this.prisma.price.findFirst({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestPrice) {
      throw new BadRequestException('해당 상품에 대한 가격 정보가 없습니다.');
    }

    let adjustedPrice = latestPrice.price;

    // 주문 타입에 따라 가격 조정
    if (type === 'buy') {
      adjustedPrice = latestPrice.price * 1.05; // 5% 비싸게 구매
    } else if (type === 'sell') {
      adjustedPrice = latestPrice.price * 0.95; // 5% 싸게 판매
    }

    // 가격이 일치하는지 확인 (409 에러 처리)
    if (adjustedPrice !== price) {
      await this.loggingService.logWarn('order-warn-logs', {
        message: 'Price mismatch detected during order creation',
        requsetedPrice: price,
        adjustedPrice: adjustedPrice,
      });
      throw new ConflictException({
        success: false,
        message:
          '가격이 변경되었습니다. 최신 가격을 확인한 후 다시 시도하세요.',
        data: {
          latestPrice: adjustedPrice,
        },
      });
    }

    // 유저 찾기
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new BadRequestException({
        success: false,
        message: '유저가 없음. 사용자가 없음.',
      });
    }

    const amount = Number(quantity) * price; // 총 금액 계산

    const orderId = this.generateOrderId((await user).username);

    // 주문 생성
    let newOrder;
    if (type === 'buy') {
      newOrder = await this.prisma.buyOrder.create({
        data: {
          orderId,
          userId: user.userId,
          status: '주문 완료',
          itemId,
          quantity,
          price,
          amount,
          deliveryAddress,
          orderDate: new Date(),
        },
      });
    } else if (type === 'sell') {
      newOrder = await this.prisma.sellOrder.create({
        data: {
          orderId,
          userId: user.userId,
          status: '주문 완료',
          itemId,
          quantity,
          price,
          amount,
          deliveryAddress,
          orderDate: new Date(),
        },
      });
    }

    // 주문 성공 로그 기록
    await this.loggingService.logInfo('order-logs', {
      message: 'Order created successfully',
      orderId: newOrder.orderId,
      type,
    });

    return newOrder;
  }

  async getOrderById(
    type: 'buy' | 'sell',
    orderId: string,
    userId: number,
    role: string,
  ) {
    // 'buy' 또는 'sell'에 따라 적절한 테이블에서 주문 조회
    let order;
    if (type === 'buy') {
      order = await this.prisma.buyOrder.findFirst({
        where: { orderId },
      });
    } else if (type === 'sell') {
      order = await this.prisma.sellOrder.findFirst({
        where: { orderId },
      });
    }

    if (!order) {
      throw new NotFoundException({
        success: false,
        message: '주문을 찾을 수 없습니다.',
        data: {},
      });
    }

    // 주문 조회 성공 시 유저 정보와 비교 (로그인한 사용자가 자신의 주문만 조회 가능)
    // 관리자는 조회 가능
    if (order.userId !== userId && role !== 'admin') {
      await this.loggingService.logWarn('order-warn-logs', {
        message: 'Unauthorized order access attempt',
        orderId: orderId,
        userId: userId,
      });
      throw new ForbiddenException({
        success: false,
        message: '유효하지 않은 접근입니다.',
        data: {},
      });
    }

    return {
      success: true,
      message: '주문 세부 정보 검색을 성공하였습니다.',
      data: {
        orderId: order.orderId,
        itemId: order.itemId,
        quantity: order.quantity,
        price: order.price,
        amount: order.amount,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
      },
    };
  }

  async getOrdersByUsername(type: 'buy' | 'sell', username: string) {
    // 유저이름으로 유저 찾기
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: '유저를 찾을 수 없습니다.',
        data: {},
      });
    }

    // 'buy' 또는 'sell'에 따라 적절한 테이블에서 주문 조회
    let orders;
    if (type === 'buy') {
      orders = await this.prisma.buyOrder.findMany({
        where: { userId: user.userId },
      });
    } else if (type === 'sell') {
      orders = await this.prisma.sellOrder.findFirst({
        where: { userId: user.userId },
      });
    }

    return {
      success: true,
      message: 'All orders retrieved successfully',
      data: orders.map((order) => ({
        orderId: order.orderId,
        itemId: order.itemId,
        quantity: order.quantity,
        price: order.price,
        amount: order.amount,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
      })),
    };
  }

  // 페이지네이션을 통해 주문 내역 조회
  async getOrdersWithPagination(
    type: 'buy' | 'sell',
    userId: number,
    startDate: string,
    endDate: string,
    limit: number,
    offset: number,
  ) {
    // buy 또는 sell에 따라 조회 테이블 변경
    let orders;
    let totalCount;
    if (type === 'buy') {
      orders = await this.prisma.buyOrder.findMany({
        where: {
          userId,
          orderDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        skip: offset,
        take: limit,
        orderBy: { orderDate: 'desc' },
      });

      // 전체 개수 확인
      totalCount = await this.prisma.buyOrder.count({
        where: {
          userId,
          orderDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
    } else if (type === 'sell') {
      orders = await this.prisma.sellOrder.findMany({
        where: {
          userId,
          orderDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        skip: offset,
        take: limit,
        orderBy: { orderDate: 'desc' },
      });

      // 전체 개수 확인
      totalCount = await this.prisma.sellOrder.count({
        where: {
          userId,
          orderDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
    }

    // 다음 페이지가 있는지 확인
    const nextOffset = offset + limit;
    const hasNextPage = nextOffset < totalCount;

    // 링크 생성
    const nextLink = hasNextPage
      ? `/api/${type}/all/pagination?startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${nextOffset}`
      : null;

    return {
      success: true,
      message: 'Success to search orders',
      data: orders.map((order) => ({
        orderId: order.orderId,
        itemId: order.itemId,
        quantity: order.quantity,
        price: order.price,
        amount: order.amount,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
      })),
      links: {
        next: nextLink,
        previous:
          offset > 0
            ? `/api/${type}/pagination?startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${offset - limit}`
            : null,
      },
    };
  }

  // 주문 상태 변경
  async updateOrder(
    type: 'buy' | 'sell',
    orderId: string,
    userId: number,
    userRole: string,
    updateOrderDto: UpdateOrderDto,
  ) {
    // 주문 상태 변경
    let order;
    if (type === 'buy') {
      order = await this.prisma.buyOrder.findFirst({
        where: { orderId },
      });
    } else if (type === 'sell') {
      order = await this.prisma.sellOrder.findFirst({
        where: { orderId },
      });
    }

    if (!order) {
      throw new NotFoundException({
        success: false,
        message: '주문을 찾을 수 없습니다.',
        data: {},
      });
    }

    // 사용자는 자신의 주문만 수정가능. 관리자는 모든 주문 수정 가능
    if (order.userId !== userId && userRole !== 'admin') {
      await this.loggingService.logWarn('order-warn-logs', {
        message: 'Unauthorized order access attempt',
        orderId: orderId,
        userId: userId,
      });
      throw new ForbiddenException({
        success: false,
        message: '유효하지 않은 접근입니다.',
        data: {},
      });
    }

    // 상태 전환 체크 (순차적 상태 전환)
    const validStatusTransitions = {
      '주문 완료': ['입금 완료'],
      '입금 완료': ['발송 완료'],
      '발송 완료': [],
      '송금 완료': ['수령 완료'],
    };

    if (updateOrderDto.status) {
      if (userRole !== 'admin') {
        throw new ForbiddenException({
          success: false,
          message: '관리자만 상태를 변경할 수 있습니다.',
          data: {},
        });
      }

      if (
        !validStatusTransitions[order.status]?.includes(updateOrderDto.status)
      ) {
        throw new ConflictException({
          success: false,
          message: `Invalid state transition: Cannot change from '${order.status}' to '${updateOrderDto.status}'. The order must follow the correct process.`,
          data: {},
        });
      }
    }

    // 주문 수정
    let updatedOrder;
    if (type === 'buy') {
      // buyOrder에 대해 업데이트
      updatedOrder = await this.prisma.buyOrder.update({
        where: { orderId },
        data: {
          ...updateOrderDto, // status, quantity, deliveryAddress만 업데이트
        },
      });
    } else if (type === 'sell') {
      // sellOrder에 대해 업데이트
      updatedOrder = await this.prisma.sellOrder.update({
        where: { orderId },
        data: {
          ...updateOrderDto, // status, quantity, deliveryAddress만 업데이트
        },
      });
    }

    return {
      success: true,
      message: 'Order updated successfully',
      data: {
        orderId: updatedOrder.orderId,
        status: updatedOrder.status,
        quantity: updatedOrder.quantity,
        deliveryAddress: updatedOrder.deliveryAddress,
      },
    };
  }

  // Soft delete: 주문의 deletedAt 필드를 업데이트
  async softDeleteOrder(
    type: 'buy' | 'sell',
    orderId: string,
    userId: number,
    role: string,
  ) {
    // 먼저 getOrderById를 호출하여 주문을 찾고, 권한 체크를 수행
    await this.getOrderById(type, orderId, userId, role);

    // 권한이 맞는지 확인한 후 soft delete 처리
    let deletedOrder;
    if (type === 'buy') {
      deletedOrder = await this.prisma.buyOrder.update({
        where: { orderId },
        data: { deletedAt: new Date() }, // 논리적으로 삭제
      });
    } else if (type === 'sell') {
      deletedOrder = await this.prisma.sellOrder.update({
        where: { orderId },
        data: { deletedAt: new Date() }, // 논리적으로 삭제
      });
    }
    return deletedOrder;
  }

  // Hard delete: 주문을 데이터베이스에서 완전히 삭제
  async hardDeleteOrder(
    type: 'buy' | 'sell',
    orderId: string,
    userId: number,
    role: string,
  ) {
    // 주문을 먼저 확인하고 삭제 (권한 체크 포함)
    await this.getOrderById(type, orderId, userId, role);

    // 권한이 맞는지 확인한 후 hard delete 처리
    let deletedOrder;
    if (type === 'buy') {
      deletedOrder = await this.prisma.buyOrder.delete({
        where: { orderId },
      });
    } else if (type === 'sell') {
      deletedOrder = await this.prisma.sellOrder.delete({
        where: { orderId },
      });
    }
    return deletedOrder;
  }
}
