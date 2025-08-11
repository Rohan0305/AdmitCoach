# Stripe Integration Setup

This document explains how to set up Stripe for the AdmitCoach interview credit system.

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

## Stripe Dashboard Setup

1. **Create a Stripe Account**: Sign up at [stripe.com](https://stripe.com)

2. **Get API Keys**: 
   - Go to Developers → API Keys in your Stripe dashboard
   - Copy your publishable key and secret key
   - Use test keys for development

3. **Set Up Webhooks**:
   - Go to Developers → Webhooks in your Stripe dashboard
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
   - Select the `checkout.session.completed` event
   - Copy the webhook signing secret

## Credit Packages

The system includes three credit packages:
- **5 Credits**: $19.99
- **10 Credits**: $34.99 (Most Popular)
- **20 Credits**: $59.99

## How It Works

1. **Credit Purchase**: Users select a credit package and are redirected to Stripe Checkout
2. **Payment Processing**: Stripe handles the payment securely
3. **Credit Addition**: Upon successful payment, credits are automatically added to the user's account via webhook
4. **Credit Usage**: Each mock interview session costs 1 credit
5. **Credit Deduction**: Credits are deducted when the interview is completed

## Security Features

- Webhook signature verification prevents unauthorized requests
- Credits are only added after confirmed payment
- Server-side credit validation prevents interview access without credits
- Automatic credit deduction after interview completion

## Testing

Use Stripe's test card numbers for testing:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Production Considerations

- Switch to live API keys for production
- Set up proper webhook endpoints for your production domain
- Monitor webhook delivery and retry failed webhooks
- Consider implementing webhook retry logic
- Set up proper error monitoring and alerting 