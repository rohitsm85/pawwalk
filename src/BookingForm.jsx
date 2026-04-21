import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useBooking } from "./hooks/useBooking";

function getTimeSlots(date) {
  if (!date) return [];
  const day = new Date(date).getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;

  const slots = [];
  const [startH, endH] = isWeekend ? [9, 18] : [17, 20];

  for (let h = startH; h < endH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

function formatDisplay(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "date" ? { time: "" } : {}), // reset time on date change
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitBooking(form);
  };

  const slots = getTimeSlots(form.date);

  if (!authReady) return (
    <div style={styles.page}>
      <div style={styles.card}><p style={{ textAlign: "center" }}>Loading...</p></div>
    </div>
  );

  if (success) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🐾 PawWalk</h2>
        <div style={styles.successBox}>
          <p style={{ fontSize: 32 }}>🐶</p>
          <p style={{ fontWeight: 600, fontSize: 18 }}>Booking Submitted!</p>
          <p style={{ color: "#555", marginTop: 8 }}>We'll confirm your walk shortly.</p>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Book Another Walk 🐾
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>🐾 PawWalk</h2>

        <input
          style={styles.input}
          name="ownerName"
          placeholder="Your Name"
          value={form.ownerName}
          onChange={handleChange}
          required
        />

        <input
          style={styles.input}
          name="dogName"
          placeholder="Dog's Name"
          value={form.dogName}
          onChange={handleChange}
          required
        />

        <input
          style={styles.input}
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          required
        />

        <select
          style={styles.input}
          name="time"
          value={form.time}
          onChange={handleChange}
          required
          disabled={!form.date}
        >
          <option value="">{form.date ? "Select Time" : "Pick a date first"}</option>
          {slots.map((t) => (
            <option key={t} value={t}>{formatDisplay(t)}</option>
          ))}
        </select>

        <textarea
          style={{ ...styles.input, resize: "vertical", height: 80 }}
          name="notes"
          placeholder="Any notes? (optional)"
          value={form.notes}
          onChange={handleChange}
        />

        {error && <p style={{ color: "#e53e3e", fontSize: 14, marginBottom: 8 }}>{error}</p>}

        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Booking..." : "Book Walk 🐾"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6b82d6 0%, #7c4dab 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: 700,
    margin: "0 0 8px",
    color: "#1a1a2e",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1.5px solid #ddd",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    color: "#333",
    background: "#fafafa",
  },
  btn: {
    width: "100%",
    padding: "13px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #6b82d6, #7c4dab)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
  },
  successBox: {
    textAlign: "center",
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
};