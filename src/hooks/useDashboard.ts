import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { toast } from 'sonner';
import { fmtCurrency } from '@/lib/utils';

export function useDashboard() {
  // 1. Live Time Update
  const [liveTime, setLiveTime] = useState(() => 
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Current Date/Period Info
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }, []);

  const currentMonth = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const period = `${year}-${month}`;
    const monthStart = `${period}-01`;
    
    const nextYear = d.getMonth() === 11 ? year + 1 : year;
    const nextMonth = d.getMonth() === 11 ? 1 : d.getMonth() + 2;
    const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
    
    return { period, monthStart, monthEnd };
  }, []);

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  /* ─── FETCH DATABASES QUERIES ─── */

  // 1. Fetch all employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['dashboard_employees'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('users')
        .select('*')
        .eq('role', 'employee');
      if (error) {
        toast.error('Gagal memuat data karyawan');
        throw error;
      }
      return data || [];
    }
  });

  // 2. Fetch today's attendance logs
  const { data: attendanceToday = [], isLoading: loadingAttendance } = useQuery({
    queryKey: ['dashboard_attendance_today'],
    queryFn: async () => {
      const todayStr = getTodayStr();
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
        .eq('date', todayStr);
      if (error) {
        toast.error('Gagal memuat data absensi hari ini');
        throw error;
      }
      return data || [];
    }
  });

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
        .neq('status', 'rejected');
      if (error) {
        toast.error('Gagal memuat data kasbon bulan ini');
        throw error;
      }
      return data || [];
    }
  });

  // 4. Fetch payroll for this month
  const { data: payrollMonth = [], isLoading: loadingPayroll } = useQuery({
    queryKey: ['dashboard_payroll_month'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .select('*')
        .eq('period', currentMonth.period);
      if (error) {
        toast.error('Gagal memuat data payroll');
        throw error;
      }
      return data || [];
    }
  });

  // 5. Fetch pending cuti requests
  const { data: pendingCuti = [], isLoading: loadingCuti } = useQuery({
    queryKey: ['dashboard_pending_cuti'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('attendance')
        .select('*, users:user_id(name)')
        .like('status', '%_pending');
      if (error) throw error;
      return data || [];
    }
  });

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
        .lt('requested_at', currentMonth.monthStart);
      if (error) throw error;
      return data || [];
    }
  });

  // 7. Fetch monthly attendance metrics (for progress bars)
  const { data: attendanceMonth = [], isLoading: loadingAttendanceMonth } = useQuery({
    queryKey: ['dashboard_attendance_month'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('attendance')
        .select('user_id, status, date')
        .gte('date', currentMonth.monthStart)
        .lt('date', currentMonth.monthEnd);
      if (error) throw error;
      return data || [];
    }
  });

  /* ─── DYNAMIC STATISTICS COMPILATION ─── */

  // Active employees count
  const activeEmployeesCount = useMemo(() => {
    return employees.filter(e => e.status === 'active').length;
  }, [employees]);

  // Attendance metrics today
  const attendanceTodayStats = useMemo(() => {
    const presentToday = attendanceToday.filter(a => a.status === 'ontime' || a.status === 'late');
    const countPresent = presentToday.length;
    const countOntime = presentToday.filter(a => a.status === 'ontime').length;
    const countLate = presentToday.filter(a => a.status === 'late').length;
    const countOut = presentToday.filter(a => a.clock_out_time !== null).length;
    
    // Absent active employees today: active employees who have no attendance row today
    const countAbsent = employees.filter(e => 
      e.status === 'active' && !attendanceToday.some(a => a.user_id === e.id)
    ).length;

    return {
      countPresent,
      countOntime,
      countLate,
      countOut,
      countAbsent
    };
  }, [attendanceToday, employees]);

  // Kasbon metrics
  const kasbonStats = useMemo(() => {
    const totalKasbonAmt = kasbonMonth.reduce((sum, k) => sum + Number(k.amount), 0);
    const countTransactions = kasbonMonth.length;
    
    const unpaidKasbonAmt = kasbonMonth
      .filter(k => k.status === 'approved' || k.status === 'pending')
      .reduce((sum, k) => sum + Number(k.amount), 0);

    const deductedKasbonAmt = kasbonMonth
      .filter(k => k.status === 'deducted')
      .reduce((sum, k) => sum + Number(k.amount), 0);

    return {
      totalKasbonAmt,
      countTransactions,
      unpaidKasbonAmt,
      deductedKasbonAmt
    };
  }, [kasbonMonth]);

  // Payroll metrics
  const payrollStats = useMemo(() => {
    const totalPayrollPaid = payrollMonth.reduce((sum, p) => sum + Number(p.net_salary), 0);
    const countPaidSlips = payrollMonth.filter(p => p.status === 'paid').length;
    
    // Estimate total active payroll if not generated yet
    const activeEmployees = employees.filter(e => e.status === 'active');
    const estimatedSalary = activeEmployees.reduce((sum, e) => sum + Number(e.salary || 0), 0) - kasbonStats.unpaidKasbonAmt;
    
    const isGenerated = payrollMonth.length > 0;
    const allPaid = isGenerated && payrollMonth.every(p => p.status === 'paid');

    return {
      totalPayrollPaid,
      countPaidSlips,
      estimatedSalary,
      isGenerated,
      allPaid
    };
  }, [payrollMonth, employees, kasbonStats]);

  // Past unpaid kasbons alert data
  const pastKasbonAlert = useMemo(() => {
    const pastCount = unpaidPastKasbon.length;
    const pastTotal = unpaidPastKasbon.reduce((sum, k) => sum + Number(k.amount), 0);
    const uniqueNames = unpaidPastKasbon
      .map(k => k.users?.name)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3)
      .join(', ');

    return {
      pastCount,
      pastTotal,
      uniqueNames
    };
  }, [unpaidPastKasbon]);

  // Monthly Attendance Metrics (for progress bars)
  const monthlyMetrics = useMemo(() => {
    const totalActive = activeEmployeesCount || 1;
    
    // Count unique workdays that have elapsed in this month
    const elapsedWorkdays = new Set(attendanceMonth.map(a => a.date)).size || 1;
    const totalPossibleAttendances = elapsedWorkdays * totalActive;
    
    const presentMonthCount = attendanceMonth.filter(a => a.status === 'ontime' || a.status === 'late').length;
    const monthlyAttendancePct = Math.round((presentMonthCount / totalPossibleAttendances) * 100) || 0;
    
    const ontimeCount = attendanceMonth.filter(a => a.status === 'ontime').length;
    const monthlyOntimePct = Math.round((ontimeCount / (presentMonthCount || 1)) * 100) || 0;
    
    const lateCount = attendanceMonth.filter(a => a.status === 'late').length;
    const monthlyLatePct = Math.round((lateCount / (presentMonthCount || 1)) * 100) || 0;

    return {
      monthlyAttendancePct: Math.min(monthlyAttendancePct, 100),
      monthlyOntimePct: Math.min(monthlyOntimePct, 100),
      monthlyLatePct: Math.min(monthlyLatePct, 100)
    };
  }, [attendanceMonth, activeEmployeesCount]);

  // Attention Items Feed
  const attentionItems = useMemo(() => {
    const items: any[] = [];
    
    // 1. Pending Kasbon requests
    kasbonMonth.filter(k => k.status === 'pending').forEach(k => {
      items.push({
        name: k.users?.name || 'Karyawan',
        reason: `Pengajuan kasbon ${fmtCurrency(k.amount)}`,
        badge: 'Kasbon pending',
        type: 'blue',
        link: '/admin/kasbon'
      });
    });

    // 2. Pending Cuti requests
    pendingCuti.forEach(c => {
      const typeLabel = c.status.replace('_pending', '').toUpperCase();
      items.push({
        name: c.users?.name || 'Karyawan',
        reason: `Pengajuan ${typeLabel} tanggal ${new Date(c.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`,
        badge: 'Cuti pending',
        type: 'purple',
        link: '/admin/absensi'
      });
    });

    // 3. Flagged attendance entries today
    attendanceToday.filter(a => a.is_flagged).forEach(a => {
      items.push({
        name: a.users?.name || 'Karyawan',
        reason: 'Lokasi absen masuk di luar area geofence',
        badge: 'Lokasi anomali',
        type: 'amber',
        link: '/admin/absensi'
      });
    });

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
      });
    });

    return items.slice(0, 5); // cap at 5 items
  }, [kasbonMonth, pendingCuti, attendanceToday, employees]);

  // Today's unified Activity Feed (combined clock-in, clock-out, kasbon requests)
  const activities = useMemo(() => {
    const events: any[] = [];
    const todayStr = getTodayStr();

    // 1. Process attendance today
    attendanceToday.forEach(att => {
      const name = att.users?.name || 'Karyawan';
      
      if (att.clock_in_time) {
        const dateObj = new Date(att.clock_in_time);
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const isLate = att.status === 'late';
        events.push({
          icon: '📍',
          label: `${name} clock-in ${isLate ? 'terlambat' : ''}`,
          isLate,
          name,
          time: timeStr,
          color: isLate ? '#F5EDE0' : '#E2F0E8', // Amber vs Green
          rawTime: dateObj.getTime()
        });
      }

      if (att.clock_out_time) {
        const dateObj = new Date(att.clock_out_time);
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        events.push({
          icon: '📍',
          label: `${name} clock-out`,
          name,
          time: timeStr,
          color: '#EDEAE4', // Gray
          rawTime: dateObj.getTime()
        });
      }
    });

    // 2. Process kasbons today
    kasbonMonth.forEach(k => {
      if (k.requested_at && k.requested_at.startsWith(todayStr)) {
        const dateObj = new Date(k.requested_at);
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        events.push({
          icon: '💰',
          label: `${k.users?.name || 'Karyawan'} ajukan kasbon ${fmtCurrency(k.amount)}`,
          name: k.users?.name || 'Karyawan',
          amountStr: fmtCurrency(k.amount),
          time: timeStr,
          color: '#F5E8E4', // Soft red
          rawTime: dateObj.getTime()
        });
      }
    });

    // Sort by timestamp descending
    return events.sort((a, b) => b.rawTime - a.rawTime).slice(0, 6);
  }, [attendanceToday, kasbonMonth]);

  const isInitialLoading = 
    loadingEmployees || 
    loadingAttendance || 
    loadingKasbon || 
    loadingPayroll || 
    loadingCuti || 
    loadingPastKasbon || 
    loadingAttendanceMonth;

  return {
    liveTime,
    todayLabel,
    currentMonth,
    isInitialLoading,
    activeEmployeesCount,
    attendanceTodayStats,
    kasbonStats,
    payrollStats,
    pastKasbonAlert,
    monthlyMetrics,
    attentionItems,
    activities,
  };
}
