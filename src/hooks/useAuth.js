import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// Clients sign in with Google (not anonymously) so bookings tie to a
// persistent identity, letting them see their own booking history.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      // Ignore stale anonymous sessions from before Google Sign-In was
      // required -- treat them as signed out so the login screen shows.
      setUser(currentUser && !currentUser.isAnonymous ? currentUser : null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      console.error("Sign-in failed:", err.code, err.message);
      setAuthError(err);
    }
  };

  const logout = () => signOut(auth);

  return { user, authReady, authError, login, logout };
}
