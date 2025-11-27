import { useState } from 'react'
import axios from 'axios'

export default function Login({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false) // thêm loading cho đẹp

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !displayName)) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    setLoading(true)
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

      // Thông báo thành công đẹp lung linh
      alert(
        `Chào mừng ${res.data.user.displayName || res.data.user.email}!\n` +
        `${isLogin ? 'Đăng nhập' : 'Đăng ký'} thành công 🎉`
      )

      // Không cần reload nữa vì App.jsx đã được fix load từ localStorage ngay từ đầu

    } catch (err) {
      const msg = err.response?.data?.error || 'Lỗi kết nối server. Vui lòng thử lại!'
      alert('Lỗi: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-300">
      <div className="card w-96 bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl font-bold mb-6">
            ChatPro 2025
          </h2>

          <div className="tabs tabs-boxed mb-6">
            <a
              className={`tab tab-lg ${isLogin ? 'tab-active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Đăng nhập
            </a>
            <a
              className={`tab tab-lg ${!isLogin ? 'tab-active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Đăng ký
            </a>
          </div>

          {!isLogin && (
            <input
              type="text"
              placeholder="Tên hiển thị (bắt buộc)"
              className="input input-bordered w-full mb-3"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="input input-bordered w-full mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="input input-bordered w-full mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký ngay'}
          </button>

          <div className="text-center text-sm text-base-content/70 mt-4">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <a
              className="link link-primary"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Đăng ký miễn phí' : 'Đăng nhập ngay'}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
