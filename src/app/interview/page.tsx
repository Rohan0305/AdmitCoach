"use client";

import React, { useState, useRef, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { saveInterviewSession, generateSessionId } from '@/utils/interviewStorage';
import { getQuestionsByProgram } from '@/utils/questionLoader';
import { app } from '@/firebase';
import useAuthUser from '../zustand/useAuthUser';
import Link from "next/link";

function getRandomQuestions(arr: Question[], n: number): Question[] {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function InterviewPage() {
  const { user } = useAuthUser();
  const [curated, setCurated] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [processingFeedback, setProcessingFeedback] = useState(false);
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [creditDeducted, setCreditDeducted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.programType) {
      // Check if user has credits
      if (!user.credits || user.credits <= 0) {
        setInsufficientCredits(true);
        return;
      }
      
      // Additional validation - check credits in Firestore
      const checkCredits = async () => {
        try {
          const auth = getAuth(app);
          const currentUser = auth.currentUser;
          if (currentUser) {
            const db = getFirestore(app);
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            const currentCredits = userDoc.data()?.credits || 0;
            
            if (currentCredits <= 0) {
              setInsufficientCredits(true);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking credits:', error);
        }
      };
      
      checkCredits();
      
      const questions = getQuestionsByProgram(user.programType);
      setCurated(getRandomQuestions(questions, 2));
      setSessionId(generateSessionId());
    }
    
    // Cleanup function to clear timer when component unmounts
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [user?.programType, user?.credits]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream, {
      mimeType: "audio/mp4",
    });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/mp4" });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      setHasRecorded(true);

      const newAnswer: Answer = {
        audioURL: url,
        feedback: null,
        question: curated[current].question,
        questionId: curated[current].id,
      };
      setAnswers((prev) => [...prev, newAnswer]);
    };
    mediaRecorder.start();
    setRecording(true);
    
    // Start recording timer
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    
    // Stop recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  console.log("USER ", user);

  // Show insufficient credits message
  if (insufficientCredits) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg-gradient)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: 500,
          padding: '2rem',
          background: 'var(--color-card-bg)',
          borderRadius: 12,
          boxShadow: 'var(--color-card-shadow)',
          border: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>
            Insufficient Credits
          </h1>
          <p style={{ color: 'var(--color-label)', marginBottom: 24, lineHeight: 1.5 }}>
            You need interview credits to start a mock interview. Please purchase credits to continue.
          </p>
          <Link href="/dashboard" style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '0.7rem 1.5rem',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 16,
            display: 'inline-block'
          }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const nextQuestion = async () => {
    if (current < curated.length - 1) {
      // Move to next question
      setAudioURL(null);
      setHasRecorded(false);
      setCurrent(current + 1);
    } else {
      // Finish interview - process all answers with AI feedback
      console.log('Finishing interview - processing all answers with AI feedback...');
      setProcessingFeedback(true);
      
      try {
        // Process each answer that doesn't have feedback yet
        const updatedAnswers = [...answers];
        
        for (let i = 0; i < updatedAnswers.length; i++) {
          const answer = updatedAnswers[i];
          if (!answer.feedback) {
            console.log(`Processing feedback for question ${i + 1}...`);
            
            try {
              // Convert audio URL back to blob for API call
              const response = await fetch(answer.audioURL!);
              const audioBlob = await response.blob();
              
              const formData = new FormData();
              formData.append("audio", audioBlob, "answer.mp4");
              formData.append("question", answer.question);
              formData.append("programType", user?.programType || "Medical School");

              const res = await fetch("/api/grade-interview", {
                method: "POST",
                body: formData,
              });
              
              if (!res.ok) {
                throw new Error(`API call failed: ${res.status}`);
              }
              
              const feedbackData = await res.json();
              console.log(`Feedback received for question ${i + 1}:`, feedbackData);
              
              updatedAnswers[i] = { ...answer, feedback: feedbackData };
            } catch (error) {
              console.error(`Error processing question ${i + 1}:`, error);
              // Continue with other questions even if one fails
            }
          }
        }
        
        // Update answers state with all feedback
        setAnswers(updatedAnswers);
        
        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          console.log('Current user ID:', currentUser.uid);
          const session: InterviewSession = {
            id: sessionId,
            date: new Date().toISOString(),
            programType: user?.programType || 'Unknown',
            answers: updatedAnswers,
            totalQuestions: curated.length,
            completedQuestions: updatedAnswers.length,
            userId: currentUser.uid
          };
          console.log('Attempting to save session:', session);
          await saveInterviewSession(session);
          console.log('Interview session saved successfully');
          
          // CREDIT DEDUCTION - ONLY ONCE PER SESSION
          // Check if we already deducted credits for this session
          const sessionKey = `creditDeducted_${sessionId}`;
          const alreadyDeducted = sessionStorage.getItem(sessionKey);
          
          if (!alreadyDeducted) {
            try {
              const db = getFirestore(app);
              const userRef = doc(db, 'users', currentUser.uid);
              
              // Get current user data to check credits
              const userDoc = await getDoc(userRef);
              const currentCredits = userDoc.data()?.credits || 0;
              
              if (currentCredits > 0) {
                await updateDoc(userRef, {
                  credits: increment(-1),
                });
                console.log('Credit deducted successfully. New balance:', currentCredits - 1);
                
                // Mark this session as having credits deducted
                sessionStorage.setItem(sessionKey, 'true');
              } else {
                console.log('No credits available to deduct');
              }
            } catch (error) {
              console.error('Error deducting credit:', error);
            }
          } else {
            console.log('Credits already deducted for this session, skipping deduction');
          }
        } else {
          console.error('No authenticated user found');
          alert('Please log in to save your interview session.');
        }
        
        console.log('Interview completed successfully, setting sessionDone to true');
        setSessionDone(true);
        
      } catch (error: unknown) {
        console.error('Error processing feedback:', error);
        alert('Error processing AI feedback. Please try again.');
        setProcessingFeedback(false);
      }
    }
  };

  if (!curated.length) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!user?.programType ? 'Loading your program information...' : 'Loading questions...'}
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg-gradient)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: 24,
          background: "var(--color-card-bg)",
          borderRadius: 12,
          boxShadow: "var(--color-card-shadow)",
          border: "1px solid var(--color-border)",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>
            Interview Complete!
          </h1>
          <p style={{ fontSize: 18, marginBottom: 24, color: 'var(--color-label)' }}>
            Great job! Your interview session has been saved and is being analyzed.
          </p>
          {processingFeedback ? (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: 'var(--color-text)', fontSize: 16, marginBottom: 12 }}>
                🤖 AI is conducting a comprehensive analysis of your responses...
              </div>
              <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                This may take a few moments as we analyze each answer in detail
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 16, marginBottom: 24, color: 'var(--color-label)' }}>
                Your detailed performance report is ready! Get comprehensive feedback on your interview skills.
              </p>
              <Link href="/previous-interviews?showLatest=true" style={{
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '0.7rem 1.5rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
                transition: 'background-color 0.2s',
                marginRight: '1rem'
              }}>
                View Detailed Report
              </Link>
              <Link href="/dashboard" style={{
                background: 'var(--color-muted)',
                color: '#fff',
                padding: '0.7rem 1.5rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
                transition: 'background-color 0.2s'
              }}>
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg-gradient)',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: 24,
          background: "var(--color-card-bg)",
          borderRadius: 12,
          boxShadow: "var(--color-card-shadow)",
          border: "1px solid var(--color-border)"
        }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'var(--color-text)' }}>
          {user?.programType || 'Interview'} Practice
        </h1>
        <div style={{ marginBottom: 24 }}>
          <strong style={{ color: 'var(--color-label)' }}>
            Question {current + 1} of {curated.length}:
          </strong>
          <div style={{ fontSize: 20, margin: "16px 0", color: 'var(--color-text)', lineHeight: 1.5 }}>
            {curated[current].question}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          {!recording ? (
            <button
              onClick={startRecording}
              style={{
                background: "var(--color-primary)",
                color: "#fff",
                padding: "0.7rem 1.5rem",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
            >
              Start Recording
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={stopRecording}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  padding: "0.7rem 1.5rem",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
              >
                Stop Recording
              </button>
              
              {/* Recording Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#dc2626',
                color: '#fff',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                animation: 'pulse 1.5s infinite'
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  background: '#fff',
                  borderRadius: '50%',
                  animation: 'blink 1s infinite'
                }}></div>
                RECORDING
                <span style={{ 
                  marginLeft: '0.5rem', 
                  padding: '0.25rem 0.5rem', 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: 'monospace'
                }}>
                  {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>
      {audioURL && (
        <div style={{ marginBottom: 16 }}>
          <audio src={audioURL} controls />
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={nextQuestion}
          disabled={!hasRecorded || processingFeedback}
          style={{
            background: hasRecorded && !processingFeedback ? "var(--color-primary)" : "var(--color-muted)",
            color: "#fff",
            padding: "0.7rem 1.5rem",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: hasRecorded && !processingFeedback ? "pointer" : "not-allowed",
            opacity: hasRecorded && !processingFeedback ? 1 : 0.6,
            transition: "all 0.2s",
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '140px',
            justifyContent: 'center'
          }}
        >
          {processingFeedback ? (
            <>
              <div style={{
                width: 16,
                height: 16,
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Processing...
            </>
          ) : (
            current < curated.length - 1 ? "Next Question" : "Finish Interview"
          )}
        </button>
              </div>
      </div>
    </div>
    </>
  );
}
