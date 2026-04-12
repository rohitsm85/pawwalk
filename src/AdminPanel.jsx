import { useState } from "react";

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>No backend yet — bookings will appear here later.</p>
    </div>
  );
}