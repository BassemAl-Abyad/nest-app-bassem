import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey);
  }

  async createCheckoutSession(params: {
    amount: number;
    currency?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    customerEmail?: string;
    couponId?: string;
  }) {
    const {
      amount,
      currency = 'usd',
      successUrl,
      cancelUrl,
      metadata = {},
      customerEmail,
      couponId,
    } = params;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Order Payment',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      customer_email: customerEmail,
      discounts: couponId ? [{ coupon: couponId }] : undefined,
    });

    return session;
  }

  async createCoupon(params: {
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    currency?: string;
    duration: 'once' | 'repeating' | 'forever';
    durationInMonths?: number;
    maxRedemptions?: number;
    redeemBy?: Date;
    metadata?: Record<string, string>;
  }) {
    const {
      discountType,
      discountValue,
      currency = 'usd',
      duration,
      durationInMonths,
      maxRedemptions,
      redeemBy,
      metadata = {},
    } = params;

    const couponParams: Stripe.CouponCreateParams = {
      currency,
      duration,
      metadata,
    };

    if (discountType === 'percentage') {
      couponParams.percent_off = discountValue;
    } else {
      couponParams.amount_off = Math.round(discountValue * 100);
    }

    if (duration === 'repeating' && durationInMonths) {
      couponParams.duration_in_months = durationInMonths;
    }

    if (maxRedemptions) {
      couponParams.max_redemptions = maxRedemptions;
    }

    if (redeemBy) {
      couponParams.redeem_by = Math.floor(redeemBy.getTime() / 1000);
    }

    const coupon = await this.stripe.coupons.create(couponParams);

    return coupon;
  }

  async retrieveCoupon(couponId: string) {
    return this.stripe.coupons.retrieve(couponId);
  }

  async deleteCoupon(couponId: string) {
    return this.stripe.coupons.del(couponId);
  }

  async listCoupons(params?: {
    limit?: number;
    startingAfter?: string;
  }) {
    return this.stripe.coupons.list(params);
  }

  async createCouponFromInternalCoupon(params: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    endDate: Date;
    maxRedemptions?: number;
    currency?: string;
  }) {
    const {
      discountType,
      discountValue,
      endDate,
      maxRedemptions,
      currency = 'usd',
    } = params;

    const couponParams: Stripe.CouponCreateParams = {
      currency,
      duration: 'once',
      redeem_by: Math.floor(endDate.getTime() / 1000),
    };

    if (discountType === 'percentage') {
      couponParams.percent_off = discountValue;
    } else {
      couponParams.amount_off = Math.round(discountValue * 100);
    }

    if (maxRedemptions) {
      couponParams.max_redemptions = maxRedemptions;
    }

    const coupon = await this.stripe.coupons.create(couponParams);

    return coupon;
  }

  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    customerId?: string;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
    description?: string;
    automaticPaymentMethods?: {
      enabled: boolean;
      allowRedirects?: 'never' | 'always' | 'if_required';
    };
  }) {
    const {
      amount,
      currency = 'usd',
      customerId,
      paymentMethodId,
      metadata = {},
      description,
      automaticPaymentMethods = { enabled: true },
    } = params;

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: automaticPaymentMethods,
    };

    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    if (paymentMethodId) {
      paymentIntentParams.payment_method = paymentMethodId;
    }

    if (description) {
      paymentIntentParams.description = description;
    }

    const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

    return paymentIntent;
  }

  async confirmPaymentIntent(paymentIntentId: string, params?: {
    paymentMethodId?: string;
    return_url?: string;
  }) {
    const confirmParams: Stripe.PaymentIntentConfirmParams = {};

    if (params?.paymentMethodId) {
      confirmParams.payment_method = params.paymentMethodId;
    }

    if (params?.return_url) {
      confirmParams.return_url = params.return_url;
    }

    const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, confirmParams);

    return paymentIntent;
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async cancelPaymentIntent(paymentIntentId: string, params?: {
    cancellationReason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned';
  }) {
    const cancelParams: Stripe.PaymentIntentCancelParams = {};

    if (params?.cancellationReason) {
      cancelParams.cancellation_reason = params.cancellationReason;
    }

    return this.stripe.paymentIntents.cancel(paymentIntentId, cancelParams);
  }
}
