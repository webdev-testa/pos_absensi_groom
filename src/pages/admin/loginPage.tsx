import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
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
    const role = data.user?.user_metadata?.role
    if (role === 'superadmin' || role === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/employee/home')
    }
  }

  return (
    <div>
      <input 
        type="email" 
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {error && <p>{error}</p>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  )
}