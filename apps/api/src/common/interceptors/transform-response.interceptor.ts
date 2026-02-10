import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'status' in data && 'message' in data) {
          return data as Response<T>;
        }
        return {
          status: 'success',
          message: (data as { message?: string })?.message || 'Request processed successfully',
          data: (data as { data?: T })?.data !== undefined ? (data as { data: T }).data : data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
