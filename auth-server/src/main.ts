import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
// import { grpcServerOptions } from './config/grpc.config'; // gRPC 설정을 별도 파일에서 불러옴
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);

  // gRPC 서버로 설정
  // app.connectMicroservice<MicroserviceOptions>(grpcServerOptions);
  // await app.startAllMicroservices(); // gRPC 서버 시작
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
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
  );
  await app.listen();
}
bootstrap();
