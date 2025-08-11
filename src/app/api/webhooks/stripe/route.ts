import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getFirestore, doc, updateDoc, increment } from 'firebase/firestore';
import { app } from '@/firebase';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Add credits to user account
      if (session.metadata?.userId && session.metadata?.credits) {
        try {
          const db = getFirestore(app);
          const userRef = doc(db, 'users', session.metadata.userId);
          
          await updateDoc(userRef, {
            credits: increment(parseInt(session.metadata.credits)),
            lastCreditPurchase: new Date().toISOString(),
          });
          
          console.log(`Added ${session.metadata.credits} credits to user ${session.metadata.userId}`);
        } catch (error) {
          console.error('Error updating user credits:', error);
        }
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 