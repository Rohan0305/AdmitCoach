'use client';

import React from 'react';
import { InterviewSession } from '@/app/types/globals';

interface InterviewReportProps {
  session: InterviewSession;
}

export default function InterviewReport({ session }: InterviewReportProps) {
  // Calculate final scores
  const totalScores = session.answers.reduce((acc, answer) => {
    if (answer.feedback) {
      acc.content += answer.feedback.contentScore || 0;
      acc.delivery += answer.feedback.deliveryScore || 0;
      acc.structure += answer.feedback.structureScore || 0;
      acc.overall += answer.feedback.overallScore || 0;
    }
    return acc;
  }, { content: 0, delivery: 0, structure: 0, overall: 0 });

  const averageScores = {
    content: Math.round((totalScores.content / session.answers.length) * 10) / 10,
    delivery: Math.round((totalScores.delivery / session.answers.length) * 10) / 10,
    structure: Math.round((totalScores.structure / session.answers.length) * 10) / 10,
    overall: Math.round((totalScores.overall / session.answers.length) * 10) / 10,
  };

  // Determine overall performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 9) return { level: 'Exceptional', color: '#059669', bgColor: '#d1fae5' };
    if (score >= 8) return { level: 'Strong', color: '#0891b2', bgColor: '#cffafe' };
    if (score >= 7) return { level: 'Good', color: '#7c3aed', bgColor: '#ede9fe' };
    if (score >= 6) return { level: 'Average', color: '#d97706', bgColor: '#fef3c7' };
    if (score >= 4) return { level: 'Below Average', color: '#dc2626', bgColor: '#fee2e2' };
    return { level: 'Needs Improvement', color: '#991b1b', bgColor: '#fecaca' };
  };

  const overallPerformance = getPerformanceLevel(averageScores.overall);

  return (
    <div style={{
      background: 'var(--color-card-bg)',
      borderRadius: 16,
      padding: '2rem',
      boxShadow: 'var(--color-card-shadow)',
      border: '1px solid var(--color-border)',
      marginBottom: '2rem',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h1 style={{
          color: 'var(--color-text)',
          fontSize: 28,
          fontWeight: 700,
          margin: '0 0 1rem 0',
        }}>
          Interview Performance Report
        </h1>
        <p style={{
          color: 'var(--color-label)',
          fontSize: 16,
          margin: '0 0 1rem 0',
        }}>
          {session.programType} • {new Date(session.date).toLocaleDateString()}
        </p>
        
        {/* Overall Performance Badge */}
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1.5rem',
          borderRadius: 25,
          background: overallPerformance.bgColor,
          color: overallPerformance.color,
          fontSize: 18,
          fontWeight: 600,
          border: `2px solid ${overallPerformance.color}`,
        }}>
          {overallPerformance.level} Performance
        </div>
      </div>

      {/* Final Scores Summary */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 12,
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid var(--color-border)',
      }}>
        <h2 style={{
          color: 'var(--color-text)',
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 1rem 0',
          textAlign: 'center',
        }}>
          Final Scores
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {Object.entries(averageScores).map(([category, score]) => {
            const performance = getPerformanceLevel(score);
            return (
              <div key={category} style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#fff',
                borderRadius: 8,
                border: '1px solid var(--color-border)',
              }}>
                <div style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: performance.color,
                  marginBottom: '0.5rem',
                }}>
                  {score}/10
                </div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--color-label)',
                  textTransform: 'capitalize',
                }}>
                  {category}
                </div>
                <div style={{
                  fontSize: 12,
                  color: performance.color,
                  fontWeight: 500,
                }}>
                  {performance.level}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question-by-Question Analysis */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          color: 'var(--color-text)',
          fontSize: 20,
          fontWeight: 600,
          margin: '0 0 1rem 0',
        }}>
          Detailed Analysis
        </h2>
        
        {session.answers.map((answer, index) => (
          <div key={index} style={{
            background: '#f8fafc',
            borderRadius: 12,
            padding: '1.5rem',
            marginBottom: '1rem',
            border: '1px solid var(--color-border)',
          }}>
            <h3 style={{
              color: 'var(--color-text)',
              fontSize: 18,
              fontWeight: 600,
              margin: '0 0 1rem 0',
            }}>
              Question {index + 1}: {answer.question}
            </h3>
            
            {/* Audio Player */}
            {answer.audioURL && (
              <div style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    color: '#475569',
                    fontSize: 14,
                    fontWeight: 500
                  }}>
                    🎙️ Your Response:
                  </span>
                </div>
                <audio 
                  src={answer.audioURL} 
                  controls 
                  style={{ 
                    width: '100%',
                    height: '40px'
                  }}
                />
              </div>
            )}
            
            {answer.feedback && (
              <div>
                {/* Scores */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{ textAlign: 'center', padding: '0.5rem', background: '#fff', borderRadius: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {answer.feedback.contentScore}/10
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-label)' }}>Content</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.5rem', background: '#fff', borderRadius: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {answer.feedback.deliveryScore}/10
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-label)' }}>Delivery</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.5rem', background: '#fff', borderRadius: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {answer.feedback.structureScore}/10
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-label)' }}>Structure</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.5rem', background: '#fff', borderRadius: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {answer.feedback.overallScore}/10
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-label)' }}>Overall</div>
                  </div>
                </div>

                {/* Detailed Feedback */}
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{
                    color: 'var(--color-text)',
                    fontSize: 16,
                    lineHeight: 1.6,
                    margin: '0 0 1rem 0',
                  }}>
                    {answer.feedback.text}
                  </p>
                </div>

                {/* Strengths and Weaknesses */}
                {answer.feedback.strengths && answer.feedback.strengths.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{
                      color: '#059669',
                      fontSize: 14,
                      fontWeight: 600,
                      margin: '0 0 0.5rem 0',
                    }}>
                      ✅ Strengths:
                    </h4>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'var(--color-text)',
                      fontSize: 14,
                    }}>
                      {answer.feedback.strengths.map((strength, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {answer.feedback.weaknesses && answer.feedback.weaknesses.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{
                      color: '#dc2626',
                      fontSize: 14,
                      fontWeight: 600,
                      margin: '0 0 0.5rem 0',
                    }}>
                      ⚠️ Areas for Improvement:
                    </h4>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'var(--color-text)',
                      fontSize: 14,
                    }}>
                      {answer.feedback.weaknesses.map((weakness, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {answer.feedback.suggestions && answer.feedback.suggestions.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{
                      color: '#0891b2',
                      fontSize: 14,
                      fontWeight: 600,
                      margin: '0 0 0.5rem 0',
                    }}>
                      💡 Suggestions:
                    </h4>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '1.5rem',
                      color: 'var(--color-text)',
                      fontSize: 14,
                    }}>
                      {answer.feedback.suggestions.map((suggestion, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {answer.feedback.admissionsPerspective && (
                  <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: 8,
                    padding: '1rem',
                  }}>
                    <h4 style={{
                      color: '#0c4a6e',
                      fontSize: 14,
                      fontWeight: 600,
                      margin: '0 0 0.5rem 0',
                    }}>
                      🎯 Admissions Committee Perspective:
                    </h4>
                    <p style={{
                      color: '#0c4a6e',
                      fontSize: 14,
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      {answer.feedback.admissionsPerspective}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Plan */}
      <div style={{
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: 12,
        padding: '1.5rem',
      }}>
        <h3 style={{
          color: '#92400e',
          fontSize: 18,
          fontWeight: 600,
          margin: '0 0 1rem 0',
        }}>
          🚀 Next Steps & Action Plan
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '1.5rem',
          color: '#92400e',
          fontSize: 14,
          lineHeight: 1.6,
        }}>
          <li>Review your lowest scoring areas and focus improvement efforts there</li>
          <li>Practice similar questions with the specific feedback in mind</li>
          <li>Record yourself answering questions to improve delivery</li>
          <li>Prepare more specific examples and personal stories</li>
          <li>Consider scheduling another mock interview to track progress</li>
        </ul>
      </div>
    </div>
  );
} 