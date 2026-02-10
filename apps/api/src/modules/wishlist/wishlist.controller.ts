import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('wishlist')
@Controller('wishlist')
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'List my wishlist' })
  async list(@CurrentUser('userId') userId: string) {
    return this.wishlistService.list(userId);
  }

  @Post('products/:productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  async add(@CurrentUser('userId') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.add(userId, productId);
  }

  @Delete('products/:productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async remove(@CurrentUser('userId') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.remove(userId, productId);
  }
}
