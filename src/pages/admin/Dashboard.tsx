import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronRight, Loader2 } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { AdminLayout, initials } from '@/components/layout/AdminLayout'
import { fmtCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

export default function Dashboard() {
  // 1. Live Time Update
  const [liveTime, setLiveTime] = useState(() => 
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // 2. Current Date/Period Info
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }, [])

  const currentMonth = useMemo(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const period = `${year}-${month}`
    const monthStart = `${period}-01`
    
    const nextYear = d.getMonth() === 11 ? year + 1 : year
    const nextMonth = d.getMonth() === 11 ? 1 : d.getMonth() + 2
    const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
    
    return { period, monthStart, monthEnd }
  }, [])

  const getTodayStr = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  /* ─── FETCH DATABASES QUERIES ─── */

  // 1. Fetch all employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['dashboard_employees'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('users')
        .select('*')
        .eq('role', 'employee')
      if (error) {
        toast.error('Gagal memuat data karyawan')
        throw error
      }
      return data || []
    }
  })

  // 2. Fetch today's attendance logs
  const { data: attendanceToday = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['dashboard_attendance_today'],
    queryFn: async () => {
      const todayStr = getTodayStr()
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('attendance')
        .select(`
          *,
          users:user_id (
            name,
            emp_id,
            dept
          )
        `)
        .eq('date', todayStr)
      if (error) {
        toast.error('Gagal memuat data absensi hari ini')
        throw error
      }
      return data || []
    }
  })

  // 3. Fetch kasbons for this month
  const { data: kasbonMonth = [], isLoading: loadingKasbon } = useQuery({
    queryKey: ['dashboard_kasbon_month'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .select(`
          *,
          users:user_id (
            name,
            emp_id
          )
        `)
        .gte('requested_at', currentMonth.monthStart)
        .lt('requested_at', currentMonth.monthEnd)
        .neq('status', 'rejected')
      if (error) {
        toast.error('Gagal memuat data kasbon bulan ini')
        throw error
      }
      return data || []
    }
  })

  // 4. Fetch payroll for this month
  const { data: payrollMonth = [], isLoading: loadingPayroll } = useQuery({
    queryKey: ['dashboard_payroll_month'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .select('*')
        .eq('period', currentMonth.period)
      if (error) {
        toast.error('Gagal memuat data payroll')
        throw error
      }
      return data || []
    }
  })

  // 5. Fetch pending cuti requests
  const { data: pendingCuti = [], isLoading: loadingCuti } = useQuery({
    queryKey: ['dashboard_pending_cuti'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('attendance')
        .select('*, users:user_id(name)')
        .like('status', '%_pending')
      if (error) throw error
      return data || []
    }
  })

  // 6. Fetch unpaid past kasbons (approved status but requested in previous months)
  const { data: unpaidPastKasbon = [], isLoading: loadingPastKasbon } = useQuery({
    queryKey: ['dashboard_unpaid_past_kasbon'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .select(`
          *,
          users:user_id (
            name
          )
        `)
        .eq('status', 'approved')
        .lt('requested_at', currentMonth.monthStart)
      if (error) throw error
      return data || []
    }
  })

  // 7. Fetch monthly attendance metrics (for progress bars)
  const { data: attendanceMonth = [], isLoading: loadingAttendanceMonth } = useQuery({
    queryKey: ['dashboard_attendance_month'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('attendance')
        .select('user_id, status, date')
        .gte('date', currentMonth.monthStart)
        .lt('date', currentMonth.monthEnd)
      if (error) throw error
      return data || []
    }
  })

  /* ─── DYNAMIC STATISTICS COMPILATION ─── */

  // Active employees count
  const activeEmployeesCount = useMemo(() => {
    return employees.filter(e => e.status === 'active').length
  }, [employees])

  // Attendance metrics today
  const attendanceTodayStats = useMemo(() => {
    const presentToday = attendanceToday.filter(a => a.status === 'ontime' || a.status === 'late')
    const countPresent = presentToday.length
    const countOntime = presentToday.filter(a => a.status === 'ontime').length
    const countLate = presentToday.filter(a => a.status === 'late').length
    const countOut = presentToday.filter(a => a.clock_out_time !== null).length
    
    // Absent active employees today: active employees who have no attendance row today
    const countAbsent = employees.filter(e => 
      e.status === 'active' && !attendanceToday.some(a => a.user_id === e.id)
    ).length

    return {
      countPresent,
      countOntime,
      countLate,
      countOut,
      countAbsent
    }
  }, [attendanceToday, employees])

  // Kasbon metrics
  const kasbonStats = useMemo(() => {
    const totalKasbonAmt = kasbonMonth.reduce((sum, k) => sum + Number(k.amount), 0)
    const countTransactions = kasbonMonth.length
    
    const unpaidKasbonAmt = kasbonMonth
      .filter(k => k.status === 'approved' || k.status === 'pending')
      .reduce((sum, k) => sum + Number(k.amount), 0)

    const deductedKasbonAmt = kasbonMonth
      .filter(k => k.status === 'deducted')
      .reduce((sum, k) => sum + Number(k.amount), 0)

    return {
      totalKasbonAmt,
      countTransactions,
      unpaidKasbonAmt,
      deductedKasbonAmt
    }
  }, [kasbonMonth])

  // Payroll metrics
  const payrollStats = useMemo(() => {
    const totalPayrollPaid = payrollMonth.reduce((sum, p) => sum + Number(p.net_salary), 0)
    const countPaidSlips = payrollMonth.filter(p => p.status === 'paid').length
    
    // Estimate total active payroll if not generated yet
    const activeEmployees = employees.filter(e => e.status === 'active')
    const estimatedSalary = activeEmployees.reduce((sum, e) => sum + Number(e.salary || 0), 0) - kasbonStats.unpaidKasbonAmt
    
    const isGenerated = payrollMonth.length > 0
    const allPaid = isGenerated && payrollMonth.every(p => p.status === 'paid')

    return {
      totalPayrollPaid,
      countPaidSlips,
      estimatedSalary,
      isGenerated,
      allPaid
    }
  }, [payrollMonth, employees, kasbonStats])

  // Past unpaid kasbons alert data
  const pastKasbonAlert = useMemo(() => {
    const pastCount = unpaidPastKasbon.length
    const pastTotal = unpaidPastKasbon.reduce((sum, k) => sum + Number(k.amount), 0)
    const uniqueNames = unpaidPastKasbon
      .map(k => k.users?.name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3)
      .join(', ')

    return {
      pastCount,
      pastTotal,
      uniqueNames
    }
  }, [unpaidPastKasbon])

  // Monthly Attendance Metrics (for progress bars)
  const monthlyMetrics = useMemo(() => {
    const totalActive = activeEmployeesCount || 1
    
    // Count unique workdays that have elapsed in this month
    const elapsedWorkdays = new Set(attendanceMonth.map(a => a.date)).size || 1
    const totalPossibleAttendances = elapsedWorkdays * totalActive
    
    const presentMonthCount = attendanceMonth.filter(a => a.status === 'ontime' || a.status === 'late').length
    const monthlyAttendancePct = Math.round((presentMonthCount / totalPossibleAttendances) * 100) || 0
    
    const ontimeCount = attendanceMonth.filter(a => a.status === 'ontime').length
    const monthlyOntimePct = Math.round((ontimeCount / (presentMonthCount || 1)) * 100) || 0
    
    const lateCount = attendanceMonth.filter(a => a.status === 'late').length
    const monthlyLatePct = Math.round((lateCount / (presentMonthCount || 1)) * 100) || 0

    return {
      monthlyAttendancePct: Math.min(monthlyAttendancePct, 100),
      monthlyOntimePct: Math.min(monthlyOntimePct, 100),
      monthlyLatePct: Math.min(monthlyLatePct, 100)
    }
  }, [attendanceMonth, activeEmployeesCount])

  // Attention Items Feed
  const attentionItems = useMemo(() => {
    const items: any[] = []
    
    // 1. Pending Kasbon requests
    kasbonMonth.filter(k => k.status === 'pending').forEach(k => {
      items.push({
        name: k.users?.name || 'Karyawan',
        reason: `Pengajuan kasbon ${fmtCurrency(k.amount)}`,
        badge: 'Kasbon pending',
        type: 'blue',
        link: '/admin/kasbon'
      })
    })

    // 2. Pending Cuti requests
    pendingCuti.forEach(c => {
      const typeLabel = c.status.replace('_pending', '').toUpperCase()
      items.push({
        name: c.users?.name || 'Karyawan',
        reason: `Pengajuan ${typeLabel} tanggal ${new Date(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`,
        badge: 'Cuti pending',
        type: 'purple',
        link: '/admin/absensi'
      })
    })

    // 3. Flagged attendance entries today
    attendanceToday.filter(a => a.is_flagged).forEach(a => {
      items.push({
        name: a.users?.name || 'Karyawan',
        reason: 'Lokasi absen masuk di luar area geofence',
        badge: 'Lokasi anomali',
        type: 'amber',
        link: '/admin/absensi'
      })
    })

    // 4. Inactive/Absent active employees today
    employees.filter(e => 
      e.status === 'active' && !attendanceToday.some(a => a.user_id === e.id)
    ).forEach(e => {
      items.push({
        name: e.name,
        reason: 'Belum absen hari ini',
        badge: 'Tidak hadir',
        type: 'red',
        link: '/admin/absensi'
      })
    })

    return items.slice(0, 5) // cap at 5 items
  }, [kasbonMonth, pendingCuti, attendanceToday, employees])

  // Today's unified Activity Feed (combined clock-in, clock-out, kasbon requests)
  const activities = useMemo(() => {
    const events: any[] = []
    const todayStr = getTodayStr()

    // 1. Process attendance today
    attendanceToday.forEach(att => {
      const name = att.users?.name || 'Karyawan'
      
      if (att.clock_in_time) {
        const dateObj = new Date(att.clock_in_time)
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        const isLate = att.status === 'late'
        events.push({
          icon: '📍',
          label: (
            <>
              <strong className="font-medium text-[#1A1814]">{name}</strong> clock-in {isLate && 'terlambat'}
            </>
          ),
          time: timeStr,
          color: isLate ? '#F5EDE0' : '#E2F0E8', // Amber vs Green
          rawTime: dateObj.getTime()
        })
      }

      if (att.clock_out_time) {
        const dateObj = new Date(att.clock_out_time)
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        events.push({
          icon: '📍',
          label: (
            <>
              <strong className="font-medium text-[#1A1814]">{name}</strong> clock-out
            </>
          ),
          time: timeStr,
          color: '#EDEAE4', // Gray
          rawTime: dateObj.getTime()
        })
      }
    })

    // 2. Process kasbons today
    kasbonMonth.forEach(k => {
      if (k.requested_at && k.requested_at.startsWith(todayStr)) {
        const dateObj = new Date(k.requested_at)
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        events.push({
          icon: '💰',
          label: (
            <>
              <strong className="font-medium text-[#1A1814]">{k.users?.name || 'Karyawan'}</strong> ajukan kasbon {fmtCurrency(k.amount)}
            </>
          ),
          time: timeStr,
          color: '#F5E8E4', // Soft red
          rawTime: dateObj.getTime()
        })
      }
    })

    // Sort by timestamp descending
    return events.sort((a, b) => b.rawTime - a.rawTime).slice(0, 6)
  }, [attendanceToday, kasbonMonth])

  if (
    loadingEmployees || 
    loadingAttendance || 
    loadingKasbon || 
    loadingPayroll || 
    loadingCuti || 
    loadingPastKasbon || 
    loadingAttendanceMonth
  ) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[500px] bg-[#F5F2ED] -m-10 lg:-m-12 p-10 lg:p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#C84B2F]" />
        </div>
      </AdminLayout>
    )
  }

  // Calculate chart stroke-dasharrays based on totalActive
  const totalActive = activeEmployeesCount || 1
  const dashPresent = (attendanceTodayStats.countPresent / totalActive) * 251
  const dashAbsent = (attendanceTodayStats.countAbsent / totalActive) * 251
  
  // Color configuration helper
  const avColors = [
    { bg: '#F5E8E4', fg: '#C84B2F' }, { bg: '#E2F0E8', fg: '#2A7A4B' }, { bg: '#F5EDE0', fg: '#B87333' },
    { bg: '#EDE8F5', fg: '#6B4F9E' }, { bg: '#E0EDF5', fg: '#1A6FAA' }, { bg: '#F5E8ED', fg: '#A0374F' },
  ]

  return (
    <AdminLayout>
      <div className="font-sans text-[#1A1814] -m-10 lg:-m-12 p-10 lg:p-12 min-h-[calc(100vh-1px)]" style={{ backgroundColor: '#F5F2ED' }}>
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.4px]">
              Selamat pagi, <span className="text-[#C84B2F]">Fara</span> 👋
            </div>
            <div className="text-[13.5px] text-[#6B6760] mt-1.5">
              Ini ringkasan bisnis kamu hari ini — {todayLabel}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#E0DDD7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#6B6760]">
            <div className="w-2 h-2 rounded-full bg-[#2A7A4B] shrink-0 animate-pulse"></div>
            <span>Live update · <strong className="text-[#1A1814] font-semibold">{liveTime}</strong></span>
          </div>
        </div>

        {/* ALERT BANNER */}
        {pastKasbonAlert.pastCount > 0 && (
          <Link to="/admin/kasbon" className="flex items-center gap-3 bg-[#F5EDE0] border border-[#e8c99a] rounded-[16px] px-5 py-3.5 mb-7 hover:border-[#B87333] transition-all group">
            <div className="w-8 h-8 rounded-full bg-[#B87333] flex items-center justify-center shrink-0 text-white font-bold text-[15px]">!</div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold text-[#B87333]">{pastKasbonAlert.pastCount} kasbon belum dipotong dari bulan lalu</div>
              <div className="text-[12.5px] text-[#8a5c1a] mt-0.5">
                {pastKasbonAlert.uniqueNames} · Total {fmtCurrency(pastKasbonAlert.pastTotal)} — akan otomatis dipotong saat payroll
              </div>
            </div>
            <ChevronRight className="text-[#B87333] w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <Link to="/admin/absensi" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Hadir hari ini</div>
            <div className="font-['Syne'] text-[34px] font-bold tracking-[-1.5px] leading-none text-[#2A7A4B]">
              {attendanceTodayStats.countPresent}
            </div>
            <div className="text-[12.5px] text-[#A8A49E] mt-2">dari {activeEmployeesCount} karyawan</div>
            {attendanceTodayStats.countAbsent > 0 ? (
              <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">
                {attendanceTodayStats.countAbsent} belum absen
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">
                Semua hadir
              </div>
            )}
          </Link>

          <Link to="/admin/kasbon" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Kasbon bulan ini</div>
            <div className="font-['Syne'] text-[34px] font-bold tracking-[-1.5px] leading-none text-[#C84B2F]">
              {fmtCurrency(kasbonStats.totalKasbonAmt)}
            </div>
            <div className="text-[12.5px] text-[#A8A49E] mt-2">{kasbonStats.countTransactions} transaksi</div>
            {kasbonStats.unpaidKasbonAmt > 0 ? (
              <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">
                {fmtCurrency(kasbonStats.unpaidKasbonAmt)} belum dipotong
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">
                Semua terpotong
              </div>
            )}
          </Link>

          <Link to="/admin/payroll" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Gaji dibayarkan</div>
            <div className="font-['Syne'] text-[34px] font-bold tracking-[-1.5px] leading-none text-[#1A1814]">
              {payrollStats.isGenerated ? fmtCurrency(payrollStats.totalPayrollPaid) : fmtCurrency(payrollStats.estimatedSalary)}
            </div>
            <div className="text-[12.5px] text-[#A8A49E] mt-2">estimasi bulan ini</div>
            {!payrollStats.isGenerated ? (
              <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">
                Payroll belum digenerate
              </div>
            ) : payrollStats.allPaid ? (
              <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">
                Payroll selesai (Paid)
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#F5EDE0] text-[#B87333]">
                Payroll Draft
              </div>
            )}
          </Link>

          <Link to="/admin/karyawan" className="bg-white border border-[#E0DDD7] rounded-[16px] p-5 hover:border-[#CBC8C2] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all relative group overflow-hidden block">
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBC8C2] w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:right-3 transition-all" />
            <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Total karyawan</div>
            <div className="font-['Syne'] text-[34px] font-bold tracking-[-1.5px] leading-none text-[#1A1814]">
              {activeEmployeesCount}
            </div>
            <div className="text-[12.5px] text-[#A8A49E] mt-2">aktif bulan ini</div>
            <div className="inline-flex items-center gap-1 text-[11px] px-2 py-[3px] rounded-full mt-2.5 font-medium bg-[#E2F0E8] text-[#2A7A4B]">
              Semua terdaftar
            </div>
          </Link>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* KEHADIRAN HARI INI */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Kehadiran hari ini</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">{todayLabel}</div>
              </div>
              <Link to="/admin/absensi" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Detail →</Link>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-6 mb-5">
                <div className="relative w-[100px] h-[100px] shrink-0">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#EDEAE4" strokeWidth="10"/>
                    {/* Circle charts displaying present vs absent */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#2A7A4B" strokeWidth="10" strokeDasharray={`${dashPresent} 251`} strokeLinecap="round"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#C84B2F" strokeWidth="10" strokeDasharray={`${dashAbsent} 251`} strokeDashoffset={`-${dashPresent}`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-['Syne'] text-[24px] font-bold leading-none">{attendanceTodayStats.countPresent}</div>
                    <div className="text-[10px] text-[#A8A49E] uppercase tracking-[0.5px] font-mono mt-1">hadir</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#2A7A4B]"></div>Tepat waktu</div>
                    <div className="font-mono text-[13px] font-medium">{attendanceTodayStats.countOntime}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#B87333]"></div>Terlambat</div>
                    <div className="font-mono text-[13px] font-medium">{attendanceTodayStats.countLate}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#C84B2F]"></div>Tidak hadir</div>
                    <div className="font-mono text-[13px] font-medium">{attendanceTodayStats.countAbsent}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]"><div className="w-2 h-2 rounded-full shrink-0 bg-[#A8A49E]"></div>Sudah pulang</div>
                    <div className="font-mono text-[13px] font-medium">{attendanceTodayStats.countOut}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="text-[12px] text-[#6B6760] w-[110px]">Kehadiran bulan ini</div>
                  <Progress 
                    value={monthlyMetrics.monthlyAttendancePct} 
                    indicatorClassName="bg-[#2A7A4B]"
                    className="flex-1 h-1.5 rounded-[3px]"
                  />
                  <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">{monthlyMetrics.monthlyAttendancePct}%</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-[12px] text-[#6B6760] w-[110px]">Tepat waktu</div>
                  <Progress 
                    value={monthlyMetrics.monthlyOntimePct} 
                    indicatorClassName="bg-[#1A6FAA]"
                    className="flex-1 h-1.5 rounded-[3px]"
                  />
                  <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">{monthlyMetrics.monthlyOntimePct}%</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-[12px] text-[#6B6760] w-[110px]">Keterlambatan</div>
                  <Progress 
                    value={monthlyMetrics.monthlyLatePct} 
                    indicatorClassName="bg-[#B87333]"
                    className="flex-1 h-1.5 rounded-[3px]"
                  />
                  <div className="font-mono text-[11.5px] text-[#A8A49E] w-[30px] text-right">{monthlyMetrics.monthlyLatePct}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* PERLU PERHATIAN */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Perlu perhatian</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">Anomali & tindakan yang tertunda</div>
              </div>
              <Link to="/admin/karyawan" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Lihat semua →</Link>
            </div>
            <div className="py-1.5">
              {attentionItems.length === 0 ? (
                <div className="text-center py-12 text-[#A8A49E] text-[13px]">
                  Semua aman. Tidak ada tindakan tertunda hari ini!
                </div>
              ) : (
                attentionItems.map((a, i) => {
                  const c = avColors[i % avColors.length]
                  const badgeBg = a.type === 'red' ? '#F5E8E4' : a.type === 'amber' ? '#F5EDE0' : a.type === 'purple' ? '#EDE8F5' : '#E0EDF5'
                  const badgeFg = a.type === 'red' ? '#C84B2F' : a.type === 'amber' ? '#B87333' : a.type === 'purple' ? '#6B4F9E' : '#1A6FAA'
                  return (
                    <Link to={a.link} key={i} className="flex items-center gap-3 px-5 py-[11px] border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] transition-colors cursor-pointer block">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-bold font-['Syne'] shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                          {initials(a.name)}
                        </div>
                        <div className="flex-1">
                          <div className="text-[13.5px] font-medium text-[#1A1814]">{a.name}</div>
                          <div className="text-[12px] text-[#A8A49E] mt-px">{a.reason}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11px] font-medium whitespace-nowrap" style={{ backgroundColor: badgeBg, color: badgeFg }}>
                            {a.badge}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* KASBON CARD */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Kasbon Bulan Ini</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">Pengambilan bulan ini</div>
              </div>
              <Link to="/admin/kasbon" className="text-[12.5px] text-[#1A6FAA] hover:underline whitespace-nowrap">Log →</Link>
            </div>
            <div className="p-5">
              <div className="flex items-baseline gap-1.5 mb-1.5">
                <div className="font-['Syne'] text-[32px] font-bold tracking-[-1px] text-[#C84B2F]">
                  {fmtCurrency(kasbonStats.totalKasbonAmt)}
                </div>
                <div className="text-[13px] text-[#A8A49E]">total</div>
              </div>
              <div className="text-[12.5px] text-[#6B6760] mb-4">{kasbonStats.countTransactions} pengambilan aktif</div>
              <Progress 
                value={kasbonStats.totalKasbonAmt > 0 ? Math.round((kasbonStats.unpaidKasbonAmt / kasbonStats.totalKasbonAmt) * 100) : 0} 
                indicatorClassName="bg-gradient-to-r from-[#C84B2F] to-[#e06040]"
                className="h-2 rounded-[4px] mb-4"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F5F2ED] rounded-[10px] p-3">
                  <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.7px] font-mono mb-1">Belum dipotong</div>
                  <div className="font-['Syne'] text-[18px] font-bold tracking-[-0.5px] text-[#C84B2F]">{fmtCurrency(kasbonStats.unpaidKasbonAmt)}</div>
                </div>
                <div className="bg-[#F5F2ED] rounded-[10px] p-3">
                  <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.7px] font-mono mb-1">Sudah dipotong</div>
                  <div className="font-['Syne'] text-[18px] font-bold tracking-[-0.5px] text-[#2A7A4B]">{fmtCurrency(kasbonStats.deductedKasbonAmt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYROLL STATUS CARD */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Status payroll</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">{currentMonth.period} · Akhir Bulan</div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11px] font-medium whitespace-nowrap ${
                payrollStats.isGenerated 
                  ? payrollStats.allPaid 
                    ? 'bg-[#E2F0E8] text-[#2A7A4B]' 
                    : 'bg-[#F5EDE0] text-[#B87333]'
                  : 'bg-[#EDEAE4] text-[#A8A49E]'
              }`}>
                {payrollStats.isGenerated ? payrollStats.allPaid ? 'Paid' : 'Draft' : 'Belum Dibuat'}
              </span>
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-[#E2F0E8] text-[#2A7A4B]">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div className="text-[13px] text-[#6B6760] line-through">Data absensi lengkap</div>
                  <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">OK</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold bg-[#E2F0E8] text-[#2A7A4B]">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div className="text-[13px] text-[#6B6760] line-through">Kasbon tercatat semua</div>
                  <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">OK</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold ${
                    payrollStats.isGenerated ? 'bg-[#E2F0E8] text-[#2A7A4B]' : 'bg-[#F5EDE0] text-[#B87333]'
                  }`}>
                    {payrollStats.isGenerated ? (
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                    ) : '→'}
                  </div>
                  <div className={`text-[13px] ${payrollStats.isGenerated ? 'text-[#6B6760] line-through' : 'text-[#1A1814] font-medium'}`}>Generate slip gaji</div>
                  <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">Draft</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold ${
                    payrollStats.allPaid ? 'bg-[#E2F0E8] text-[#2A7A4B]' : 'bg-[#EDEAE4] text-[#A8A49E]'
                  }`}>
                    {payrollStats.allPaid ? (
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                    ) : '4'}
                  </div>
                  <div className={`text-[13px] ${payrollStats.allPaid ? 'text-[#6B6760] line-through' : 'text-[#A8A49E]'}`}>Kirim ke karyawan</div>
                  <div className="ml-auto text-[11.5px] text-[#A8A49E] font-mono">Lunas</div>
                </div>
              </div>
              <Link to="/admin/payroll" className="bg-[#1A1814] rounded-[10px] p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#2a2620] transition-colors group block">
                <div className="text-[13px] text-white/70">
                  <strong className="text-white block text-[14px] font-['Syne'] mb-0.5">
                    {payrollStats.isGenerated ? 'Buka Payroll →' : 'Generate sekarang →'}
                  </strong>
                  Estimasi total {payrollStats.isGenerated ? fmtCurrency(payrollStats.totalPayrollPaid) : fmtCurrency(payrollStats.estimatedSalary)}
                </div>
                <div className="text-white/40 text-[20px] group-hover:text-white/80 transition-colors">⚡</div>
              </Link>
            </div>
          </div>

          {/* AKTIVITAS TERKINI CARD */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <div className="font-['Syne'] text-[14.5px] font-semibold">Aktivitas terkini</div>
                <div className="text-[12px] text-[#A8A49E] mt-0.5">Hari ini</div>
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-[#2A7A4B] font-medium">
                <div className="w-2 h-2 rounded-full bg-[#2A7A4B] animate-pulse"></div>Live
              </div>
            </div>
            <div>
              {activities.length === 0 ? (
                <div className="text-center py-16 text-[#A8A49E] text-[13px]">
                  Belum ada aktivitas tercatat hari ini.
                </div>
              ) : (
                activities.map((a, i) => (
                  <Link to="/admin/absensi" key={i} className="flex items-center gap-3 px-5 py-[11px] border-b border-[#E0DDD7] last:border-b-0 hover:bg-[#FAFAF8] transition-colors cursor-pointer block">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[16px]" style={{ backgroundColor: a.color }}>
                        {a.icon}
                      </div>
                      <div className="flex-1 text-[13px] text-[#1A1814]">{a.label}</div>
                      <div className="text-[11.5px] text-[#A8A49E] font-mono whitespace-nowrap">{a.time}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}