// src/hooks/useBooking.js
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

function isInThePast(date, time) {
  return new Date(`${date}T${time}:00`) <= new Date();
}

export function useBooking(user) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  const submitBooking = async ({ ownerName, dogName, email, address, date, time, notes }) => {
    if (!user) return;

    if (isInThePast(date, time)) {
      setError("That time has already passed. Please pick a different slot.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const ref = await addDoc(collection(db, "walks"), {
        userId: user.uid,
        ownerName,
        dogName,
        email,
        address,
        date,
        time,
        notes: notes || "",
        status: "pending",       // pending → approved / rejected / cancelled
        createdAt: serverTimestamp(),
      });
      setBookingId(ref.id);
      setSuccess(true);
    } catch (err) {
      console.error("Booking error:", err);
      setError("Failed to submit booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!bookingId) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "walks", bookingId), { status: "cancelled" });
      setCancelled(true);
    } catch (err) {
      console.error("Cancel error:", err);
      setError("Failed to cancel booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { submitBooking, cancelBooking, loading, error, success, cancelled };
}
