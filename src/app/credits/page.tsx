'use client';

import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase';
import { CREDIT_PACKAGES } from '@/lib/stripe';
import { getStripe } from '@/lib/stripe';
import Link from 'next/link';

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    
    if (!currentUser) return;
    
    setLoading(packageId);
    
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          userId: currentUser.uid,
          userEmail: currentUser.email,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      const stripe = await getStripe();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe error:', error);
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-gradient)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
        }}>
          <h1 style={{
            color: 'var(--color-text)',
            fontSize: 36,
            fontWeight: 700,
            margin: '0 0 1rem 0',
          }}>
            Purchase Interview Credits
          </h1>
          <p style={{
            color: 'var(--color-label)',
            fontSize: 18,
            margin: 0,
            lineHeight: 1.6,
          }}>
            Choose a credit package to start practicing mock interviews. Each interview session costs 1 credit.
          </p>
        </div>

        {/* Credit Packages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              style={{
                background: 'var(--color-card-bg)',
                borderRadius: 16,
                padding: '2rem',
                boxShadow: 'var(--color-card-shadow)',
                border: pkg.popular ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--color-card-shadow)';
              }}
            >
              {pkg.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  padding: '0.5rem 1.5rem',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                }}>
                  Most Popular
                </div>
              )}
              
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  color: 'var(--color-text)',
                  fontSize: 24,
                  fontWeight: 600,
                  margin: '0 0 1rem 0',
                }}>
                  {pkg.name}
                </h3>
                
                <div style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  margin: '1rem 0',
                }}>
                  {pkg.priceDisplay}
                </div>
                
                <p style={{
                  color: 'var(--color-label)',
                  fontSize: 16,
                  margin: '0 0 2rem 0',
                  lineHeight: 1.5,
                }}>
                  {pkg.description}
                </p>
                
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: 12,
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: loading === pkg.id ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    background: pkg.popular 
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                      : 'var(--color-primary)',
                    color: '#fff',
                    opacity: loading === pkg.id ? 0.6 : 1,
                  }}
                >
                  {loading === pkg.id ? 'Processing...' : 'Purchase Credits'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div style={{
          background: 'var(--color-card-bg)',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: 'var(--color-card-shadow)',
          border: '1px solid var(--color-border)',
          textAlign: 'center',
        }}>
          <h3 style={{
            color: 'var(--color-text)',
            fontSize: 20,
            fontWeight: 600,
            margin: '0 0 1rem 0',
          }}>
            How It Works
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginTop: '1.5rem',
          }}>
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 600,
                margin: '0 auto 1rem auto',
              }}>
                1
              </div>
              <h4 style={{
                color: 'var(--color-text)',
                fontSize: 16,
                fontWeight: 600,
                margin: '0 0 0.5rem 0',
              }}>
                Choose Package
              </h4>
              <p style={{
                color: 'var(--color-label)',
                fontSize: 14,
                margin: 0,
              }}>
                Select the credit package that fits your needs
              </p>
            </div>
            
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 600,
                margin: '0 auto 1rem auto',
              }}>
                2
              </div>
              <h4 style={{
                color: 'var(--color-text)',
                fontSize: 16,
                fontWeight: 600,
                margin: '0 0 0.5rem 0',
              }}>
                Complete Payment
              </h4>
              <p style={{
                color: 'var(--color-label)',
                fontSize: 14,
                margin: 0,
              }}>
                Secure payment through Stripe
              </p>
            </div>
            
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 600,
                margin: '0 auto 1rem auto',
              }}>
                3
              </div>
              <h4 style={{
                color: 'var(--color-text)',
                fontSize: 16,
                fontWeight: 600,
                margin: '0 0 0.5rem 0',
              }}>
                Start Practicing
              </h4>
              <p style={{
                color: 'var(--color-label)',
                fontSize: 14,
                margin: 0,
              }}>
                Credits added instantly, start interviewing
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div style={{
          textAlign: 'center',
          marginTop: '3rem',
        }}>
          <Link href="/dashboard" style={{
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontSize: 16,
            fontWeight: 500,
          }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 