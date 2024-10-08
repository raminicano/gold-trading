import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGrpcService } from './auth/grpc/auth-grpc.service'; // gRPC 서비스
import { UserService } from './users/services/user.service';
import { UserController } from './users/controllers/user.controller';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';
import { JwtGuard } from 'auth/guards/jwt.guard';
import { AdminGuard } from 'auth/guards/admin.guard';
import { OrderController } from 'orders/controllers/order.controller';
import { OrderService } from 'orders/services/order.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { elasticConfig } from 'config/elastic.config';
import { LoggingService } from 'logging/elastic-logger.service';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'logging/all-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
    ElasticsearchModule.register({
      node: elasticConfig.node,
    }),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE', // 이 이름으로 DI에서 사용됨
        transport: Transport.GRPC,
        options: {
          package: 'auth', // auth.proto에 정의된 package 이름 (없을 경우 빈 문자열)
          protoPath: join(__dirname, '../../../grpc/auth.proto'), // 인증 서버의 proto 파일 경로
          url: '0.0.0.0:50051', // 인증 서버의 gRPC 주소
        },
      },
    ]),
  ],
  controllers: [AppController, UserController, OrderController],
  providers: [
    AppService,
    AuthGrpcService,
    UserService,
    PrismaService,
    JwtGuard,
    OrderService,
    AdminGuard,
    LoggingService,
    // { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
