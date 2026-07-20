// src/hooks/useMyBookings.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

// Live-subscribes to the signed-in client's own past bookings, newest
// first. Requires a composite index (userId asc, createdAt desc) — see
// firestore.indexes.json.
export function useMyBookings(user) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "walks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  return user ? bookings : [];
}
