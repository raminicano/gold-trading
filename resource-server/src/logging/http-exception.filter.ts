import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from './elastic-logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const logMessage = {
      method: request.method,
      url: request.url,
      statusCode: status,
      message: exception.message,
    };

    await this.loggingService.logError('http-error-logs', logMessage);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
