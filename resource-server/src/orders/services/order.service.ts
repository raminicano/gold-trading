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

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
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

    // 주문 타입에 따라 다른 테이블에 저장
    if (type === 'buy') {
      return await this.prisma.buyOrder.create({
        data: {
          orderId,
          userId: (await user).userId,
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
      return await this.prisma.sellOrder.create({
        data: {
          orderId,
          userId: (await user).userId,
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
  }

  async getOrderById(type: 'buy' | 'sell', orderId: string, userId: number) {
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
    if (order.userId !== userId) {
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
        amount: order.quantity * order.price,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
      },
    };
  }
}
