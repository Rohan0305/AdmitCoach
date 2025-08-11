"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import { getInterviewSessions } from '@/utils/interviewStorage';
import { app } from '@/firebase';
import InterviewReport from '@/components/InterviewReport';


export default function PreviousInterviewsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        console.log('🔄 Starting to load sessions...');
        setLoading(true);
        
        const auth = getAuth(app);
        console.log('🔐 Auth object:', auth);
        
        const currentUser = auth.currentUser;
        console.log('👤 Current user:', currentUser);
        
        if (currentUser) {
          console.log('✅ User authenticated, loading sessions for:', currentUser.uid);
          const userSessions = await getInterviewSessions(currentUser.uid);
          console.log('📊 Loaded sessions from Firestore:', userSessions);
          console.log('📊 Sessions length:', userSessions.length);
          
          setSessions(userSessions);
          
          if (userSessions.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('showLatest') === 'true') {
              setSelectedSession(userSessions[0]);
            }
          }
        } else {
          console.log('❌ No authenticated user found');
          console.log('🔍 Auth state:', auth);
        }
      } catch (error) {
        console.error('💥 Error loading sessions:', error);
        setSessions([]);
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    console.log('🚀 useEffect triggered, waiting for auth...');
    
    // Wait for auth state to be ready
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      console.log('🔐 Auth state changed:', user);
      if (user) {
        loadSessions();
      } else {
        console.log('❌ No user in auth state');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 800, margin: "40px auto", padding: 24, background: "var(--color-card-bg)", borderRadius: 12, boxShadow: "var(--color-card-shadow)", border: "1px solid var(--color-border)" }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ 
              color: 'var(--color-text)', 
              fontSize: 18, 
              marginBottom: 16 
            }}>
              Loading your interview sessions...
            </div>
            <div style={{
              width: 32,
              height: 32,
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-gradient)', padding: '2rem' }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24, background: "var(--color-card-bg)", borderRadius: 12, boxShadow: "var(--color-card-shadow)", border: "1px solid var(--color-border)" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Interview Session</h1>
            <button 
              onClick={() => setSelectedSession(null)}
              style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            >
              Back to Sessions
            </button>
          </div>
          
          <InterviewReport session={selectedSession} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-gradient)', padding: '2rem' }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, background: "var(--color-card-bg)", borderRadius: 12, boxShadow: "var(--color-card-shadow)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Previous Interviews</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/dashboard" style={{ 
              background: '#6b7280', 
              color: '#fff', 
              padding: '0.5rem 1rem', 
              borderRadius: 6, 
              textDecoration: 'none', 
              fontWeight: 600,
              transition: 'background-color 0.2s'
            }}>
              ← Back to Dashboard
            </Link>
            <Link href="/interview" style={{ 
              background: '#3b82f6', 
              color: '#fff', 
              padding: '0.5rem 1rem', 
              borderRadius: 6, 
              textDecoration: 'none', 
              fontWeight: 600,
              transition: 'background-color 0.2s'
            }}>
              Start New Interview
            </Link>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <h3 style={{ color: 'var(--color-text)', marginBottom: 16 }}>No interview sessions yet</h3>
            <p style={{ color: 'var(--color-label)', marginBottom: 24 }}>Complete your first interview to see your responses and feedback here.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/dashboard" style={{ 
                background: '#6b7280', 
                color: '#fff', 
                padding: '0.7rem 1.5rem', 
                borderRadius: 8, 
                textDecoration: 'none', 
                fontWeight: 600,
                transition: 'background-color 0.2s'
              }}>
                ← Back to Dashboard
              </Link>
              <Link href="/interview" style={{ 
                background: '#3b82f6', 
                color: '#fff', 
                padding: '0.7rem 1.5rem', 
                borderRadius: 8, 
                textDecoration: 'none', 
                fontWeight: 600,
                transition: 'background-color 0.2s'
              }}>
                Start Your First Interview
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {sessions.map((session) => (
              <div 
                key={session.id} 
                style={{ 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 8, 
                  padding: 16, 
                  marginBottom: 12, 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => setSelectedSession(session)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: 18, color: 'var(--color-text)' }}>{session.programType} Interview</h3>
                    <p style={{ margin: 0, color: 'var(--color-label)' }}>{new Date(session.date).toLocaleDateString()} • {session.completedQuestions}/{session.totalQuestions} questions</p>
                  </div>
                  <div style={{ color: 'var(--color-label)' }}>→</div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
} 