import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPaymentIntent(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Order is not pending payment');
    const existing = await this.prisma.payment.findFirst({
      where: { orderId, status: PaymentStatus.COMPLETED },
    });
    if (existing) throw new BadRequestException('Order already paid');

    const payment = await this.prisma.payment.create({
      data: {
        orderId,
        method: 'stripe',
        amount: order.total,
        status: PaymentStatus.PENDING,
        transactionId: `pi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      },
    });
    return {
      clientSecret: `pi_${payment.id}_secret_placeholder`,
      paymentId: payment.id,
      amount: Number(payment.amount),
    };
  }

  async confirmPayment(orderId: string, paymentId: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, orderId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.COMPLETED },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CONFIRMED },
      }),
      this.prisma.orderStatusHistory.create({
        data: { orderId, status: OrderStatus.CONFIRMED },
      }),
    ]);
    return { message: 'Payment confirmed', data: { orderId, paymentId } };
  }

  async webhookHandler(rawBody: Buffer, signature: string) {
    return { received: true, message: 'Webhook placeholder - integrate Stripe webhook signature verification' };
  }
}
