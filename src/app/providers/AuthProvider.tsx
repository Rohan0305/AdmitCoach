"use client";

import React, { useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase';
import useAuthUser from '../zustand/useAuthUser';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setUser } = useAuthUser();

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return <>{children}</>;
} 