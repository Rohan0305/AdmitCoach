import { app } from "@/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import useAuthUser from "../zustand/useAuthUser";

const getAuthUser = () => {
  const { setUser } = useAuthUser();
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUser(null);
        setUserLoading(false);
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
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);
  
  return { userLoading };
};

export default getAuthUser;