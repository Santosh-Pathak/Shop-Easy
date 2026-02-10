import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

const HEADER_NAME = 'x-request-id';

/** Generates a short unique id (not UUID for brevity in logs). */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = (req.headers[HEADER_NAME] as string) || generateId();
    req.requestId = id;
    res.setHeader(HEADER_NAME, id);
    next();
  }
}
