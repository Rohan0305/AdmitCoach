import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { CREDIT_PACKAGES } from '@/lib/stripe';
import { verifyFirebaseToken } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    const user = await verifyFirebaseToken(token); // Verify Firebase token
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    console.log('User authenticated for checkout:', user.uid);

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const { packageId, userId, userEmail } = await req.json();

    // Verify the userId in the request matches the authenticated user
    if (userId !== user.uid) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Validate inputs
    if (!packageId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate packageId
    const validPackages = ['credits_5', 'credits_10', 'credits_20'];
    if (!validPackages.includes(packageId)) {
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      );
    }

    // Find the selected package
    const selectedPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    console.log('Creating Stripe checkout session for package:', selectedPackage);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPackage.name,
              description: selectedPackage.description,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/dashboard?success=true&credits=${selectedPackage.credits}`,
      cancel_url: `${req.nextUrl.origin}/dashboard?canceled=true`,
      metadata: {
        userId,
        credits: selectedPackage.credits.toString(),
        packageId,
      },
      customer_email: userEmail,
    });

    console.log('Stripe checkout session created:', { sessionId: session.id, status: session.status });
    
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 