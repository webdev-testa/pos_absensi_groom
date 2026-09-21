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

    const getCachedProfile = (authUserId: string): User | null => {
      const cached = localStorage.getItem(`profile_${authUserId}`)
      if (!cached) return null
      try {
        return JSON.parse(cached)
      } catch {
        return null
      }
    }

    const fetchProfile = async (authUserId: string) => {
      try {
        const { data, error } = await supabase
          .schema('hr')
          .from('users')
          .select('*')
          .eq('id', authUserId)
          .single()

        if (!error && data) {
          localStorage.setItem(`profile_${authUserId}`, JSON.stringify(data))
          if (mounted) setUser(data as User)
          return data
        }
      } catch (err) {
        console.error('Fetch profile error:', err)
      }

      const cached = getCachedProfile(authUserId)
      if (mounted) setUser(cached)
      return cached
    }

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session?.user) {
          const cached = getCachedProfile(data.session.user.id)
          if (cached) {
            setUser(cached)
          }
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
      (event, session) => {
        if (event === 'INITIAL_SESSION') return
        if (session?.user) {
          fetchProfile(session.user.id).catch((err) => {
            console.error('onAuthStateChange profile fetch failed:', err)
          })
        } else {
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