"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is logged in, redirect to dashboard
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-gradient)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar with login button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '2rem 2.5rem 0 2.5rem' }}>
        <Link
          href="/login"
          style={{
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            color: '#fff',
            padding: '0.6rem 1.5rem',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.10)',
            transition: 'background 0.2s',
          }}
        >
          Log In
        </Link>
      </div>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 36, letterSpacing: 1 }}>AC</span>
        </div>
        <h1 style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: 40, margin: 0 }}>AdmitCoach</h1>
        <p style={{ color: 'var(--color-label)', fontSize: 20, margin: '18px 0 32px 0', maxWidth: 480 }}>
          Practice your medical or dental school interviews with realistic mock questions and get instant AI-powered feedback. Boost your confidence and ace your interview!
        </p>
        <Link
          href="/signup"
          style={{
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            color: '#fff',
            padding: '1rem 2.5rem',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 20,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.10)',
            transition: 'background 0.2s',
          }}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
