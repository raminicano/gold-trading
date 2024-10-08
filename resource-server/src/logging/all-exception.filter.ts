import { Catch, ExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { LoggingService } from './elastic-logger.service';

@Catch() // 모든 예외 처리
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  async catch(exception: any): Promise<Observable<any>> {
    // 로그 기록을 위한 메시지 생성
    const logMessage = {
      error: exception.message,
      stack: exception.stack,
    };

    await this.loggingService.logError('non-http-error-logs', logMessage);

    return throwError(() => exception);
  }
}
