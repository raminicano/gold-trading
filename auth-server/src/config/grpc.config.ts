import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcServerOptions: ClientOptions = {
  transport: Transport.GRPC,
  options: {
    package: 'auth', // auth.proto에서 정의한 패키지 이름
    protoPath: join(__dirname, '../../../../grpc/auth.proto'), // proto 파일 경로
    url: '0.0.0.0:50051', // gRPC 서버가 실행될 주소
  },
};
