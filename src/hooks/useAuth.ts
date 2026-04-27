import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async (authUserId: string) => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single()
      
      setUser(data || null)
    }

    // check current session on mount
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        await fetchProfile(data.session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const logout = () => supabase.auth.signOut()

  return { user, loading, login, logout }
}