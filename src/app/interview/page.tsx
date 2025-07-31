"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import questions from '@/data/questions_medical_school.json';

interface Question {
  id: number;
  type: string;
  question: string;
}
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setCurated(getRandomQuestions(questions as Question[], 2));
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream, {
      mimeType: 'audio/mp4'
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
        questionId: curated[current].id
      };
      setAnswers(prev => [...prev, newAnswer]);

      // Send to backend for grading (in background)
      const formData = new FormData();
      formData.append('audio', audioBlob, 'answer.mp4');
      formData.append('question', curated[current].question);

      try {
        const res = await fetch('/api/grade-interview', {
          method: 'POST',
          body: formData,
        });
        const feedbackData = await res.json();
        
        // Update the answer with feedback
        setAnswers(prev => prev.map((ans, idx) => 
          idx === current ? { ...ans, feedback: feedbackData } : ans
        ));
      } catch (error) {
        console.error('Error getting feedback:', error);
      }
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const nextQuestion = () => {
    setAudioURL(null);
    setHasRecorded(false);
    if (current < curated.length - 1) {
      setCurrent(current + 1);
    } else {
      setSessionDone(true);
    }
  };

  if (!curated.length) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading questions...</div>;
  }

  if (sessionDone) {
    return (
      <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Interview Complete!</h1>
        <p style={{ marginBottom: 24 }}>Great job completing your interview session. You can now review your responses and feedback.</p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button 
            onClick={() => { setCurrent(0); setAnswers([]); setSessionDone(false); setAudioURL(null); }} 
            style={{ background: '#0ea5e9', color: '#fff', padding: '0.7rem 1.5rem', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          >
            Start New Interview
          </button>
          <button 
            onClick={() => router.push('/previous-interviews')} 
            style={{ background: '#6366f1', color: '#fff', padding: '0.7rem 1.5rem', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
          >
            View Previous Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Interview Practice</h1>
      <div style={{ marginBottom: 24 }}>
        <strong>Question {current + 1} of {curated.length}:</strong>
        <div style={{ fontSize: 20, margin: "16px 0" }}>{curated[current].question}</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        {!recording ? (
          <button onClick={startRecording} style={{ background: '#0ea5e9', color: '#fff', padding: '0.7rem 1.5rem', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Start Recording</button>
        ) : (
          <button onClick={stopRecording} style={{ background: '#ef4444', color: '#fff', padding: '0.7rem 1.5rem', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Stop Recording</button>
        )}
      </div>
      {audioURL && (
        <div style={{ marginBottom: 16 }}>
          <audio src={audioURL} controls />
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={nextQuestion} 
          style={{ 
            background: hasRecorded ? '#6366f1' : '#9ca3af', 
            color: '#fff', 
            padding: '0.6rem 1.2rem', 
            border: 'none', 
            borderRadius: 8, 
            fontWeight: 600, 
            fontSize: 15, 
            cursor: hasRecorded ? 'pointer' : 'not-allowed' 
          }} 
          disabled={!hasRecorded}
        >
          Next Question
        </button>
      </div>
    </div>
  );
} 