import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, increment } from 'firebase/firestore';
import { app } from '@/firebase';

export async function POST(req: NextRequest) {
  try {
    const { userId, credits } = await req.json();
    
    if (!userId || !credits) {
      return NextResponse.json({ error: 'Missing userId or credits' }, { status: 400 });
    }
    
    console.log(`Testing credit addition: ${credits} credits for user ${userId}`);
    
    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      credits: increment(parseInt(credits)),
      lastCreditPurchase: new Date().toISOString(),
    });
    
    console.log(`Successfully added ${credits} credits to user ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Added ${credits} credits to user ${userId}` 
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({ 
      error: 'Failed to add credits',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 