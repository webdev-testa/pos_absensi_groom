import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface RoleGuardProps {
  allowedRoles: string[]
  fallbackPath: string
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setIsAllowed(false)
        return
      }
      // Normalize role to lowercase to prevent case-sensitive mismatch loops
      const role = (user.user_metadata?.role || 'employee').toLowerCase()
      if (allowedRoles.includes(role)) {
        setIsAllowed(true)
      } else {
        setIsAllowed(false)
      }
    })
  }, [allowedRoles])

  if (isAllowed === null) {
    return <div className="flex h-screen items-center justify-center font-mono text-sm text-[#A8A49E]">Checking permissions...</div>
  }

  if (!isAllowed) {
    // If not allowed, we don't redirect to fallbackPath anymore because it might cause an infinite loop if the other route also rejects.
    // Instead we redirect to login to force a re-authentication or show an error.
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
