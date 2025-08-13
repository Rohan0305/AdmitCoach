import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe is not configured',
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      }, { status: 500 });
    }

    // Test Stripe connection
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({ 
      success: true,
      stripeConfigured: true,
      accountId: account.id,
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json({ 
      error: 'Stripe test failed',
      details: error instanceof Error ? error.message : String(error),
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }, { status: 500 });
  }
} 