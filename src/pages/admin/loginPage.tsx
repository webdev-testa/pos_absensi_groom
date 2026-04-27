import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Redirect based on role
    const role = (data.user?.user_metadata?.role || 'employee').toLowerCase()
    if (role === 'superadmin' || role === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/employee/home')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-6 font-sans selection:bg-red-600/30">
      <div className="w-full max-w-[420px] bg-white rounded-[16px] shadow-sm border border-[#E0DDD7] p-8 lg:p-10">
        
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1814] text-white font-['Syne'] font-bold text-xl mb-4 tracking-tight">
            HR
          </div>
          <h1 className="font-['Syne'] text-[24px] font-bold tracking-tight text-[#1A1814]">HadiR Login</h1>
          <p className="text-[13.5px] text-[#6B6760] mt-1.5">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] text-[#6B6760] font-medium">Email address</label>
            <input 
              type="email" 
              placeholder="nama@drmeow.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3.5 rounded-[10px] border border-[#E0DDD7] text-[13.5px] text-[#1A1814] placeholder:text-[#A8A49E] focus:outline-none focus:border-[#1A1814] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] text-[#6B6760] font-medium">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full h-10 pl-3.5 pr-10 rounded-[10px] border border-[#E0DDD7] text-[13.5px] text-[#1A1814] placeholder:text-[#A8A49E] focus:outline-none focus:border-[#1A1814] transition-colors"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A49E] hover:text-[#6B6760] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-[8px] bg-[#F5E8E4] border border-[#e8b4aa] text-[12.5px] text-[#C84B2F]">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !email || !password}
            className="w-full h-10 mt-2 bg-[#C84B2F] hover:bg-[#b03d24] text-white rounded-[10px] text-[13.5px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Log in'}
          </button>
        </form>

      </div>
    </div>
  )
}