import { useEffect, useState } from 'react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Optional: Define a TypeScript interface for your attendance record
interface AttendanceRecord {
  id: string;
  user_id: string;
  clock_in_time: string;
  status: string;
}

export default function AdminDashboard() {
  // 1. Set up the React State to hold our list of records
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([])

  // 2. Fetch the existing attendance records when the page first loads
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('attendance')
        .select('*')
        .order('clock_in_time', { ascending: false }) // Newest first
        .limit(50) // Just grab the last 50 to start
      
      if (!error && data) {
        setAttendanceList(data)
      }
    }

    fetchInitialData()
  }, [])

  // 3. Listen for REAL-TIME changes to update the state
  useEffect(() => {
    const channel = supabaseAdmin
      .channel('attendance-live')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'hr', 
          table: 'attendance' 
        },
        (payload) => {
          console.log('New clock-in received:', payload.new)
          
          // Update the UI by pushing the new record to the very top of the list
          setAttendanceList((prev) => [payload.new as AttendanceRecord, ...prev])
        }
      )
      .subscribe()

    // Cleanup the subscription when the user leaves the page
    return () => {
      supabaseAdmin.removeChannel(channel)
    }
  }, [])

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A1814]">Admin Dashboard</h1>
        <p className="text-[13.5px] text-[#6B6760] mt-1.5">Listening for real-time attendance changes...</p>
      </div>

      {/* 4. Render the data to the screen */}
      <div className="overflow-x-auto bg-white rounded-[16px] shadow-sm border border-[#E0DDD7]">
        <table className="min-w-full table-auto">
          <thead className="bg-[#EDEAE4]">
            <tr>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase">User ID</th>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase">Clock In Time</th>
              <th className="px-6 py-3 text-left font-mono text-[10.5px] text-[#A8A49E] font-normal tracking-[0.8px] uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0DDD7]">
            {attendanceList.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-[#A8A49E]">
                  No attendance records yet today.
                </td>
              </tr>
            ) : (
              attendanceList.map((record, index) => (
                <tr key={record.id || index} className="hover:bg-[#FAFAF8] transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm font-medium text-[#1A1814]">{record.user_id}</td>
                  <td className="px-6 py-4 text-sm text-[#6B6760]">
                    {new Date(record.clock_in_time).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-medium ${
                      record.status === 'ontime' ? 'bg-[#E2F0E8] text-[#2A7A4B]' : 'bg-[#F5E8E4] text-[#C84B2F]'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}