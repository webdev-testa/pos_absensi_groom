import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useClockIn } from '@/hooks/useAbsensi'
import { toast } from 'sonner'
import { Camera, MapPin, Loader2, LogOut, CheckCircle2 } from 'lucide-react'

export default function EmployeeHome() {
  const [userName, setUserName] = useState('Employee')
  const [loading, setLoading] = useState(false)
  const [hasClockedIn, setHasClockedIn] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { clockIn } = useClockIn()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.name || user.email?.split('@')[0] || 'Employee')
        
        // Optional: Check if already clocked in today to update state
        const today = new Date().toISOString().split('T')[0]
        const { data } = await supabase
          .from('attendance')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle()
        
        if (data) setHasClockedIn(true)
      }
    }
    
    checkStatus()
    return () => clearInterval(timer)
  }, [])

  const handleClockIn = async () => {
    if (hasClockedIn) {
      toast.info('Already clocked in', { description: 'You have already recorded your attendance today.' })
      return
    }

    try {
      setLoading(true)
      toast.info('Acquiring location & camera...', { 
        description: 'Please allow permissions if prompted.' 
      })
      
      await clockIn()
      
      setHasClockedIn(true)
      toast.success('Success!', { 
        description: 'Your attendance has been recorded successfully.' 
      })
    } catch (error: any) {
      toast.error('Clock In Failed', { 
        description: error.message || 'Make sure you allowed camera and location access.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="relative min-h-screen bg-[#F5F2ED] text-[#1A1814] overflow-hidden font-sans selection:bg-red-600/30">
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center bg-white border-b border-[#E0DDD7] shadow-sm">
        <div>
          <p className="text-[11px] font-medium text-[#A8A49E] tracking-[1.5px] uppercase font-mono mb-1">Welcome back</p>
          <h1 className="text-[20px] font-bold text-[#1A1814] font-['Syne'] capitalize">{userName}</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F5F2ED] text-[#6B6760] hover:text-[#C84B2F] transition-all border border-[#E0DDD7] hover:border-[#e8b4aa] flex items-center gap-2 text-[13px] font-medium"
          aria-label="Logout"
        >
          <LogOut size={16} />
          Switch Role / Log Out
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-16 pb-24 px-6 min-h-[calc(100vh-80px)]">
        
        {/* Time Display */}
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-6xl sm:text-7xl font-bold font-['Syne'] tracking-tight text-[#1A1814]">
            {timeString}
          </h2>
          <p className="text-[15px] text-[#6B6760] font-medium">
            {dateString}
          </p>
        </div>

        {/* Action Area */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-sm">
          
          {/* Pulsing ring effect when idle & not clocked in */}
          {!hasClockedIn && !loading && (
            <div className="absolute inset-0 m-auto w-48 h-48 border-[2px] border-[#C84B2F]/30 rounded-full animate-ping [animation-duration:3s]" />
          )}

          {/* Main Button */}
          <button
            onClick={handleClockIn}
            disabled={loading || hasClockedIn}
            className={`
              relative z-10 flex flex-col items-center justify-center
              w-56 h-56 rounded-full shadow-lg transition-all duration-500 overflow-hidden border-none
              ${hasClockedIn 
                ? 'bg-[#E2F0E8] cursor-not-allowed text-[#2A7A4B] shadow-none border border-[#2A7A4B]/20' 
                : 'bg-[#C84B2F] hover:bg-[#b03d24] hover:scale-105 active:scale-95 shadow-[#C84B2F]/20 text-white'
              }
            `}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="animate-spin text-white" />
                <span className="font-semibold text-white tracking-wide text-[13.5px]">Memproses...</span>
              </div>
            ) : hasClockedIn ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 size={48} className="text-[#2A7A4B]" strokeWidth={2.5} />
                <span className="font-['Syne'] font-bold text-[18px] tracking-wide">Absen Berhasil</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-white">
                <Camera size={42} className="mb-1" strokeWidth={2} />
                <span className="text-[22px] font-['Syne'] font-bold tracking-wide">CLOCK IN</span>
                <span className="text-[11px] font-mono text-white/80 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  <MapPin size={12} /> Tap untuk absen
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Status Card */}
        <div className="mt-16 w-full max-w-sm">
          <div className="bg-white border border-[#E0DDD7] p-5 rounded-[16px] shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${hasClockedIn ? 'bg-[#E2F0E8] text-[#2A7A4B]' : 'bg-[#F5F2ED] text-[#6B6760]'}`}>
              {hasClockedIn ? <CheckCircle2 size={24} /> : <MapPin size={24} />}
            </div>
            <div>
              <h3 className="font-['Syne'] font-bold text-[16px] text-[#1A1814]">
                {hasClockedIn ? 'Kehadiran Tersimpan' : 'Siap Untuk Absen'}
              </h3>
              <p className="text-[13px] text-[#6B6760] mt-1.5 leading-relaxed">
                {hasClockedIn 
                  ? 'Bagus! Lokasi dan foto Anda telah berhasil disimpan di dalam sistem kami.' 
                  : 'Pastikan Anda berada di lokasi kerja sebelum menekan Clock In. Lokasi GPS dan foto wajah Anda akan diverifikasi.'}
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
