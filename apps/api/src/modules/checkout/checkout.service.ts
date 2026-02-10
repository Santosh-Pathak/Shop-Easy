import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCart(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { variant: { include: { product: true } } } } },
    });
    if (!cart || cart.items.length === 0) {
      return { valid: false, message: 'Cart is empty', data: null };
    }
    const errors: string[] = [];
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        errors.push(`Insufficient stock for ${item.variant.product.name} (${item.variant.sku}). Max: ${item.variant.stock}`);
      }
    }
    const valid = errors.length === 0;
    return {
      valid,
      message: valid ? 'Cart is valid' : errors.join('; '),
      data: valid ? cart : null,
    };
  }

  async applyCoupon(code: string, userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { variant: true } } },
    });
    if (!cart || cart.items.length === 0) {
      return { valid: false, message: 'Cart is empty', discount: 0 };
    }
    const coupon = await this.prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), expiryDate: { gte: new Date() } },
    });
    if (!coupon) return { valid: false, message: 'Invalid or expired coupon', discount: 0 };
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached', discount: 0 };
    }
    const subtotal = cart.items.reduce(
      (sum, i) => sum.add(new Decimal(i.variant.price).mul(i.quantity)),
      new Decimal(0),
    );
    let discount: Decimal;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = subtotal.mul(coupon.discountValue).div(100);
    } else {
      discount = new Decimal(coupon.discountValue);
    }
    return {
      valid: true,
      message: 'Coupon applied',
      discount: Number(discount),
      couponCode: coupon.code,
    };
  }

  async calculateTotals(userId: string, couponCode?: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { variant: true } } },
    });
    if (!cart || cart.items.length === 0) {
      return { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 };
    }
    let subtotal = new Decimal(0);
    for (const item of cart.items) {
      subtotal = subtotal.add(new Decimal(item.variant.price).mul(item.quantity));
    }
    let discount = new Decimal(0);
    if (couponCode) {
      const result = await this.applyCoupon(couponCode, userId);
      if (result.valid) discount = new Decimal(result.discount);
    }
    const shipping = new Decimal(0);
    const tax = new Decimal(0);
    const total = subtotal.sub(discount).add(shipping).add(tax);
    return {
      subtotal: Number(subtotal),
      tax: Number(tax),
      shipping: Number(shipping),
      discount: Number(discount),
      total: Number(total),
    };
  }
}
