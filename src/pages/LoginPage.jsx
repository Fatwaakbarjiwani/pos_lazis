import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, getMe } from '../redux/actions/authActions'

function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    emailOrPhoneNumber: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(
      loginUser(formData.emailOrPhoneNumber, formData.password)
    )
    if (result?.success) {
      await dispatch(getMe())
      navigate('/home')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Panel - Login Form */}
        <div className="flex-1 p-8 md:p-10 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-slate-600 text-sm font-medium tracking-widest mb-1">WELCOME TO</p>
              <h1 className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                POS LAZIS
              </h1>
              <p className="text-slate-500 text-sm">
                Log in to get in the moment updates on the things that interest you
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="text"
                  name="emailOrPhoneNumber"
                  placeholder="Email atau Nomor Telepon"
                  value={formData.emailOrPhoneNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                  required
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-linear-to-t from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 active:scale-[0.98] transition shadow-lg shadow-green-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'SIGN IN'}
              </button>
            </form>

            <p className="text-center text-slate-600 text-sm mt-6">
              Don&apos;t have an account?{' '}
              <a href="#" className="text-green-600 font-semibold hover:underline">
                Sign Up Now
              </a>
            </p>
          </div>
        </div>

        {/* Right Panel - Branding */}
        <div className="relative flex-1 min-h-[280px] lg:min-h-[600px] bg-linear-to-br from-green-600 via-green-500 to-emerald-600 order-1 lg:order-2">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-linear-to-b from-green-900/40 via-green-800/35 to-emerald-900/50" />
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">POS LAZIS</h2>
            <p className="text-white/90 text-sm md:text-base max-w-xs">
              Sistem Point of Sale untuk Lembaga Amil Zakat. Kelola transaksi dan laporan dengan mudah dan efisien.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
