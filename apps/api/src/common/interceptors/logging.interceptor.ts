import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const requestId = request.requestId ?? '-';
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - startTime;
          this.logger.log(`[${requestId}] ${method} ${url} ${statusCode} ${responseTime}ms - ${userAgent} ${ip}`);
        },
        error: (error: { status?: number }) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} ${error.status || HttpStatus.INTERNAL_SERVER_ERROR} ${responseTime}ms - ${userAgent} ${ip}`,
          );
        },
      }),
    );
  }
}
