import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { grpcServerOptions } from './config/grpc.config'; // gRPC 설정을 별도 파일에서 불러옴
import { MicroserviceOptions } from '@nestjs/microservices';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // gRPC 서버로 설정
  app.connectMicroservice<MicroserviceOptions>(grpcServerOptions);
  await app.startAllMicroservices(); // gRPC 서버 시작
  // await app.listen(3000); // HTTP 서버 필요시
}

bootstrap();
