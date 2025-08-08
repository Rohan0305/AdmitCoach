"use client";

import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../firebase';
import Link from 'next/link';
import getAuthUser from '../hooks/getUser';
import useAuthUser from '../zustand/useAuthUser';


export default function DashboardPage() {
  const { user } = useAuthUser();

  const { userLoading } = getAuthUser();

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    window.location.href = '/login';
  };

  if (userLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-gradient)',
      }}>
        <div style={{ color: 'var(--color-text)', fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-gradient)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--color-text)', marginBottom: 16 }}>Please log in</h2>
          <Link href="/login" style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Go to Login
          </Link>
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



        {/* Profile Status */}
        {!user?.profileCompleted && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{ color: '#92400e', margin: '0 0 0.5rem 0', fontSize: 16 }}>
              Complete Your Profile
            </h3>
            <p style={{ color: '#92400e', margin: 0, fontSize: 14 }}>
              Set up your profile to get personalized interview practice.
            </p>
            <Link href="/setup-profile" style={{
              display: 'inline-block',
              background: '#f59e0b',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
              marginTop: '0.5rem',
            }}>
              Complete Profile
            </Link>
          </div>
        )}

        {/* Profile Information */}
        {user?.profileCompleted && (
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

        {/* Experiences */}
        {user?.experiences && user.experiences.length > 0 && (
          <div style={{
            background: 'var(--color-card-bg)',
            borderRadius: 12,
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--color-card-shadow)',
            border: '1px solid var(--color-border)',
          }}>
            <h2 style={{ color: 'var(--color-text)', fontSize: 24, fontWeight: 600, margin: '0 0 1.5rem 0' }}>
              Your Experiences
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {user.experiences.map((exp, idx) => (
                <div key={idx} style={{
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 16 }}>
                    {exp.role || 'Role not specified'}
                  </div>
                  <div style={{ color: 'var(--color-label)', fontSize: 14, marginTop: 2 }}>
                    {exp.organization || 'Organization not specified'}
                  </div>
                  <div style={{ color: 'var(--color-label)', fontSize: 13, marginTop: 2 }}>
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                  <div style={{ color: 'var(--color-label)', fontSize: 15, marginTop: 4 }}>
                    {exp.description || 'No description provided'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              Start Mock Interview
            </Link>
            
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