"use client";

import React, { useEffect } from 'react';
import { app } from '../../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import useAuthUser from '../zustand/useAuthUser';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser } = useAuthUser();
  
  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUser(null);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);
  
  return <>{children}</>;
} 