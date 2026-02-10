import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppError } from '../errors/app-error';

interface ExpressRequest {
  method: string;
  url: string;
}

interface ExpressResponse {
  status: (code: number) => ExpressResponse;
  json: (body: Record<string, unknown>) => void;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();
    const request = ctx.getRequest<ExpressRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        const messages = (exceptionResponse as { message: string | string[] }).message;
        message = Array.isArray(messages) ? messages.join(', ') : (messages as string);
      } else {
        message = typeof exceptionResponse === 'string' ? exceptionResponse : exception.message;
      }
    } else if ((exception as { code?: string }).code === 'P2002') {
      status = HttpStatus.BAD_REQUEST;
      message = 'A record with this value already exists.';
    } else if ((exception as { name?: string }).name === 'JsonWebTokenError') {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Invalid token. Please log in again';
    } else if ((exception as { name?: string }).name === 'TokenExpiredError') {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Your token has expired. Please log in again';
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    this.logger.error(`${request.method} ${request.url}`, isDevelopment ? exception : message);

    const errorResponse: Record<string, unknown> = {
      status: status >= HttpStatus.INTERNAL_SERVER_ERROR ? 'error' : 'fail',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    if (isDevelopment) {
      errorResponse.error = exception;
      errorResponse.stack = (exception as Error).stack;
    }

    response.status(status).json(errorResponse);
  }
}
