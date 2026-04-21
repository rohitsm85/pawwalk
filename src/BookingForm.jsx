// src/components/BookingForm.jsx  ← adapt to your actual filename
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBooking } from "../hooks/useBooking";

export default function BookingForm() {
  const { user, authReady } = useAuth();
  const { submitBooking, loading, error, success } = useBooking(user);

  const [form, setForm] = useState({
    ownerName: "",
    dogName: "",
    date: "",
    time: "",
    notes: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitBooking(form);
  };

  if (!authReady) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input name="ownerName" placeholder="Your Name" value={form.ownerName} onChange={handleChange} required />
      <input name="dogName" placeholder="Dog's Name" value={form.dogName} onChange={handleChange} required />
      <input name="date" type="date" value={form.date} onChange={handleChange} required />
      <input name="time" type="time" value={form.time} onChange={handleChange} required />
      <textarea name="notes" placeholder="Any notes?" value={form.notes} onChange={handleChange} />

      <button type="submit" disabled={loading}>
        {loading ? "Booking..." : "Book a Walk"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Booking submitted! We'll confirm shortly.</p>}
    </form>
  );
}