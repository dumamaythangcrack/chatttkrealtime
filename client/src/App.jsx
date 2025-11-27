import { useState, useEffect } from 'react'
import Login from './components/Login'
import ChatInterface from './components/ChatInterface'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      const u = localStorage.getItem('user')
      if (u) setUser(JSON.parse(u))
    }
  }, [token])

  if (!token || !user) return <Login setToken={setToken} setUser={setUser} />
  return <ChatInterface user={user} token={token} setToken={setToken} />
}