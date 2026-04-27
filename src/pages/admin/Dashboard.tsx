import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Inside your admin dashboard component
useEffect(() => {
  const channel = supabase
    .channel('attendance-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',          // fire when new clock-in comes in
        schema: 'hr',
        table: 'attendance'
      },
      (payload) => {
        console.log('New clock-in!', payload.new)
        // update your UI here — e.g. add the new row to your table
      }
    )
    .subscribe()

  // Cleanup when admin navigates away
  return () => {
    void supabase.removeChannel(channel)
  }
}, [])