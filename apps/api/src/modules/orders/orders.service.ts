import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    let discountAmount = new Decimal(0);
    let couponId: string | null = null;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: { code: dto.couponCode.toUpperCase(), expiryDate: { gte: new Date() } },
      });
      if (coupon && (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit)) {
        couponId = coupon.id;
        const subtotal = cart.items.reduce(
          (sum, i) => sum.add(new Decimal(i.variant.price).mul(i.quantity)),
          new Decimal(0),
        );
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = subtotal.mul(coupon.discountValue).div(100);
        } else {
          discountAmount = new Decimal(coupon.discountValue);
        }
      }
    }

    let subtotal = new Decimal(0);
    const orderItems: { variantId: string; quantity: number; price: Decimal }[] = [];
    for (const item of cart.items) {
      const price = new Decimal(item.variant.price);
      const lineTotal = price.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);
      if (item.variant.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${item.variant.sku}`);
      orderItems.push({ variantId: item.variantId, quantity: item.quantity, price });
    }

    const shipping = new Decimal(0);
    const tax = new Decimal(0);
    const total = subtotal.sub(discountAmount).add(shipping).add(tax);

    const order = await this.prisma.$transaction(async (tx) => {
      const orderNumber = this.generateOrderNumber();
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber,
          status: OrderStatus.PENDING,
          subtotal,
          tax,
          shipping,
          discount: discountAmount,
          total,
          shippingAddressId: dto.shippingAddressId ?? null,
          billingAddressId: dto.billingAddressId ?? null,
          items: {
            create: orderItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity, price: i.price })),
          },
        },
        include: { items: { include: { variant: true } } },
      });
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: OrderStatus.PENDING },
      });
      if (couponId) {
        await tx.orderCoupon.create({ data: { orderId: order.id, couponId } });
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });

    const result = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { variant: { include: { product: { select: { name: true, slug: true } } } } } } },
    });
    return result;
  }

  async listMyOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: { take: 3 } },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getOrderDetails(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        payments: true,
        shipments: true,
        statusHistory: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    return order;
  }

  async cancelOrder(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    if (order.status !== OrderStatus.PENDING) throw new BadRequestException('Only pending orders can be cancelled');
    await this.prisma.$transaction([
      this.prisma.orderStatusHistory.create({
        data: { orderId: id, status: OrderStatus.CANCELLED },
      }),
      this.prisma.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      }),
    ]);
    return this.getOrderDetails(id, userId);
  }
}
