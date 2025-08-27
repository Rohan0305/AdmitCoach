"use client";

import React, { useEffect, useState } from "react";
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { app } from "@/firebase";
import Link from 'next/link';
import useAuthUser from '../zustand/useAuthUser';

export default function DashboardPage() {
  const { user, setUser } = useAuthUser();
  const [loading, setLoading] = useState(true);

  //refresh user data when dashboard loads to ensure credit count is up-to-date
  useEffect(() => {
    const refreshUserData = async () => {
      if (user) {
        try {
          const auth = getAuth(app);
          const currentUser = auth.currentUser;
          if (currentUser) {
            const db = getFirestore(app);
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const freshUserData = userDoc.data() as User;
              setUser(freshUserData);
            }
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
      setLoading(false);
    };

    refreshUserData();
  }, [user, setUser]);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 800, margin: "40px auto", padding: 24, background: "var(--color-card-bg)", borderRadius: 12, boxShadow: "var(--color-card-shadow)", border: "1px solid var(--color-border)" }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ 
              color: 'var(--color-text)', 
              fontSize: 18, 
              marginBottom: 16 
            }}>
              {loading ? 'Loading your dashboard...' : 'Please log in to access your dashboard.'}
            </div>
            {!loading && (
              <Link href="/login" style={{
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '0.7rem 1.5rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 16,
                display: 'inline-block'
              }}>
                Go to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-gradient)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{ color: 'var(--color-text)', fontSize: 32, fontWeight: 700, margin: 0 }}>
            Welcome back, {user?.firstName}!
          </h1>
          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 12,
            }}
          >
            Log Out
          </button>
        </div>



        {(user?.programType || user?.undergraduateSchool) && (
          <div style={{
            background: 'var(--color-card-bg)',
            borderRadius: 12,
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--color-card-shadow)',
            border: '1px solid var(--color-border)',
          }}>
            <h2 style={{ color: 'var(--color-text)', fontSize: 24, fontWeight: 600, margin: '0 0 1.5rem 0' }}>
              Your Profile
            </h2>
            <Link href="/edit-profile" style={{
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: '1.5rem',
              display: 'inline-block',
            }}>
              Edit Profile
            </Link>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: 'var(--color-label)', fontSize: 14, fontWeight: 500 }}>Program Type</label>
                <div style={{ color: 'var(--color-text)', fontSize: 16, marginTop: 4 }}>
                  {user.programType || 'Not specified'}
                </div>
              </div>
              
              <div>
                <label style={{ color: 'var(--color-label)', fontSize: 14, fontWeight: 500 }}>Undergraduate School</label>
                <div style={{ color: 'var(--color-text)', fontSize: 16, marginTop: 4 }}>
                  {user.undergraduateSchool || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Credits Display */}
        <div style={{
          background: 'var(--color-card-bg)',
          borderRadius: 12,
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--color-card-shadow)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <h2 style={{ color: 'var(--color-text)', fontSize: 24, fontWeight: 600, margin: 0 }}>
              Interview Credits
            </h2>
            <Link href="/credits" style={{
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
            }}>
              Buy More Credits
            </Link>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
          }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-primary)' }}>
              {user.credits || 0}
            </div>
            <div style={{ color: 'var(--color-label)', fontSize: 16 }}>
              credits remaining
            </div>
          </div>
          
          {user.credits === 0 && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: 8,
              padding: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#92400e', fontSize: 16 }}>⚠️</span>
                <span style={{ color: '#92400e', fontSize: 14 }}>
                  No credits available. Purchase credits to start mock interviews.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'var(--color-card-bg)',
          borderRadius: 12,
          padding: '2rem',
          boxShadow: 'var(--color-card-shadow)',
          border: '1px solid var(--color-border)',
        }}>
          <h2 style={{ color: 'var(--color-text)', fontSize: 24, fontWeight: 600, margin: '0 0 1.5rem 0' }}>
            Quick Actions
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {user.credits && user.credits > 0 ? (
              <Link href="/interview" style={{
                display: 'block',
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                color: '#fff',
                padding: '1rem',
                borderRadius: 8,
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 16,
              }}>
                Start Mock Interview ({user.credits} credits available)
              </Link>
            ) : (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: 8,
                padding: '1rem',
                textAlign: 'center',
              }}>
                <p style={{ color: '#92400e', margin: '0 0 0.5rem 0', fontSize: 14 }}>
                  No credits available
                </p>
                <p style={{ color: '#92400e', margin: 0, fontSize: 12 }}>
                  Purchase credits above to start a mock interview
                </p>
              </div>
            )}
            
            <Link href="/previous-interviews" style={{
              display: 'block',
              background: '#f1f5f9',
              color: 'var(--color-text)',
              padding: '1rem',
              borderRadius: 8,
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 16,
              border: '1px solid var(--color-border)',
            }}>
              View Interview History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 