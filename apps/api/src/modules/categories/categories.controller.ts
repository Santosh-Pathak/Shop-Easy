import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/authorization.decorator';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all categories (flat)' })
  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true, slug: true } },
      },
    });
    return { data: categories };
  }

  @Public()
  @Get('tree')
  @ApiOperation({ summary: 'Get category tree (nested)' })
  async getTree() {
    const roots = await this.prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
        children: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { products: true } },
            children: { orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } },
          },
        },
      },
    });
    return { data: roots };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
        parent: true,
        children: true,
      },
    });
    if (!category) return { data: null };
    return { data: category };
  }
}
