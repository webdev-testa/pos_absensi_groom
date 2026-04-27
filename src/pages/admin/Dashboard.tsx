import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
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
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Listening for real-time attendance changes...</p>
    </div>
  )
}