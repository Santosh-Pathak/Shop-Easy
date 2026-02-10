import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminAnalyticsController } from './admin-analytics.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AdminOrdersController, AdminAnalyticsController],
})
export class AdminModule {}
