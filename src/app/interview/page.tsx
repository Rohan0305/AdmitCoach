"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import questions from "@/data/questions_medical_school.json";
import { saveInterviewSession, generateSessionId } from '@/utils/interviewStorage';
import { app } from '@/firebase';

function getRandomQuestions(arr: Question[], n: number): Question[] {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export default function InterviewPage() {
  const router = useRouter();
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
    setCurated(getRandomQuestions(questions as Question[], 2));
    setSessionId(generateSessionId());
  }, []);

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

      // Store the answer immediately (without feedback for now)
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

            const res = await fetch("/api/grade-interview", {
              method: "POST",
              body: formData,
            });
            const feedbackData = await res.json();
            
            updatedAnswers[i] = { ...answer, feedback: feedbackData };
            setAnswers(updatedAnswers);
          }
        }
        
        // Save the session with all feedback
        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          console.log('Current user ID:', currentUser.uid);
          const session: InterviewSession = {
            id: sessionId,
            date: new Date().toISOString(),
            programType: 'Medical School',
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
      } catch (error: any) {
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
        Loading questions...
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div
        style={{
          maxWidth: 700,
          margin: "40px auto",
          padding: 24,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          Interview Complete!
        </h1>
        
        {processingFeedback ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 18, color: '#6366f1', marginBottom: 12 }}>
                🤖 AI is grading your responses...
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                This may take a few moments. Please wait.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                disabled
                style={{
                  background: "#9ca3af",
                  color: "#fff",
                  padding: "0.7rem 1.5rem",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "not-allowed",
                }}
              >
                Processing AI Feedback...
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ marginBottom: 24 }}>
              Great job completing your interview session! Your AI feedback is ready. Review your responses and feedback to improve your skills.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => router.push("/previous-interviews?showLatest=true")}
                style={{
                  background: "#6366f1",
                  color: "#fff",
                  padding: "0.7rem 1.5rem",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                View Interview Report
              </button>
              <button
                onClick={() => {
                  setCurrent(0);
                  setAnswers([]);
                  setSessionDone(false);
                  setAudioURL(null);
                  setHasRecorded(false);
                }}
                style={{
                  background: "#0ea5e9",
                  color: "#fff",
                  padding: "0.7rem 1.5rem",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Start New Interview
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Interview Practice
      </h1>
      <div style={{ marginBottom: 24 }}>
        <strong>
          Question {current + 1} of {curated.length}:
        </strong>
        <div style={{ fontSize: 20, margin: "16px 0" }}>
          {curated[current].question}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        {!recording ? (
          <button
            onClick={startRecording}
            style={{
              background: "#0ea5e9",
              color: "#fff",
              padding: "0.7rem 1.5rem",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
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
          style={{
            background: hasRecorded ? "#6366f1" : "#9ca3af",
            color: "#fff",
            padding: "0.6rem 1.2rem",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            cursor: hasRecorded ? "pointer" : "not-allowed",
          }}
          disabled={!hasRecorded}
        >
          {current < curated.length - 1 ? "Next Question" : "Finish Interview"}
        </button>
      </div>
    </div>
  );
}
