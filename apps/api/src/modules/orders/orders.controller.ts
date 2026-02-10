import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  async create(@CurrentUser('userId') userId: string, @Body() dto: CreateOrderDto) {
    const data = await this.ordersService.create(userId, dto);
    return { message: 'Order created', data };
  }

  @Get()
  @ApiOperation({ summary: 'List my orders' })
  async listMyOrders(
    @CurrentUser('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ordersService.listMyOrders(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrderDetails(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    const data = await this.ordersService.getOrderDetails(id, userId);
    return { data };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    const data = await this.ordersService.cancelOrder(id, userId);
    return { message: 'Order cancelled', data };
  }
}
