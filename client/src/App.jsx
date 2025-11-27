import { useState, useEffect } from 'react'
import Login from './components/Login'
import ChatInterface from './components/ChatInterface'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)

  // Load user ngay khi app khởi động (quan trọng nhất!)
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        // Nếu parse lỗi thì xóa luôn cho sạch
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  // Nếu chưa có token hoặc user → hiện Login
  if (!token || !user) {
    return <Login setToken={setToken} setUser={setUser} />
  }

  // Đã login → vào thẳng trang chat
  return <ChatInterface user={user} token={token} setToken={setToken} />
}
