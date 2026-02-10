import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            variants: { orderBy: { price: 'asc' }, take: 1 },
            images: { orderBy: { order: 'asc' }, take: 1 },
          },
        },
      },
    });
    return { data: items };
  }

  async add(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new ConflictException('Product already in wishlist');
    const item = await this.prisma.wishlist.create({
      data: { userId, productId },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });
    return { message: 'Added to wishlist', data: item };
  }

  async remove(userId: string, productId: string) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new NotFoundException('Wishlist item not found');
    await this.prisma.wishlist.delete({ where: { id: item.id } });
    return { message: 'Removed from wishlist' };
  }
}
