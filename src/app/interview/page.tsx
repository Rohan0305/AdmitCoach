"use client";

import React, { useState, useRef, useEffect } from "react";
import { getAuth } from "firebase/auth";
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (user?.programType) {
      const questions = getQuestionsByProgram(user.programType);
      setCurated(getRandomQuestions(questions, 2));
      setSessionId(generateSessionId());
    }
  }, [user?.programType]);

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
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  console.log("USER ", user);

  const nextQuestion = async () => {
    setAudioURL(null);
    setHasRecorded(false);
    if (current < curated.length - 1) {
      setCurrent(current + 1);
    } else {
      // Process all answers with AI feedback at once
      console.log('Processing all answers with AI feedback...');
      setProcessingFeedback(true);
      
      try {
        // Process each answer that doesn't have feedback yet
        const updatedAnswers = [...answers];
        
        for (let i = 0; i < updatedAnswers.length; i++) {
          const answer = updatedAnswers[i];
          if (!answer.feedback) {
            console.log(`Processing feedback for question ${i + 1}...`);
            
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
            const feedbackData = await res.json();
            
            updatedAnswers[i] = { ...answer, feedback: feedbackData };
            setAnswers(updatedAnswers);
          }
        }
        
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
        } else {
          console.error('No authenticated user found');
          alert('Please log in to save your interview session.');
        }
      } catch (error: unknown) {
        console.error('Error processing feedback:', error);
        alert('Error processing AI feedback. Please try again.');
      } finally {
        setProcessingFeedback(false);
      }
      
      setSessionDone(true);
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
            Great job! Your interview session has been saved.
          </p>
          {processingFeedback ? (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: 'var(--color-text)', fontSize: 16, marginBottom: 12 }}>
                🤖 AI is grading your responses...
              </div>
              <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>
                This may take a few moments
              </div>
            </div>
          ) : (
            <Link href="/previous-interviews?showLatest=true" style={{
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '0.7rem 1.5rem',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-block',
              transition: 'background-color 0.2s'
            }}>
              View Interview Report
            </Link>
          )}
        </div>
      </div>
    );
  }

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
          disabled={!hasRecorded}
          style={{
            background: hasRecorded ? "var(--color-primary)" : "var(--color-muted)",
            color: "#fff",
            padding: "0.7rem 1.5rem",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: hasRecorded ? "pointer" : "not-allowed",
            opacity: hasRecorded ? 1 : 0.6,
            transition: "all 0.2s"
          }}
        >
          {current < curated.length - 1 ? "Next Question" : "Finish Interview"}
        </button>
      </div>
    </div>
    </div>
  );
}
