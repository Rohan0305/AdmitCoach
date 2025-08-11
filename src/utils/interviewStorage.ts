import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, deleteDoc, where } from 'firebase/firestore';
import { app } from '@/firebase';


export const saveInterviewSession = async (session: InterviewSession): Promise<void> => {
  try {
    const db = getFirestore(app);
    await setDoc(doc(db, 'interviewSessions', session.id), session);
  } catch (error) {
    console.error('Error saving interview session:', error);
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
      sessions.push(doc.data() as InterviewSession);
    });
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