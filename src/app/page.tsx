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
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(14, 165, 233, 0.1)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'rgba(14, 165, 233, 0.08)',
        zIndex: 1,
      }} />
      
      {/* Top bar with login button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        padding: '2rem 3rem 0 3rem',
        position: 'relative',
        zIndex: 10,
      }}>
        <Link
          href="/login"
          style={{
            background: 'rgba(14, 165, 233, 0.15)',
            backdropFilter: 'blur(10px)',
            color: 'var(--color-primary)',
            padding: '0.8rem 2rem',
            borderRadius: 25,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(14, 165, 233, 0.25)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(14, 165, 233, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Log In
        </Link>
      </div>
      
      {/* Main content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '0 2rem',
      }}>
        {/* Logo */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2,
            boxShadow: '0 20px 40px rgba(14, 165, 233, 0.2)',
            border: '4px solid rgba(14, 165, 233, 0.2)',
          }}
        >
          <span style={{ 
            color: '#fff', 
            fontWeight: 800, 
            fontSize: 42, 
            letterSpacing: 2,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}>
            AC
          </span>
        </div>
        
        {/* Main heading */}
        <h1 style={{ 
          color: 'var(--color-text)', 
          fontWeight: 900, 
          fontSize: 'clamp(3rem, 8vw, 5rem)', 
          margin: '0 0 1rem 0',
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          letterSpacing: '-0.02em',
        }}>
          AdmitCoach
        </h1>
        
        {/* Subtitle */}
        <p style={{ 
          color: 'var(--color-label)', 
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
          margin: '0 0 3rem 0', 
          maxWidth: 700,
          lineHeight: 1.6,
          fontWeight: 400,
        }}>
          Master your professional school interviews with AI-powered mock interviews. Practice for Medical, Dental, Veterinary, Pharmacy, Nursing, PA, PT, OT, Law, Business, and Graduate school admissions.
        </p>
        
        {/* Program types highlight */}
        <div style={{
          background: 'rgba(14, 165, 233, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: '1.5rem 2rem',
          marginBottom: 3,
          border: '1px solid rgba(14, 165, 233, 0.2)',
          maxWidth: 800,
        }}>
          <p style={{
            color: 'var(--color-text)',
            fontSize: '1.1rem',
            margin: 0,
            fontWeight: 500,
          }}>
            <strong>Get instant feedback</strong> and boost your confidence for your dream school!
          </p>
        </div>
        
        {/* CTA Button */}
        <Link
          href="/signup"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            color: '#fff',
            padding: '1.2rem 3rem',
            borderRadius: 50,
            fontWeight: 700,
            fontSize: '1.2rem',
            textDecoration: 'none',
            boxShadow: '0 20px 40px rgba(14, 165, 233, 0.2)',
            transition: 'all 0.3s ease',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(14, 165, 233, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.2)';
          }}
        >
          Get Started Free
        </Link>
        
        {/* Trust indicators */}
        <div style={{
          marginTop: '3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-label)',
            fontSize: '0.9rem',
          }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            AI-Powered Feedback
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-label)',
            fontSize: '0.9rem',
          }}>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
            Program-Specific Questions
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-label)',
            fontSize: '0.9rem',
          }}>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            Performance Analytics
          </div>
        </div>
      </div>
    </div>
  );
}
