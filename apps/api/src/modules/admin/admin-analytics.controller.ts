import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminOnly } from '../../common/decorators/authorization.decorator';

@ApiTags('admin/analytics')
@Controller('admin/analytics')
@AdminOnly()
@ApiBearerAuth()
export class AdminAnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('sales-reports')
  @ApiOperation({ summary: 'Sales reports (Admin)' })
  async salesReports(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        status: { not: 'CANCELLED' },
      },
      select: { total: true, createdAt: true, status: true },
    });
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const count = orders.length;
    return {
      data: {
        totalRevenue,
        orderCount: count,
        period: { from: fromDate.toISOString(), to: toDate.toISOString() },
      },
    };
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Top products by quantity sold (Admin)' })
  async topProducts(@Query('limit') limit = '10') {
    const n = Math.min(parseInt(limit, 10) || 10, 50);
    const items = await this.prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      _count: true,
    });
    const variantIds = items
      .sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0))
      .slice(0, n)
      .map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
    const byId = Object.fromEntries(variants.map((v) => [v.id, v]));
    const data = variantIds.map((id) => {
      const item = items.find((i) => i.variantId === id);
      return {
        variant: byId[id],
        quantitySold: item?._sum.quantity ?? 0,
        orderCount: item?._count ?? 0,
      };
    });
    return { data };
  }

  @Get('user-metrics')
  @ApiOperation({ summary: 'User metrics (Admin)' })
  async userMetrics() {
    const [totalUsers, totalOrders, newUsersLast30] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);
    return {
      data: {
        totalUsers,
        totalOrders,
        newUsersLast30Days: newUsersLast30,
      },
    };
  }
}
