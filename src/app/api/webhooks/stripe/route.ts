import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(req: NextRequest) {
  console.log('Webhook received:', req.url);
  
  // Debug Firebase configuration
  console.log('Firebase environment check:', {
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID
  });
  
  if (!stripe) {
    console.error('Stripe is not configured in webhook');
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
  
  console.log('Webhook body length:', body.length);
  console.log('Webhook signature present:', !!signature);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    console.log('Webhook event verified:', event.type);
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
      console.log('Processing checkout.session.completed event');
      const session = event.data.object;
      
      console.log('Session ID:', session.id);
      console.log('Session metadata:', session.metadata);
      console.log('Session object keys:', Object.keys(session));
      
      // Check if this session was already processed by looking for existing credit purchase record
      if (session.metadata?.userId && session.metadata?.credits) {
        try {
          const db = getFirestore();
          const userRef = db.collection('users').doc(session.metadata.userId);
          
          // Check if this session was already processed
          const userDoc = await userRef.get();
          const lastPurchase = userDoc.data()?.lastCreditPurchase;
          const sessionCreated = new Date(session.created * 1000); // Convert Stripe timestamp
          
          console.log('Session created time:', sessionCreated);
          console.log('Last credit purchase time:', lastPurchase);
          
          // If the session was created before the last purchase, skip it
          if (lastPurchase && new Date(lastPurchase) > sessionCreated) {
            console.log('Session already processed, skipping credit addition');
            break;
          }
          
          console.log(`Adding ${session.metadata.credits} credits to user ${session.metadata.userId}`);
          
          console.log('Updating Firestore document:', userRef.path);
          console.log('Firebase Admin app config:', {
            projectId: getApps()[0].options.projectId
          });
          
          await userRef.update({
            credits: userDoc.data()?.credits + parseInt(session.metadata.credits),
            lastCreditPurchase: new Date().toISOString(),
            lastStripeSessionId: session.id, // Track which session was processed
          });
          
          console.log(`Successfully added ${session.metadata.credits} credits to user ${session.metadata.userId}`);
        } catch (error) {
          console.error('Error updating user credits:', error);
          console.error('Error details:', error instanceof Error ? error.message : String(error));
          
          // Try to get more details about the error
          if (error instanceof Error && 'code' in error) {
            console.error('Firebase error code:', (error as any).code);
            console.error('Firebase error details:', (error as any).customData);
          }
        }
      } else {
        console.error('Missing metadata for credit addition:', {
          hasUserId: !!session.metadata?.userId,
          hasCredits: !!session.metadata?.credits,
          metadata: session.metadata
        });
      }
      break;
      
    case 'charge.updated':
      console.log('Received charge.updated event - this is not the event we need for credits');
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 