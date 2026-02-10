import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

export const PRISMA_HEALTH_KEY = 'database';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(PRISMA_HEALTH_KEY, true, { ping: 'ok' });
    } catch (err) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(PRISMA_HEALTH_KEY, false, { error: (err as Error).message }),
      );
    }
  }
}
