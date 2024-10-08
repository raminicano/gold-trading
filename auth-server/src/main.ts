import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // gRPC 서버로 설정
  const microservice = app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(__dirname, '../../../grpc/auth.proto'),
        loader: {
          includeDirs: [join(__dirname, '../../../grpc/proto')],
        },
        url: 'localhost:50051',
      },
    },
    {
      inheritAppConfig: true, // 이 설정을 통해 글로벌 필터, 가드, 파이프 등이 상속됩니다.
    },
  );

  await app.startAllMicroservices(); // gRPC 서버 시작
  await app.listen(3000); // 필요시 HTTP 서버도 함께 실행
}

bootstrap();
