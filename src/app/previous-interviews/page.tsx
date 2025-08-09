"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import { getInterviewSessions } from '@/utils/interviewStorage';
import { app } from '@/firebase';


export default function PreviousInterviewsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          const userSessions = await getInterviewSessions(currentUser.uid);
          setSessions(userSessions);
          
          if (userSessions.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('showLatest') === 'true') {
              setSelectedSession(userSessions[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 800, margin: "40px auto", padding: 24, background: "var(--color-card-bg)", borderRadius: 12, boxShadow: "var(--color-card-shadow)", border: "1px solid var(--color-border)" }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ color: 'var(--color-text)', fontSize: 18 }}>Loading your interview sessions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-gradient)', padding: '2rem' }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, background: "var(--color-card-bg)", borderRadius: 12, boxShadow: "var(--color-card-shadow)", border: "1px solid var(--color-border)" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Interview Session</h1>
            <button 
              onClick={() => setSelectedSession(null)}
              style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            >
              Back to Sessions
            </button>
          </div>
          
          <div style={{ marginBottom: 16, color: 'var(--color-label)' }}>
            <strong>Date:</strong> {new Date(selectedSession.date).toLocaleDateString()} | <strong>Program:</strong> {selectedSession.programType} | <strong>Questions:</strong> {selectedSession.completedQuestions}/{selectedSession.totalQuestions}
          </div>

          {selectedSession.answers.map((answer, idx) => (
            <div key={idx} style={{ marginBottom: 32, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: 'var(--color-text)' }}>
                Q{idx + 1}: {answer.question}
              </div>
              
              {answer.audioURL && (
                <div style={{ marginBottom: 12 }}>
                  <audio src={answer.audioURL} controls style={{ width: '100%' }} />
                </div>
              )}
              
              {answer.feedback && (
                <div style={{ background: '#374151', borderRadius: 8, padding: 16, border: '1px solid #4b5563' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#f3f4f6', fontWeight: 600 }}>🤖 AI Feedback</h4>
                  <p style={{ margin: '0 0 12px 0', color: '#d1d5db', lineHeight: '1.5' }}>{answer.feedback.text}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <div style={{ color: '#9ca3af' }}><strong style={{ color: '#f3f4f6' }}>Content:</strong> <span style={{ color: '#10b981' }}>{answer.feedback.contentScore}/10</span></div>
                    <div style={{ color: '#9ca3af' }}><strong style={{ color: '#f3f4f6' }}>Delivery:</strong> <span style={{ color: '#10b981' }}>{answer.feedback.deliveryScore}/10</span></div>
                    <div style={{ color: '#9ca3af' }}><strong style={{ color: '#f3f4f6' }}>Structure:</strong> <span style={{ color: '#10b981' }}>{answer.feedback.structureScore}/10</span></div>
                    <div style={{ color: '#9ca3af' }}><strong style={{ color: '#f3f4f6' }}>Overall:</strong> <span style={{ color: '#10b981' }}>{answer.feedback.overallScore}/10</span></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-gradient)', padding: '2rem' }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, background: "var(--color-card-bg)", borderRadius: 12, boxShadow: "var(--color-card-shadow)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Previous Interviews</h1>
          <Link href="/interview" style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
            Start New Interview
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <h3 style={{ color: 'var(--color-text)', marginBottom: 16 }}>No interview sessions yet</h3>
            <p style={{ color: 'var(--color-label)', marginBottom: 24 }}>Complete your first interview to see your responses and feedback here.</p>
            <Link href="/interview" style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
              Start Your First Interview
            </Link>
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
  );
} 