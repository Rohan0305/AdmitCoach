import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/firebase';

export async function POST(req: NextRequest) {
  try {
    const { userId, newCredits } = await req.json();
    
    if (!userId || newCredits === undefined) {
      return NextResponse.json(
        { error: 'userId and newCredits are required' },
        { status: 400 }
      );
    }

    const db = getFirestore(app);
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      credits: newCredits,
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Credits reset to ${newCredits}` 
    });
  } catch (error) {
    console.error('Error resetting credits:', error);
    return NextResponse.json(
      { error: 'Failed to reset credits' },
      { status: 500 }
    );
  }
} 