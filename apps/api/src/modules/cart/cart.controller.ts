import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dtos/add-cart-item.dto';
import { UpdateCartItemDto } from './dtos/update-cart-item.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('cart')
@Controller('cart')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get my cart' })
  async getCart(@CurrentUser('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(@CurrentUser('userId') userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:variantId')
  @ApiOperation({ summary: 'Update item quantity' })
  async updateQuantity(
    @CurrentUser('userId') userId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateQuantity(userId, variantId, dto.quantity);
  }

  @Delete('items/:variantId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser('userId') userId: string, @Param('variantId') variantId: string) {
    return this.cartService.removeItem(userId, variantId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
