import { app } from "@/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";

const getUserData = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(undefined);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setUserData(null);
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {loading, userData};
};

export default getUserData;