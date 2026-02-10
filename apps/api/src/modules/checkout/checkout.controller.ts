import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('checkout')
@Controller('checkout')
@ApiBearerAuth()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('validate-cart')
  @ApiOperation({ summary: 'Validate cart' })
  async validateCart(@CurrentUser('userId') userId: string) {
    return this.checkoutService.validateCart(userId);
  }

  @Post('apply-coupon')
  @ApiOperation({ summary: 'Apply coupon and get discount' })
  async applyCoupon(@CurrentUser('userId') userId: string, @Body('code') code: string) {
    return this.checkoutService.applyCoupon(code, userId);
  }

  @Get('calculate-totals')
  @ApiOperation({ summary: 'Calculate cart totals (optional coupon)' })
  async calculateTotals(
    @CurrentUser('userId') userId: string,
    @Query('couponCode') couponCode?: string,
  ) {
    return this.checkoutService.calculateTotals(userId, couponCode);
  }
}
