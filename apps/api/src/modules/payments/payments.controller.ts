import { Controller, Post, Body, Param, Req, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/authorization.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent (Stripe)' })
  async createPaymentIntent(
    @CurrentUser('userId') userId: string,
    @Body('orderId') orderId: string,
  ) {
    return this.paymentsService.createPaymentIntent(orderId, userId);
  }

  @Post('confirm-payment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment' })
  async confirmPayment(
    @CurrentUser('userId') userId: string,
    @Body('orderId') orderId: string,
    @Body('paymentId') paymentId: string,
  ) {
    return this.paymentsService.confirmPayment(orderId, paymentId, userId);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook (no auth)' })
  async webhookHandler(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'] as string ?? '';
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    return this.paymentsService.webhookHandler(rawBody, signature);
  }
}
