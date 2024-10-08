import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { LoggingService } from 'logging/elastic-logger.service';
import { HttpExceptionFilter } from './logging/http-exception.filter';
import { AllExceptionsFilter } from 'logging/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // GrpcExceptionFilter를 글로벌 필터로 사용하기 위해 NestJS의 의존성 주입을 활용
  // const loggingService = app.get(LoggingService);
  // HTTP 관련 예외는 HttpExceptionFilter에서 처리
  // app.useGlobalFilters(new HttpExceptionFilter(loggingService));

  // 모든 예외를 처리하는 AllExceptionsFilter
  // app.useGlobalFilters(new AllExceptionsFilter(loggingService));

  const config = new DocumentBuilder()
    .setTitle('Resource Server API')
    .setDescription('자원 서버 API 문서')
    .setVersion('1.0')
    .addTag('users')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, // Bearer 토큰 설정
      'accessToken', // 토큰 키
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Global validation pipe 설정 (유효성 검사 실패 시 400 에러 반환)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 값은 자동으로 제거
      forbidNonWhitelisted: true, // 정의되지 않은 값이 들어오면 에러 반환
      transform: true, // 요청 데이터를 DTO로 자동 변환
    }),
  );

  app.enableCors({
    allowedHeaders: 'Authorization, Content-Type',
  });

  await app.listen(9999); // 요구사항 자원서버는 9999포트
}
bootstrap();
