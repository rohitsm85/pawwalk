// src/hooks/useBookedSlots.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Live-subscribes to the public bookedSlots collection for a given date
// and returns the set of already-taken times ("HH:MM"), so the booking
// form can grey them out. bookedSlots contains no PII -- see firestore.rules.
export function useBookedSlots(date) {
  const [takenTimes, setTakenTimes] = useState(new Set());

  useEffect(() => {
    if (!date) {
      setTakenTimes(new Set());
      return;
    }

    const q = query(collection(db, "bookedSlots"), where("date", "==", date));
    const unsub = onSnapshot(q, (snap) => {
      setTakenTimes(new Set(snap.docs.map((d) => d.data().time)));
    });
    return () => unsub();
  }, [date]);

  return takenTimes;
}
