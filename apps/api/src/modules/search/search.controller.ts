import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/authorization.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Global search (products, categories)' })
  async globalSearch(@Query('q') q: string, @Query('limit') limit = '20') {
    const term = (q ?? '').trim();
    const n = Math.min(parseInt(limit, 10) || 20, 50);
    if (!term) return { data: { products: [], categories: [] } };
    const [products, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { brand: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: n,
        select: { id: true, name: true, slug: true, brand: true, category: { select: { name: true, slug: true } } },
      }),
      this.prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { slug: { contains: term, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, name: true, slug: true },
      }),
    ]);
    return { data: { products, categories } };
  }

  @Public()
  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete (product names)' })
  async autocomplete(@Query('q') q: string, @Query('limit') limit = '8') {
    const term = (q ?? '').trim();
    const n = Math.min(parseInt(limit, 10) || 8, 20);
    if (!term) return { data: [] };
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: term, mode: 'insensitive' },
      },
      take: n,
      select: { id: true, name: true, slug: true },
    });
    return { data: products };
  }
}
