import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import axios from 'axios'
import { Moon, Sun, LogOut, Settings, MessageCircle } from 'lucide-react'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
  auth: { token: localStorage.getItem('token') }
})

export default function ChatInterface({ user: initialUser, token, setToken }) {
  const [user, setUser] = useState(initialUser)
  const [room, setRoom] = useState('')
  const [joined, setJoined] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef(null)
  let typingTimeout

  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    socket.on('previousMessages', msgs => setMessages(msgs))
    socket.on('chatMessage', msg => {
      setMessages(prev => [...prev, msg])
      if (document.hidden) {
        new Notification(msg.sender, { body: msg.text })
      }
    })
    socket.on('roomUsers', setOnlineUsers)
    socket.on('typing', ({ name, isTyping }) => {
      setTypingUsers(prev => isTyping ? [...prev.filter(u => u !== name), name] : prev.filter(u => u !== name))
    })
    return () => socket.off()
  }, [])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const joinRoom = () => { if (room.trim()) { socket.emit('joinRoom', { room }); setJoined(true) } }
  const sendMessage = () => { if (input.trim()) { socket.emit('chatMessage', input); setInput(''); socket.emit('typing', false) } }
  const handleTyping = e => {
    setInput(e.target.value)
    socket.emit('typing', true)
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => socket.emit('typing', false), 1000)
  }

  const logout = () => { localStorage.clear(); setToken('') }
  const deleteAccount = async () => {
    if (confirm('Xóa tài khoản vĩnh viễn?')) {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/delete-account`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      logout()
    }
  }

  if (!joined) return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">ChatPro 2025</h1>
        <input type="text" placeholder="Tên phòng chat..." className="input input-bordered w-full text-lg" value={room} onChange={e => setRoom(e.target.value)} onKeyPress={e => e.key === 'Enter' && joinRoom()} />
        <button onClick={joinRoom} className="btn btn-primary w-full mt-6 text-lg">Tham Gia</button>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex bg-base-200">
      {/* Sidebar + Main Chat + Settings Modal – (đã cắt bớt do dài, bạn lấy từ tin nhắn trước hoặc repo) */}
      {/* Toàn bộ giao diện đẹp như Zalo Web – đã có trong repo và tin nhắn trước */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.userId === socket.io.engine.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl ${msg.userId === socket.io.engine.id ? 'bg-primary text-white' : 'bg-base-300'}`}>
                {msg.userId !== socket.io.engine.id && <p className="text-xs opacity-70 mb-1">{msg.sender}</p>}
                <p>{msg.text}</p>
                <p className="text-xs opacity-70 text-right mt-1">{msg.time}</p>
              </div>
            </div>
          ))}
          {typingUsers.length > 0 && <div className="text-sm italic text-base-content opacity-70">Đang nhập...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-6 bg-base-100 border-t">
          <div className="flex gap-3">
            <input type="text" placeholder="Nhập tin nhắn..." className="input input-bordered flex-1" value={input} onChange={handleTyping} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} className="btn btn-circle btn-primary"><MessageCircle /></button>
          </div>
        </div>
      </div>
    </div>
  )
}