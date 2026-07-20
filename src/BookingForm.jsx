import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useBooking } from "./hooks/useBooking";
import { useBookedSlots } from "./hooks/useBookedSlots";
import { useMyBookings } from "./hooks/useMyBookings";
import { business, gradient, gradientFlat } from "./config";

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function getTimeSlots(date) {
  if (!date) return [];
  const day = new Date(date).getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;

  const slots = [];
  const { start: startH, end: endH } = isWeekend ? business.hours.weekend : business.hours.weekday;
  const step = business.slotMinutes;

  for (let mins = startH * 60; mins < endH * 60; mins += step) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }

  // For today, drop slots that have already started.
  if (date === todayString()) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.filter((t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m > nowMinutes;
    });
  }

  return slots;
}

function formatDisplay(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

const statusLabel = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Declined",
  cancelled: "Cancelled",
};

export default function BookingForm() {
  const { user, authReady, authError, login, logout } = useAuth();
  const { submitBooking, cancelBooking, loading, error, success, cancelled } = useBooking(user);
  const myBookings = useMyBookings(user);
  const [showHistory, setShowHistory] = useState(false);

  const [form, setForm] = useState({
    ownerName: user?.displayName || "",
    dogName: "",
    email: user?.email || "",
    address: "",
    date: "",
    time: "",
    notes: "",
  });

  const takenTimes = useBookedSlots(form.date);

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

  if (authError) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <a href="/" style={styles.homeLink}>← Home</a>
        <h2 style={styles.title}>{business.emoji} {business.name}</h2>
        <p style={{ textAlign: "center", color: "#e53e3e" }}>
          Couldn't sign you in ({authError.code || "unknown error"}).
          Please refresh and try again.
        </p>
      </div>
    </div>
  );

  if (!user) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <a href="/" style={styles.homeLink}>← Home</a>
        <h2 style={styles.title}>{business.emoji} {business.name}</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 8 }}>
          Sign in with Google to book a walk and keep track of your bookings.
        </p>
        <button style={styles.googleBtn} onClick={login}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} />
          Sign in with Google
        </button>
      </div>
    </div>
  );

  if (success && cancelled) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <a href="/" style={styles.homeLink}>← Home</a>
        <h2 style={styles.title}>{business.emoji} {business.name}</h2>
        <div style={styles.successBox}>
          <p style={{ fontSize: 32 }}>👋</p>
          <p style={{ fontWeight: 600, fontSize: 18 }}>Booking Cancelled</p>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Book a Walk 🐾
          </button>
        </div>
      </div>
    </div>
  );

  if (success) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <a href="/" style={styles.homeLink}>← Home</a>
        <h2 style={styles.title}>{business.emoji} {business.name}</h2>
        <div style={styles.successBox}>
          <p style={{ fontSize: 32 }}>🐶</p>
          <p style={{ fontWeight: 600, fontSize: 18 }}>Booking Submitted!</p>
          <p style={{ color: "#555", marginTop: 8 }}>We'll confirm your walk shortly.</p>
          {business.payment && (
            <p style={styles.paymentNote}>
              💳 {business.payment.note} {business.payment.payIdPhone && `PayID: ${business.payment.payIdPhone}`}
            </p>
          )}
          {error && <p style={{ color: "#e53e3e", fontSize: 14, marginTop: 8 }}>{error}</p>}
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Book Another Walk 🐾
          </button>
          <button
            style={{ ...styles.cancelBtn, opacity: loading ? 0.7 : 1 }}
            onClick={cancelBooking}
            disabled={loading}
          >
            {loading ? "Cancelling..." : "Cancel This Booking"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topRow}>
          <a href="/" style={styles.homeLink}>← Home</a>
          <button style={styles.signOutBtn} onClick={logout}>Sign out</button>
        </div>
        <h2 style={styles.title}>{business.emoji} {business.name}</h2>

        {myBookings.length > 0 && (
          <div style={styles.historyBox}>
            <button style={styles.historyToggle} onClick={() => setShowHistory((v) => !v)}>
              {showHistory ? "Hide" : "Show"} My Bookings ({myBookings.length})
            </button>
            {showHistory && (
              <div style={styles.historyList}>
                {myBookings.map((b) => (
                  <div key={b.id} style={styles.historyItem}>
                    <span>{b.date} at {formatDisplay(b.time)} — {b.dogName}</span>
                    <span style={styles.historyStatus}>{statusLabel[b.status] || b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
          name="email"
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          style={styles.input}
          name="address"
          placeholder="Address or area (e.g. near Hornsby Park)"
          value={form.address}
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
          disabled={!form.date || slots.length === 0}
        >
          <option value="">
            {!form.date
              ? "Pick a date first"
              : slots.length === 0
                ? "No more slots today"
                : "Select Time"}
          </option>
          {slots.map((t) => (
            <option key={t} value={t} disabled={takenTimes.has(t)}>
              {formatDisplay(t)}{takenTimes.has(t) ? " (Booked)" : ""}
            </option>
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
    background: gradient,
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
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: 700,
    margin: "0 0 8px",
    color: "#1a1a2e",
  },
  homeLink: {
    display: "inline-block",
    fontSize: 13,
    color: "#888",
    textDecoration: "none",
  },
  signOutBtn: {
    fontSize: 13,
    color: "#888",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
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
    background: gradientFlat,
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
  },
  cancelBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: 8,
    border: "1.5px solid #e53e3e",
    background: "#fff",
    color: "#e53e3e",
    fontSize: 15,
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
  paymentNote: {
    fontSize: 13.5,
    color: "#555",
    background: "#f5f5f5",
    borderRadius: 8,
    padding: "10px 14px",
    marginTop: 10,
  },
  googleBtn: {
    width: "100%",
    padding: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    border: "1.5px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  },
  historyBox: {
    border: "1px solid #eee",
    borderRadius: 8,
    overflow: "hidden",
  },
  historyToggle: {
    width: "100%",
    padding: "10px 14px",
    background: "#f7f7fb",
    border: "none",
    textAlign: "left",
    fontSize: 13.5,
    fontWeight: 600,
    color: "#444",
    cursor: "pointer",
  },
  historyList: {
    maxHeight: 160,
    overflowY: "auto",
    padding: "6px 14px",
  },
  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#555",
    padding: "6px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  historyStatus: {
    fontWeight: 600,
    color: "#888",
  },
};
