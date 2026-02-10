import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { QueryProductDto } from './dtos/query-product.dto';
import { slugify, isCuid } from '../../shared/utils/string.utils';
import { CONSTANTS } from '../../common/constants';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const page = query.page ?? 1;
    const limit = Math.min(
      query.limit ?? CONSTANTS.DEFAULT_PAGE_SIZE,
      CONSTANTS.MAX_PAGE_SIZE,
    );
    const { category, search, sort, isActive } = query;
    const skip = (page - 1) * limit;

    const where: {
      isActive?: boolean;
      categoryId?: string;
      category?: { slug: string };
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; description?: { contains: string; mode: 'insensitive' }; brand?: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (isActive !== undefined) where.isActive = isActive;
    if (category) {
      const isCuid = category.length === 25 && category.startsWith('c');
      if (isCuid) where.categoryId = category;
      else where.category = { slug: category };
    }
    if (search?.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
      ];
    }

    const orderBy: { createdAt?: 'desc'; name?: 'asc' } =
      sort === 'newest'
        ? { createdAt: 'desc' }
        : sort === 'name'
          ? { name: 'asc' }
          : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { orderBy: { price: 'asc' }, take: 1 },
          images: { orderBy: { order: 'asc' }, take: 3 },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total,
      },
    };
  }

  async findOne(id: string) {
    if (!isCuid(id)) throw new NotFoundException('Product not found');
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { order: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findFeatured(limit = 12) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: Math.min(limit, 24),
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        images: { orderBy: { order: 'asc' }, take: 3 },
      },
    });
    return { data: products };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { order: 'asc' } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug ?? slugify(dto.name);
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Product with slug "${slug}" already exists`);

    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        categoryId: dto.categoryId,
        brand: dto.brand ?? null,
        isActive: dto.isActive ?? true,
        variants: {
          create: dto.variants.map((v) => ({
            sku: v.sku,
            price: new Decimal(v.price),
            comparePrice: v.comparePrice != null ? new Decimal(v.comparePrice) : null,
            stock: v.stock ?? 0,
            attributes: v.attributes ?? undefined,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    if (!isCuid(id)) throw new NotFoundException('Product not found');
    await this.findOne(id);
    if (dto.slug) {
      const existing = await this.prisma.product.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (existing) throw new ConflictException(`Slug "${dto.slug}" already in use`);
    }
    if (dto.categoryId) {
      const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!cat) throw new NotFoundException('Category not found');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        categoryId: dto.categoryId,
        brand: dto.brand,
        isActive: dto.isActive,
      },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    });
    return product;
  }

  async remove(id: string) {
    if (!isCuid(id)) throw new NotFoundException('Product not found');
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted' };
  }
}
