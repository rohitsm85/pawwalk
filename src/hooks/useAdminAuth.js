import { useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setAdmin(user);
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Login failed. Try again.");
    }
  };

  const logout = () => signOut(auth);

  return { admin, loading, login, logout, error };
}