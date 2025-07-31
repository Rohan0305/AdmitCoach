"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Feedback {
  text: string;
  contentScore: number | null;
  deliveryScore: number | null;
  structureScore: number | null;
  overallScore: number | null;
}

interface Answer {
  audioURL: string | null;
  feedback: Feedback | null;
  question: string;
  questionId: number;
}

interface InterviewSession {
  id: string;
  date: string;
  answers: Answer[];
  programType: string;
}

export default function PreviousInterviewsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    // TODO: Load actual interview sessions from localStorage or database
    // For now, show placeholder data
    const mockSessions: InterviewSession[] = [
      {
        id: "1",
        date: "2024-01-15",
        programType: "Medical School",
        answers: [
          {
            questionId: 1,
            question: "Why do you want to become a doctor?",
            audioURL: null, // Would be stored URL
            feedback: {
              text: "Your answer was clear and relevant. Try to elaborate more on your personal motivation.",
              contentScore: 8,
              deliveryScore: 7,
              structureScore: 9,
              overallScore: 8
            }
          }
        ]
      }
    ];
    setSessions(mockSessions);
  }, []);

  if (selectedSession) {
    return (
      <div style={{ maxWidth: 800, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Interview Session</h1>
          <button 
            onClick={() => setSelectedSession(null)}
            style={{ background: '#6b7280', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Back to Sessions
          </button>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <strong>Date:</strong> {selectedSession.date} | <strong>Program:</strong> {selectedSession.programType}
        </div>

        {selectedSession.answers.map((answer, idx) => (
          <div key={idx} style={{ marginBottom: 32, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>
              Q{idx + 1}: {answer.question}
            </div>
            
            {answer.audioURL && (
              <div style={{ marginBottom: 12 }}>
                <audio src={answer.audioURL} controls style={{ width: '100%' }} />
              </div>
            )}
            
            {answer.feedback && (
              <div style={{ background: '#f1f5f9', borderRadius: 8, padding: 16 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>AI Feedback</h4>
                <p style={{ margin: '0 0 12px 0' }}>{answer.feedback.text}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <div><strong>Content:</strong> {answer.feedback.contentScore}/10</div>
                  <div><strong>Delivery:</strong> {answer.feedback.deliveryScore}/10</div>
                  <div><strong>Structure:</strong> {answer.feedback.structureScore}/10</div>
                  <div><strong>Overall:</strong> {answer.feedback.overallScore}/10</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Previous Interviews</h1>
        <Link href="/interview" style={{ background: '#0ea5e9', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>
          Start New Interview
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h3 style={{ color: '#6b7280', marginBottom: 16 }}>No interview sessions yet</h3>
          <p style={{ color: '#9ca3af', marginBottom: 24 }}>Complete your first interview to see your responses and feedback here.</p>
          <Link href="/interview" style={{ background: '#0ea5e9', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            Start Your First Interview
          </Link>
        </div>
      ) : (
        <div>
          {sessions.map((session) => (
            <div 
              key={session.id} 
              style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: 8, 
                padding: 16, 
                marginBottom: 12, 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setSelectedSession(session)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 18 }}>{session.programType} Interview</h3>
                  <p style={{ margin: 0, color: '#6b7280' }}>{session.date} • {session.answers.length} questions</p>
                </div>
                <div style={{ color: '#6b7280' }}>→</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 