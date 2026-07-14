import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Anonymous sign-in failed:", err.code, err.message);
          setAuthError(err);
        }
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  return { user, authReady, authError };
}