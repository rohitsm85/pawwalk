import Home from './Home'
import BookingForm from './BookingForm'
import AdminPanel from './AdminPanel'

export default function App() {
  const path = window.location.pathname

  if (path === '/admin') return <AdminPanel />
  if (path === '/book') return <BookingForm />
  return <Home />
}