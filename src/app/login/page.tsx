import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-gradient)',
      }}
    >
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: 350,
          padding: 40,
          border: '1.5px solid var(--color-border)',
          borderRadius: 18,
          background: 'var(--color-card-bg)',
          boxShadow: 'var(--color-card-shadow)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>AC</span>
          </div>
          <h2 style={{ textAlign: 'center', color: 'var(--color-text)', fontWeight: 700, fontSize: 28, margin: 0 }}>AdmitCoach</h2>
          <p style={{ color: 'var(--color-label)', fontSize: 16, marginTop: 4 }}>Sign in to your account</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="email" style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15 }}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            style={{
              padding: '0.75rem',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="password" style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15 }}>Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            style={{
              padding: '0.75rem',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 16,
              outline: 'none',
              transition: 'border 0.2s',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '0.75rem',
            borderRadius: 8,
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 0.5,
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.10)',
            cursor: 'pointer',
            marginTop: 8,
            transition: 'background 0.2s',
          }}
        >
          Login
        </button>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ color: 'var(--color-label)', fontSize: 15 }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
} 