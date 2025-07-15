"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '../../firebase';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth(app);
      const db = getFirestore(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save extra info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
      });
      // Redirect to profile setup page
      router.push('/setup-profile');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

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
        onSubmit={handleSubmit}
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
          <p style={{ color: 'var(--color-label)', fontSize: 16, marginTop: 4 }}>Create your account</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="firstName" style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15 }}>First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
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
          <label htmlFor="lastName" style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15 }}>Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            value={lastName}
            onChange={e => setLastName(e.target.value)}
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
          <label htmlFor="email" style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15 }}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            value={password}
            onChange={e => setPassword(e.target.value)}
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
          <label htmlFor="confirmPassword" style={{ color: 'var(--color-label)', fontWeight: 500, fontSize: 15 }}>Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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
          disabled={loading}
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
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 8,
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Signing up...' : 'Sign up'}
        </button>
        {error && <div style={{ color: '#ef4444', textAlign: 'center', fontSize: 15 }}>{error}</div>}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <span style={{ color: 'var(--color-label)', fontSize: 15 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Log in
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
} 