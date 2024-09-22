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

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
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
  controllers: [AppController, UserController],
  providers: [AppService, AuthGrpcService, UserService, PrismaService],
})
export class AppModule {}
