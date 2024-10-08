import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { UserService } from './users/services/user.service';
import databaseConfig from './config/database.config';
import { AuthService } from 'auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGrpcController } from './auth/grpc/auth-grpc.controller';
import { JwtAuthGuard } from 'auth/guards/jwt.guard';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { LoggingService } from 'logging/elastic-logger.service';
import { elasticConfig } from 'config/elastic.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
    ElasticsearchModule.register({
      node: elasticConfig.node,
    }),
    AuthModule,
  ],
  controllers: [AppController, AuthGrpcController],
  providers: [
    AppService,
    PrismaService,
    UserService,
    AuthService,
    JwtService,
    JwtAuthGuard,
    LoggingService,
  ],
})
export class AppModule {}
