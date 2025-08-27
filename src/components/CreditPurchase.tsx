'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase';
import { CREDIT_PACKAGES } from '@/lib/stripe';
import { getStripe } from '@/lib/stripe';

export default function CreditPurchase() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    
    if (!currentUser) return;
    
    setLoading(packageId);
    
    try {
      //get current user's ID token
      const idToken = await currentUser.getIdToken();
      
      //create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          packageId,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout session creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      console.log('Checkout session created successfully:', { sessionId });
      
      if (!sessionId) {
        throw new Error('No session ID received from server');
      }
      
      // Redirect to Stripe checkout
      const stripe = await getStripe();
      if (stripe) {
        console.log('Stripe instance loaded, redirecting to checkout with sessionId:', sessionId);
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe error:', error);
        }
      } else {
        console.error('Failed to load Stripe instance');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Purchase Interview Credits
      </h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative border-2 rounded-lg p-6 transition-all hover:shadow-lg ${
              pkg.popular
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {pkg.name}
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {pkg.priceDisplay}
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                {pkg.description}
              </p>
              
              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  pkg.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === pkg.id ? 'Processing...' : 'Purchase Credits'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Credits are added to your account immediately after payment.</p>
        <p>Each mock interview session costs 1 credit.</p>
      </div>
    </div>
  );
} 