import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user, loading: authLoading, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // if already logged in, redirect immediately
  useEffect(() => {
    if (!authLoading && user) {
      redirect()
    }
  }, [user, authLoading])

  const redirect = () => {
    const from = location.state?.from?.pathname
    if (from) {
      navigate(from, { replace: true })
      return
    }
    // POS staff (admin) lands on POS dashboard, superadmin on HR dashboard
    if (user?.role === 'admin') {
      navigate('/admin/pos', { replace: true })
    } else {
      navigate('/admin/dashboard', { replace: true })
    }
  }

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: loginError, data } = await login(email, password)
      console.log('Login result:', { error: loginError, data })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }

      // Check if the user has a profile in our public.users table
      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .schema('hr')
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (!profile || profileError) {
          setError('Your account is missing a profile or role. Please contact the administrator.')
          await logout()
          setLoading(false)
          return
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] bg-card rounded-2xl shadow-sm border border-border p-8 lg:p-10">
        
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-xl mb-4 tracking-tight shadow-xs">
            🐾
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Absen Dr. Meow</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Masuk ke portal klinik & operasional</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs text-muted-foreground font-medium block">
              Email address
            </label>
            <input 
              id="login-email"
              type="email" 
              placeholder="nama@drmeow.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-ring transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs text-muted-foreground font-medium block">
              Password
            </label>
            <div className="relative">
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} 
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-ring transition-all"
              />
              <button 
                type="button"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !email || !password}
            className="w-full h-11 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Masuk'}
          </button>
        </form>

      </div>
    </div>
  )
}