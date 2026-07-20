import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { business, gradient } from "./config";

export default function AdminPanel() {
  const { admin, loading, login, logout, error } = useAdminAuth();
  const [bookings, setBookings] = useState([]);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    if (!admin) return;
    const q = query(collection(db, "walks"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [admin]);

  const updateStatus = async (id, status) => {
    setUpdateError(null);
    try {
      await updateDoc(doc(db, "walks", id), { status });
    } catch (err) {
      console.error("Failed to update booking status:", err.code, err.message);
      setUpdateError(`Couldn't update booking (${err.code || "unknown error"}).`);
    }
  };

  if (loading) return <div style={styles.page}><p style={{color:"#fff"}}>Loading...</p></div>;

  if (!admin) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <a href="/" style={styles.homeLink}>← Home</a>
        <h2 style={styles.title}>{business.emoji} {business.name} Admin</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
          Sign in with your admin Google account
        </p>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <button style={styles.googleBtn} onClick={login}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={20} />
          Sign in with Google
        </button>
      </div>
    </div>
  );

  const pending = bookings.filter(b => b.status === "pending");
  const others = bookings.filter(b => b.status !== "pending");

  return (
    <div style={styles.page}>
      <div style={{ width: "100%", maxWidth: 700, padding: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <a href="/" style={{ ...styles.homeLink, color: "rgba(255,255,255,0.75)" }}>← Home</a>
            <h2 style={{ color: "#fff", margin: 0 }}>{business.emoji} {business.name} Admin</h2>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>

        {updateError && (
          <p style={{ color: "#ffb4b4", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: 8, marginBottom: 16 }}>
            {updateError}
          </p>
        )}

        {/* Pending */}
        <h3 style={{ color: "#fff", marginBottom: 12 }}>
          Pending ({pending.length})
        </h3>
        {pending.length === 0 && (
          <p style={{ color: "#ccc", marginBottom: 24 }}>No pending bookings.</p>
        )}
        {pending.map(b => (
          <BookingCard key={b.id} booking={b} onUpdate={updateStatus} />
        ))}

        {/* Past */}
        {others.length > 0 && (
          <>
            <h3 style={{ color: "#fff", margin: "24px 0 12px" }}>Past Bookings</h3>
            {others.map(b => (
              <BookingCard key={b.id} booking={b} onUpdate={updateStatus} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking: b, onUpdate }) {
  const statusColor = {
    pending: "#f59e0b",
    approved: "#10b981",
    rejected: "#ef4444",
  }[b.status] || "#666";

  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{b.ownerName} — 🐶 {b.dogName}</p>
          {b.address && <p style={{ color: "#555", marginTop: 2 }}>📍 {b.address}</p>}
          <p style={{ color: "#555", marginTop: 4 }}>📅 {b.date} at {b.time}</p>
          {b.notes && <p style={{ color: "#777", marginTop: 4 }}>📝 {b.notes}</p>}
        </div>
        <span style={{ ...styles.badge, background: statusColor }}>
          {b.status}
        </span>
      </div>

      {b.status === "pending" && (
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button style={styles.approveBtn} onClick={() => onUpdate(b.id, "approved")}>
            ✅ Approve
          </button>
          <button style={styles.rejectBtn} onClick={() => onUpdate(b.id, "rejected")}>
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: gradient,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  homeLink: {
    display: "inline-block",
    fontSize: 13,
    color: "#888",
    textDecoration: "none",
    marginBottom: 4,
  },
  badge: {
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
  },
  approveBtn: {
    flex: 1,
    padding: "10px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  rejectBtn: {
    flex: 1,
    padding: "10px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
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
  logoutBtn: {
    padding: "8px 16px",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: 8,
    cursor: "pointer",
  },
};