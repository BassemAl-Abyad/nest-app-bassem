import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum StripeRefundReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
}

export class RefundDto {
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsEnum(StripeRefundReason)
  @IsOptional()
  reason?: StripeRefundReason;

  @IsString()
  @IsOptional()
  metadata?: Record<string, string>;
}
