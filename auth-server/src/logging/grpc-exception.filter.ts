import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { LoggingService } from './elastic-logger.service';

@Catch()
export class GrpcExceptionFilter implements RpcExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getContext();

    // 로그 기록
    this.loggingService.logError('grpc-error-logs', {
      message: 'gRPC 요청 중 에러 발생',
      error: exception.message,
      requestData: data,
    });

    return throwError(() => exception);
  }
}
