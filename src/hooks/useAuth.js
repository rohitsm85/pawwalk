// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Auto sign-in anonymously
        await signInAnonymously(auth);
      }
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  return { user, authReady };
}