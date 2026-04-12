import { useState } from "react";

const timeSlots = [
  "08:00 AM","08:30 AM","09:00 AM","09:30 AM",
  "10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "04:00 PM","04:30 PM","05:00 PM","05:30 PM"
];

export default function BookingForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookings, setBookings] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !date || !time) {
      alert("Fill all fields");
      return;
    }

    const exists = bookings.find(
      (b) => b.date === date && b.time === time
    );

    if (exists) {
      alert("Slot already booked!");
      return;
    }

    const newBooking = { name, date, time };
    setBookings([...bookings, newBooking]);

    alert(`Booked ${date} at ${time}`);

    setName("");
    setDate("");
    setTime("");
  };

  const isBooked = (slot) => {
    return bookings.some(
      (b) => b.date === date && b.time === slot
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to right, #667eea, #764ba2)",
      fontFamily: "Arial"
    }}>
      <div style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        width: "320px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ textAlign: "center" }}>🐶 PawWalk</h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
          >
            <option value="">Select Time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot} disabled={isBooked(slot)}>
                {slot} {isBooked(slot) ? "(Booked)" : ""}
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#667eea",
              color: "#fff",
              border: "none",
              borderRadius: "8px"
            }}
          >
            Book Walk 🐾
          </button>
        </form>
      </div>
    </div>
  );
}