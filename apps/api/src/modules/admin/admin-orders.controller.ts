import { Controller, Get, Patch, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminOnly } from '../../common/decorators/authorization.decorator';
import { OrderStatus } from '@prisma/client';
import { PaymentStatus } from '@prisma/client';

@ApiTags('admin/orders')
@Controller('admin/orders')
@AdminOnly()
@ApiBearerAuth()
export class AdminOrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders (Admin)' })
  async listAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: OrderStatus,
  ) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true } },
          items: { take: 3 },
          shippingAddress: { select: { city: true, country: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (Admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    await this.prisma.orderStatusHistory.create({
      data: { orderId: id, status },
    });
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, statusHistory: true },
    });
    return { message: 'Order status updated', data: order };
  }

  @Patch(':id/process-refund')
  @ApiOperation({ summary: 'Process refund (Admin)' })
  async processRefund(@Param('id') id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId: id, status: PaymentStatus.COMPLETED },
    });
    if (!payment) return { message: 'No completed payment to refund' };
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED },
    });
    return { message: 'Refund processed', data: { paymentId: payment.id } };
  }
}
