import { useState } from 'react'
import axios from 'axios'

export default function Login({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

 const handleSubmit = async () => {
  try {
    const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    const endpoint = isLogin ? 'login' : 'register'
    const payload = isLogin 
      ? { email, password } 
      : { email, password, displayName }

    const res = await axios.post(`${url}/api/${endpoint}`, payload)

    // Lưu vào localStorage
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))

    // Cập nhật state cha (App.jsx)
    setToken(res.data.token)
    setUser(res.data.user)

    // Thông báo đẹp thay vì alert thô
    alert(`Chào mừng ${res.data.user.displayName || res.data.user.email} đã ${isLogin ? 'đăng nhập' : 'đăng ký'} thành công!`)
    
    // Nếu muốn tự động chuyển trang thì thêm dòng này cũng được:
    // window.location.href = '/'   hoặc dùng navigate nếu có react-router

  } catch (err) {
    const msg = err.response?.data?.error || 'Lỗi kết nối server'
    alert(msg)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl">ChatPro 2025</h2>
          <div className="tabs tabs-boxed my-4">
            <a className={`tab ${isLogin ? 'tab-active' : ''}`} onClick={() => setIsLogin(true)}>Đăng nhập</a>
            <a className={`tab ${!isLogin ? 'tab-active' : ''}`} onClick={() => setIsLogin(false)}>Đăng ký</a>
          </div>
          {!isLogin && (
            <input type="text" placeholder="Tên hiển thị" className="input input-bordered w-full" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          )}
          <input type="email" placeholder="Email" className="input input-bordered w-full mt-3" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Mật khẩu" className="input input-bordered w-full mt-3" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="btn btn-primary mt-5 w-full" onClick={handleSubmit}>
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </div>
      </div>
    </div>
  )
}
