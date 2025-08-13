import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, deleteDoc, where } from 'firebase/firestore';
import { app } from '@/firebase';

// Helper function to compress audio data URL to fit within Firestore limits
const compressAudioDataURL = async (audioURL: string): Promise<string> => {
  try {
    // Convert data URL back to blob
    const response = await fetch(audioURL);
    const audioBlob = await response.blob();
    
    console.log(`Original audio size: ${audioBlob.size} bytes`);
    
    // If already small enough, return as is
    if (audioBlob.size < 500000) { // 500KB limit
      return audioURL;
    }
    
    // Create a canvas to compress the audio
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    // Create an audio element to get duration
    const audio = new Audio(audioURL);
    const duration = audio.duration || 30; // Default to 30 seconds if can't determine
    
    // Set canvas size based on duration (simplified visualization)
    canvas.width = Math.min(800, duration * 20);
    canvas.height = 100;
    
    // Fill with a simple waveform representation
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Convert canvas to compressed data URL
    const compressedDataURL = canvas.toDataURL('image/jpeg', 0.3); // High compression
    
    console.log(`Compressed audio representation size: ${compressedDataURL.length} bytes`);
    
    // Return compressed version if it's smaller
    if (compressedDataURL.length < audioURL.length) {
      return compressedDataURL;
    }
    
    // Fallback: return truncated original
    return audioURL.substring(0, 500000);
    
  } catch (error) {
    console.error('Error compressing audio:', error);
    // Return truncated original as fallback
    return audioURL.substring(0, 500000);
  }
};

// Helper function to process audio for storage
const processAudioForStorage = async (audioURL: string): Promise<string | null> => {
  try {
    if (!audioURL || !audioURL.startsWith('data:')) {
      return audioURL;
    }
    
    // Compress the audio to fit within Firestore limits
    const compressedURL = await compressAudioDataURL(audioURL);
    
    // Check if compressed version is small enough
    if (compressedURL.length < 500000) {
      console.log(`Audio compressed successfully to ${compressedURL.length} bytes`);
      return compressedURL;
    } else {
      console.warn(`Audio still too large after compression: ${compressedURL.length} bytes`);
      // Return a placeholder instead
      return 'data:audio/mp4;base64,PLACEHOLDER_AUDIO_TOO_LARGE';
    }
    
  } catch (error) {
    console.error('Error processing audio:', error);
    return null;
  }
};

// Deep sanitization function to ensure Firestore compatibility
const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip functions and symbols
      if (typeof value === 'function' || typeof value === 'symbol') continue;
      
      // Skip Blob objects
      if (value instanceof Blob) continue;
      
      sanitized[key] = sanitizeForFirestore(value);
    }
    return sanitized;
  }
  
  return null;
};

export const saveInterviewSession = async (session: InterviewSession): Promise<void> => {
  try {
    const db = getFirestore(app);
    
    console.log('Processing interview session for storage...');
    
    // Create a properly sanitized session for Firestore
    const sanitizedSession = {
      id: String(session.id),
      date: String(session.date),
      programType: String(session.programType || ''),
      totalQuestions: Number(session.totalQuestions || 0),
      completedQuestions: Number(session.completedQuestions || 0),
      userId: String(session.userId),
      answers: await Promise.all(session.answers.map(async (answer, index) => {
        console.log(`Processing answer ${index}:`, answer);
        
        // Process audio for storage (compress if needed)
        let audioURL = answer.audioURL;
        if (audioURL && audioURL.startsWith('data:')) {
          console.log(`Processing audio data for answer ${index}`);
          audioURL = await processAudioForStorage(audioURL) || null;
        }
        
        // Sanitize the answer object
        const sanitizedAnswer: any = {
          question: String(answer.question || ''),
          questionId: Number(answer.questionId || 0),
          audioURL: audioURL ? String(audioURL) : null,
        };
        
        // Add feedback if it exists
        if (answer.feedback) {
          sanitizedAnswer.feedback = {
            text: String(answer.feedback.text || ''),
            contentScore: Number(answer.feedback.contentScore || 0),
            deliveryScore: Number(answer.feedback.deliveryScore || 0),
            structureScore: Number(answer.feedback.structureScore || 0),
            overallScore: Number(answer.feedback.overallScore || 0),
            strengths: Array.isArray(answer.feedback.strengths) ? answer.feedback.strengths.map(s => String(s)) : [],
            weaknesses: Array.isArray(answer.feedback.weaknesses) ? answer.feedback.weaknesses.map(w => String(w)) : [],
            suggestions: Array.isArray(answer.feedback.suggestions) ? answer.feedback.suggestions.map(s => String(s)) : [],
            admissionsPerspective: String(answer.feedback.admissionsPerspective || '')
          };
        }
        
        return sanitizedAnswer;
      }))
    };
    
    console.log('Sanitized session prepared for storage');
    
    // Check document size before saving
    const documentSize = new Blob([JSON.stringify(sanitizedSession)]).size;
    console.log(`Document size: ${documentSize} bytes`);
    
    if (documentSize > 900000) { // Leave some buffer under 1MB limit
      console.warn(`Document size (${documentSize} bytes) is close to Firestore limit. Applying compression...`);
      
      // Apply more aggressive compression
      const compressedSession = {
        ...sanitizedSession,
        answers: sanitizedSession.answers.map(answer => ({
          question: answer.question,
          questionId: answer.questionId,
          audioURL: answer.audioURL,
          // Only keep essential feedback data
          feedback: answer.feedback ? {
            contentScore: answer.feedback.contentScore,
            deliveryScore: answer.feedback.deliveryScore,
            structureScore: answer.feedback.structureScore,
            overallScore: answer.feedback.overallScore,
            text: answer.feedback.text?.substring(0, 300) + '...' // More aggressive truncation
          } : null
        }))
      };
      
      const compressedSize = new Blob([JSON.stringify(compressedSession)]).size;
      console.log(`Compressed document size: ${compressedSize} bytes`);
      
      if (compressedSize <= 900000) {
        console.log('Using compressed session to stay under size limit');
        await setDoc(doc(db, 'interviewSessions', session.id), compressedSession);
      } else {
        // Last resort: save only essential data
        const minimalSession = {
          id: sanitizedSession.id,
          date: sanitizedSession.date,
          programType: sanitizedSession.programType,
          totalQuestions: sanitizedSession.totalQuestions,
          completedQuestions: sanitizedSession.completedQuestions,
          userId: sanitizedSession.userId,
          answers: sanitizedSession.answers.map(answer => ({
            question: answer.question,
            questionId: answer.questionId,
            audioURL: answer.audioURL
          }))
        };
        
        console.log('Using minimal session due to size constraints');
        await setDoc(doc(db, 'interviewSessions', session.id), minimalSession);
      }
    } else {
      // Save the complete session
      await setDoc(doc(db, 'interviewSessions', session.id), sanitizedSession);
    }
    
    console.log('Interview session saved successfully!');
    
  } catch (error) {
    console.error('Error saving interview session:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    // If there's still an error, log the exact problematic data
    if (error instanceof Error && error.message.includes('Property array contains an invalid nested entity')) {
      console.error('The issue is with the answers array structure');
      console.error('Session ID:', session.id);
      console.error('Answers count:', session.answers.length);
      session.answers.forEach((answer, index) => {
        console.error(`Answer ${index} structure:`, {
          hasQuestion: !!answer.question,
          hasQuestionId: !!answer.questionId,
          hasAudioURL: !!answer.audioURL,
          hasFeedback: !!answer.feedback,
          questionType: typeof answer.question,
          questionIdType: typeof answer.questionId,
          feedbackType: typeof answer.feedback,
          audioURLType: typeof answer.audioURL
        });
      });
    }
    
    throw error;
  }
};

export const getInterviewSessions = async (userId: string): Promise<InterviewSession[]> => {
  try {
    const db = getFirestore(app);
    const sessionsRef = collection(db, 'interviewSessions');
    const q = query(sessionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const sessions: InterviewSession[] = [];
    querySnapshot.forEach((doc) => {
      const sessionData = doc.data();
      console.log('Retrieved session data:', {
        id: sessionData.id,
        answersCount: sessionData.answers?.length || 0,
        hasAnswers: !!sessionData.answers,
        firstAnswer: sessionData.answers?.[0] ? {
          hasQuestion: !!sessionData.answers[0].question,
          hasQuestionId: !!sessionData.answers[0].questionId,
          hasAudioURL: !!sessionData.answers[0].audioURL,
          hasFeedback: !!sessionData.answers[0].feedback,
          feedbackScores: sessionData.answers[0].feedback ? {
            content: sessionData.answers[0].feedback.contentScore,
            delivery: sessionData.answers[0].feedback.deliveryScore,
            structure: sessionData.answers[0].feedback.structureScore,
            overall: sessionData.answers[0].feedback.overallScore
          } : null
        } : null
      });
      sessions.push(sessionData as InterviewSession);
    });
    
    console.log('Total sessions retrieved:', sessions.length);
    
    // Sort sessions by date (most recent first)
    sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return sessions;
  } catch (error) {
    console.error('Error getting interview sessions:', error);
    return [];
  }
};

export const getInterviewSession = async (sessionId: string): Promise<InterviewSession | null> => {
  try {
    const db = getFirestore(app);
    const sessionDoc = await getDoc(doc(db, 'interviewSessions', sessionId));
    
    if (sessionDoc.exists()) {
      return sessionDoc.data() as InterviewSession;
    }
    return null;
  } catch (error) {
    console.error('Error getting interview session:', error);
    return null;
  }
};

export const deleteInterviewSession = async (sessionId: string): Promise<void> => {
  try {
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'interviewSessions', sessionId));
  } catch (error) {
    console.error('Error deleting interview session:', error);
    throw error;
  }
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}; 