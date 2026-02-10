import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckService } from '@nestjs/terminus';
import { Response } from 'express';
import { PrismaHealthIndicator, PRISMA_HEALTH_KEY } from './prisma.health';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness and readiness (DB check)' })
  @ApiResponse({ status: 200, description: 'Service and database are healthy' })
  @ApiResponse({ status: 503, description: 'Service unhealthy (e.g. DB down)' })
  async check(@Res({ passthrough: true }) res: Response) {
    const result = await this.health.check([
      () => this.prismaHealth.isHealthy(),
    ]);
    const dbOk = result.status === 'ok' && result.info?.[PRISMA_HEALTH_KEY]?.status === 'up';
    if (result.status !== 'ok') res.status(503);
    return {
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: { database: dbOk ? 'ok' : 'error' },
      details: result.details,
    };
  }
}
