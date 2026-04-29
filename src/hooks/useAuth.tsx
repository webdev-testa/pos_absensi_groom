import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => ReturnType<typeof supabase.auth.signInWithPassword>
  logout: () => ReturnType<typeof supabase.auth.signOut>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (authUserId: string) => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        )
        
        const fetchPromise = supabase
          .from('users')
          .select('*')
          .eq('id', authUserId)
          .single()

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any
        
        if (error) {
           console.error('Fetch profile query error:', error)
        }
        if (mounted) setUser(data || null)
        return data
      } catch (err) {
        console.error('Fetch profile exception:', err)
        if (mounted) setUser(null)
        return null
      }
    }

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user) {
          await fetchProfile(data.session.user.id)
        } else {
          if (mounted) setUser(null)
        }
      } catch (err) {
        console.error('Init session error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return
        try {
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            if (mounted) setUser(null)
          }
        } catch (err) {
          console.error('onAuthStateChange exception:', err)
          if (mounted) setUser(null)
        }
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const logout = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}