import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/authorization.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'List reviews by product' })
  async listByProduct(
    @Param('productId') productId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.listByProduct(productId, page, limit);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create review' })
  async create(@CurrentUser('userId') userId: string, @Body() dto: CreateReviewDto) {
    const data = await this.reviewsService.create(userId, dto);
    return { message: 'Review created', data };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my review' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const data = await this.reviewsService.update(id, userId, dto);
    return { message: 'Review updated', data };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete my review' })
  async remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.reviewsService.remove(id, userId);
  }
}
