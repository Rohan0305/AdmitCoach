import { NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '@/firebase';

export async function GET() {
  try {
    console.log('Testing Firebase permissions...');
    console.log('Environment check:', {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.substring(0, 30) + '...'
    });
    
    // Test basic Firestore access using the same instance as the webhook
    const db = getFirestore(app);
    console.log('Firestore instance created successfully');
    console.log('Firestore app config:', {
      projectId: app.options.projectId,
      appId: app.options.appId
    });
    
    // Test writing to a test document
    const testRef = doc(db, 'test', 'webhook-test');
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Testing webhook permissions',
      test: true
    };
    
    console.log('Attempting to write test document to:', testRef.path);
    await setDoc(testRef, testData);
    console.log('Test document written successfully');
    
    // Test reading the document back
    const testDoc = await getDoc(testRef);
    if (testDoc.exists()) {
      console.log('Test document read successfully:', testDoc.data());
    }
    
    // Clean up - delete the test document
    await setDoc(testRef, { deleted: true });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase has proper permissions',
      testData: testData
    });
  } catch (error) {
    console.error('Firebase test failed:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as Error & { code: string; customData?: unknown };
      console.error('Firebase error code:', firebaseError.code);
      console.error('Firebase error details:', firebaseError.customData);
    }
    
    return NextResponse.json({ 
      error: 'Firebase test failed',
      details: error instanceof Error ? error.message : String(error),
      code: error instanceof Error && 'code' in error ? (error as { code: string }).code : 'unknown',
      errorType: error?.constructor?.name
    }, { status: 500 });
  }
} 