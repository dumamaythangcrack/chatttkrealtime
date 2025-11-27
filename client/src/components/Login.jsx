import { useState } from 'react'
import axios from 'axios'

export default function Login({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

    } catch (err) {
      let msg = 'Lỗi không xác định, vui lòng thử lại'

      // Xử lý mọi trường hợp backend trả lỗi lồng nhau
      if (err.response?.data) {
        const data = err.response.data

        if (typeof data.error === 'string') {
          msg = data.error
        } else if (data.error?.message) {
          msg = data.error.message
        } else if (data.error?.msg) {
          msg = data.error.msg
        } else if (data.message) {
          msg = data.message
        } else if (data.msg) {
          msg = data.msg
        } else if (typeof data.error === 'object') {
          msg = JSON.stringify(data.error) // fallback cuối cùng
        }
      } else if (err.message) {
        msg = err.message
      }

      alert('Lỗi: ' + msg)
    } finally {
      setLoading(false)
    }

    setLoading(true)
    try {
      const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
      const endpoint = isLogin ? 'login' : 'register'
      const payload = isLogin
        ? { email, password }
        : { email, password, displayName }

      const res = await axios.post(`${url}/api/${endpoint}`, payload)

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      setToken(res.data.token)
      setUser(res.data.user)

      alert(`Chào mừng ${res.data.user.displayName || email}!\n${isLogin ? 'Đăng nhập' : 'Đăng ký'} thành công`)

    } catch (err) {
      let msg = 'Lỗi không xác định'
      if (err.response?.data?.error) msg = err.response.data.error
      else if (err.response?.data?.message) msg = err.response.data.message
      else if (err.message) msg = err.message

      alert('Lỗi: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  // phần return giữ nguyên như cũ (hoặc dùng bản đẹp mình gửi lần trước)
  return (
    // ... (giữ như cũ, không cần thay đổi)
    <div className="min-h-screen flex items-center justify-center bg-base-300">
      <div className="card w-96 bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-3xl font-bold mb-6">ChatPro 2025</h2>
          <div className="tabs tabs-boxed mb-6">
            <a className={`tab tab-lg ${isLogin ? 'tab-active' : ''}`} onClick={() => setIsLogin(true)}>Đăng nhập</a>
            <a className={`tab tab-lg ${!isLogin ? 'tab-active' : ''}`} onClick={() => setIsLogin(false)}>Đăng ký</a>
          </div>

          {!isLogin && (
            <input type="text" placeholder="Tên hiển thị" className="input input-bordered w-full mb-3"
              value={displayName} onChange={e => setDisplayName(e.target.value)} disabled={loading} />
          )}

          <input type="email" placeholder="Email" className="input input-bordered w-full mb-3"
            value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />

          <input type="password" placeholder="Mật khẩu" className="input input-bordered w-full mb-6"
            value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />

          <button className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký ngay'}
          </button>
        </div>
      </div>
    </div>
  )
}
