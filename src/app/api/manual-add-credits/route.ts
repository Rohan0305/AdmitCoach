import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { app } from '@/firebase';
import { verifyFirebaseToken } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    //verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyFirebaseToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { credits } = await req.json();
    
    if (!credits || isNaN(credits)) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 });
    }
    
    console.log(`Manually adding ${credits} credits to user ${user.uid}`);
    
    const db = getFirestore(app);
    const userRef = doc(db, 'users', user.uid);
    
    //get current credits first
    const userDoc = await getDoc(userRef);
    const currentCredits = userDoc.data()?.credits || 0;
    
    console.log(`Current credits: ${currentCredits}, adding: ${credits}`);
    
    await updateDoc(userRef, {
      credits: increment(parseInt(credits)),
      lastCreditPurchase: new Date().toISOString(),
    });
    
    //get updated credits
    const updatedUserDoc = await getDoc(userRef);
    const newCredits = updatedUserDoc.data()?.credits || 0;
    
    console.log(`Successfully updated credits from ${currentCredits} to ${newCredits}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Added ${credits} credits`,
      previousCredits: currentCredits,
      newCredits: newCredits
    });
  } catch (error) {
    console.error('Manual credit addition error:', error);
    return NextResponse.json({ 
      error: 'Failed to add credits',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 