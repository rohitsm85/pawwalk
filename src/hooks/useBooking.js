// src/hooks/useBooking.js
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function useBooking(user) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitBooking = async ({ ownerName, dogName, date, time, notes }) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addDoc(collection(db, "walks"), {
        userId: user.uid,
        ownerName,
        dogName,
        date,
        time,
        notes: notes || "",
        status: "pending",       // pending → approved / rejected
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (err) {
      console.error("Booking error:", err);
      setError("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { submitBooking, loading, error, success };
}