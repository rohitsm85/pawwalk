import BookingForm from './BookingForm'
import AdminPanel from './AdminPanel'

export default function App() {
  const isAdmin = window.location.pathname === '/admin'
  return isAdmin ? <AdminPanel /> : <BookingForm />
}