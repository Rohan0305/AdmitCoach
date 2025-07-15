import { app } from "@/firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import React from "react";
import { useEffect, useState } from "react";

const getUserData = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<any>(undefined);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth(app);
      const db = getFirestore(app);
      const user = auth.currentUser;
      if (!user) {
        console.log("HERE!!!!")
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            setUserData(userDoc.data())
        }
      } catch (err) {
        
      }
    };
    fetchUserData();
  }, []);

  return {loading, userData};
};

export default getUserData;