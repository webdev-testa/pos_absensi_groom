import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { AdminLayout, AV_COLORS, initials } from '@/components/layout/AdminLayout'
import { fmtCurrency } from '@/lib/utils'

import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Search, Download, Plus, FileText, Printer, Loader2, CheckCircle2 } from 'lucide-react'

export default function Payroll() {
  const queryClient = useQueryClient()

  // 1. Period Selector & Basic Filters
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  
  const [searchQ, setSearchQ] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'paid' | 'not_generated'>('all')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Modals & Inputs
  const [showIncentiveModal, setShowIncentiveModal] = useState(false)
  const [incentiveAmount, setIncentiveAmount] = useState('')
  const [incentiveUserId, setIncentiveUserId] = useState<string | null>(null)

  // Generate Date Range for the Selected Month
  const periodDates = useMemo(() => {
    const startOfPeriod = `${selectedPeriod}-01`
    const [year, month] = selectedPeriod.split('-').map(Number)
    const nextYear = month === 12 ? year + 1 : year
    const nextMonth = month === 12 ? 1 : month + 1
    const endOfPeriod = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
    return { startOfPeriod, endOfPeriod }
  }, [selectedPeriod])

  // Get Period Label in Indonesian (e.g. "Juni 2026")
  const selectedPeriodLabel = useMemo(() => {
    const [year, month] = selectedPeriod.split('-').map(Number)
    const d = new Date(year, month - 1, 1)
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }, [selectedPeriod])

  // Generate last 12 months for select filter
  const monthsList = useMemo(() => {
    const list = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      list.push({ val, label })
    }
    return list
  }, [])

  /* ─── FETCH QUERIES ─── */
  
  // 1. Fetch all employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['payroll_employees'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('users')
        .select('*')
        .eq('role', 'employee')
        .order('name')
      
      if (error) {
        toast.error('Gagal memuat data karyawan')
        throw error
      }
      return data || []
    }
  })

  // 2. Fetch generated payrolls for the period
  const { data: payrolls = [], isLoading: loadingPayrolls } = useQuery({
    queryKey: ['payrolls', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .select('*')
        .eq('period', selectedPeriod)
      
      if (error) {
        toast.error('Gagal memuat data payroll')
        throw error
      }
      return data || []
    }
  })

  // 3. Fetch approved/deducted kasbons for the period
  const { data: kasbons = [], isLoading: loadingKasbons } = useQuery({
    queryKey: ['kasbons', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .select('*')
        .gte('requested_at', periodDates.startOfPeriod)
        .lt('requested_at', periodDates.endOfPeriod)
        .in('status', ['approved', 'deducted'])
      
      if (error) {
        toast.error('Gagal memuat data kasbon')
        throw error
      }
      return data || []
    }
  })

  // 4. Fetch attendance records count (present count: status 'ontime' or 'late')
  const { data: attendanceCounts = {}, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance_counts', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('attendance')
        .select('user_id, status')
        .gte('date', periodDates.startOfPeriod)
        .lt('date', periodDates.endOfPeriod)
        .in('status', ['ontime', 'late'])
      
      if (error) {
        toast.error('Gagal memuat data absensi')
        throw error
      }
      
      const counts: Record<string, number> = {}
      ;(data || []).forEach(row => {
        if (row.user_id) {
          counts[row.user_id] = (counts[row.user_id] || 0) + 1
        }
      })
      return counts
    }
  })

  /* ─── DATA COMPILATION & CALCULATIONS ─── */
  
  const payrollData = useMemo(() => {
    return employees.map(emp => {
      // 1. Find existing payroll record
      const payrollRecord = payrolls.find(p => p.user_id === emp.id)
      
      // 2. Sum up approved/deducted kasbons this period
      const empKasbons = kasbons.filter(k => k.user_id === emp.id)
      const totalKasbon = empKasbons.reduce((sum, k) => sum + Number(k.amount), 0)
      
      // 3. Get basic salary
      const basicSalary = emp.salary || 0
      
      // 4. Get incentives
      const incentives = payrollRecord ? (payrollRecord.incentives || 0) : 0
      
      // 5. Get kasbon deduction (use database value if generated, otherwise sum approved)
      const kasbonDeduction = payrollRecord ? (payrollRecord.kasbon_deduction || 0) : totalKasbon
      
      // 6. Gaji Bersih calculation
      const netSalary = basicSalary + incentives - kasbonDeduction
      
      // 7. Get attendance count
      const presentDays = attendanceCounts[emp.id] || 0
      
      return {
        user: emp,
        payrollId: payrollRecord?.id || null,
        basicSalary,
        incentives,
        kasbonDeduction,
        netSalary,
        status: payrollRecord ? (payrollRecord.status || 'draft') : 'not_generated',
        presentDays,
        created_at: payrollRecord?.created_at || null
      }
    })
  }, [employees, payrolls, kasbons, attendanceCounts])

  // Filter inactive employees unless they already have a payroll record this month
  const mappedPayrollData = useMemo(() => {
    return payrollData.filter(item => {
      return item.user.status === 'active' || item.status !== 'not_generated'
    })
  }, [payrollData])

  // Filter and Search
  const filteredData = useMemo(() => {
    return mappedPayrollData.filter(item => {
      const q = searchQ.toLowerCase()
      const matchSearch = item.user.name.toLowerCase().includes(q) || item.user.emp_id.toLowerCase().includes(q)
      const matchDept = deptFilter === 'all' || item.user.dept === deptFilter
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      return matchSearch && matchDept && matchStatus
    })
  }, [mappedPayrollData, searchQ, deptFilter, statusFilter])

  // Dynamic lists
  const departments = useMemo(() => {
    return [...new Set(employees.map(emp => emp.dept).filter(Boolean))] as string[]
  }, [employees])

  // Selected employee detail item
  const selectedItem = useMemo(() => {
    return selectedUserId ? mappedPayrollData.find(item => item.user.id === selectedUserId) : null
  }, [selectedUserId, mappedPayrollData])

  // Summary Metrics (calculated from all generated payrolls in the month)
  const stats = useMemo(() => {
    const generated = mappedPayrollData.filter(item => item.status !== 'not_generated')
    const totalGajiBersih = generated.reduce((sum, item) => sum + item.netSalary, 0)
    const countPaid = generated.filter(item => item.status === 'paid').length
    const countTotal = generated.length
    const totalInsentif = generated.reduce((sum, item) => sum + item.incentives, 0)
    const totalKasbonDipotong = generated.reduce((sum, item) => sum + item.kasbonDeduction, 0)
    
    return {
      totalGajiBersih,
      countPaid,
      countTotal,
      totalInsentif,
      totalKasbonDipotong
    }
  }, [mappedPayrollData])

  /* ─── MUTATIONS ─── */

  // 1. Generate/Save all payrolls as Draft
  const generateMutation = useMutation({
    mutationFn: async () => {
      const activeEmployees = mappedPayrollData.filter(item => item.user.status === 'active')
      if (activeEmployees.length === 0) return
      
      const payload = activeEmployees.map(item => ({
        id: item.payrollId || undefined,
        user_id: item.user.id,
        period: selectedPeriod,
        basic_salary: item.basicSalary,
        incentives: item.incentives,
        kasbon_deduction: item.kasbonDeduction,
        net_salary: item.basicSalary + item.incentives - item.kasbonDeduction,
        status: item.status === 'not_generated' ? 'draft' : item.status
      }))
      
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .upsert(payload, { onConflict: 'user_id,period' })
        
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Payroll berhasil disimpan sebagai Draft')
      queryClient.invalidateQueries({ queryKey: ['payrolls', selectedPeriod] })
    },
    onError: (error: any) => {
      toast.error('Gagal memproses payroll: ' + error.message)
    }
  })

  // 2. Mark an individual employee's payroll as Paid & mark their kasbon as Deducted
  const markPaidMutation = useMutation({
    mutationFn: async (item: typeof mappedPayrollData[0]) => {
      const record = {
        id: item.payrollId || undefined,
        user_id: item.user.id,
        period: selectedPeriod,
        basic_salary: item.basicSalary,
        incentives: item.incentives,
        kasbon_deduction: item.kasbonDeduction,
        net_salary: item.basicSalary + item.incentives - item.kasbonDeduction,
        status: 'paid'
      }
      
      const { error: payrollError } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .upsert(record, { onConflict: 'user_id,period' })
        
      if (payrollError) throw payrollError
      
      const { error: kasbonError } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .update({ status: 'deducted' })
        .eq('user_id', item.user.id)
        .eq('status', 'approved')
        .gte('requested_at', periodDates.startOfPeriod)
        .lt('requested_at', periodDates.endOfPeriod)
        
      if (kasbonError) throw kasbonError
    },
    onSuccess: (_, item) => {
      toast.success(`Pembayaran gaji ${item.user.name} berhasil diproses`)
      queryClient.invalidateQueries({ queryKey: ['payrolls', selectedPeriod] })
      queryClient.invalidateQueries({ queryKey: ['kasbons', selectedPeriod] })
    },
    onError: (error: any) => {
      toast.error('Gagal memproses pembayaran: ' + error.message)
    }
  })

  // 3. Mark all Draft payrolls as Paid & mark their kasbons as Deducted in bulk
  const markAllPaidMutation = useMutation({
    mutationFn: async () => {
      const draftItems = mappedPayrollData.filter(item => item.status === 'draft')
      if (draftItems.length === 0) return
      
      const payrollPayload = draftItems.map(item => ({
        id: item.payrollId || undefined,
        user_id: item.user.id,
        period: selectedPeriod,
        basic_salary: item.basicSalary,
        incentives: item.incentives,
        kasbon_deduction: item.kasbonDeduction,
        net_salary: item.basicSalary + item.incentives - item.kasbonDeduction,
        status: 'paid'
      }))
      
      const { error: payrollError } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .upsert(payrollPayload, { onConflict: 'user_id,period' })
        
      if (payrollError) throw payrollError
      
      const userIds = draftItems.map(item => item.user.id)
      const { error: kasbonError } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .update({ status: 'deducted' })
        .in('user_id', userIds)
        .eq('status', 'approved')
        .gte('requested_at', periodDates.startOfPeriod)
        .lt('requested_at', periodDates.endOfPeriod)
        
      if (kasbonError) throw kasbonError
    },
    onSuccess: () => {
      toast.success('Semua draft payroll berhasil ditandai Terbayar')
      queryClient.invalidateQueries({ queryKey: ['payrolls', selectedPeriod] })
      queryClient.invalidateQueries({ queryKey: ['kasbons', selectedPeriod] })
    },
    onError: (error: any) => {
      toast.error('Gagal memproses pembayaran massal: ' + error.message)
    }
  })

  // 4. Update individual incentive (bonus)
  const updateIncentiveMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const item = mappedPayrollData.find(d => d.user.id === userId)
      if (!item) throw new Error('Karyawan tidak ditemukan')
      
      const record = {
        id: item.payrollId || undefined,
        user_id: userId,
        period: selectedPeriod,
        basic_salary: item.basicSalary,
        incentives: amount,
        kasbon_deduction: item.kasbonDeduction,
        net_salary: item.basicSalary + amount - item.kasbonDeduction,
        status: item.status === 'not_generated' ? 'draft' : item.status
      }
      
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('payroll')
        .upsert(record, { onConflict: 'user_id,period' })
        
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Nominal insentif berhasil disimpan')
      setShowIncentiveModal(false)
      queryClient.invalidateQueries({ queryKey: ['payrolls', selectedPeriod] })
    },
    onError: (error: any) => {
      toast.error('Gagal menyimpan insentif: ' + error.message)
    }
  })

  /* ─── UTILITY FUNCTIONS ─── */

  // 1. Export payroll list to Excel (CSV format)
  const exportExcel = () => {
    const dataToExport = filteredData
    if (dataToExport.length === 0) {
      toast.error('Tidak ada data untuk diexport')
      return
    }
    
    const headers = ['Nama Karyawan', 'ID Karyawan', 'Divisi', 'Gaji Pokok', 'Insentif', 'Potongan Kasbon', 'Gaji Bersih', 'Status']
    const rows = dataToExport.map(item => [
      item.user.name,
      item.user.emp_id,
      item.user.dept || '',
      item.basicSalary,
      item.incentives,
      item.kasbonDeduction,
      item.netSalary,
      item.status === 'not_generated' ? 'Belum Dibuat' : item.status === 'draft' ? 'Draft' : 'Terbayar'
    ])
    
    const csvContent = "\uFEFF" + [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Payroll_Karyawan_${selectedPeriod}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Daftar payroll berhasil diexport')
  }

  // 2. Local Print Slip Gaji Functionality
  const [printItem, setPrintItem] = useState<typeof mappedPayrollData[0] | null>(null)
  
  const handlePrint = (item: typeof mappedPayrollData[0]) => {
    setPrintItem(item)
    setTimeout(() => {
      window.print()
      setTimeout(() => setPrintItem(null), 1000)
    }, 100)
  }

  // 3. Open Incentive Form Modal
  const openIncentiveModal = (item: typeof mappedPayrollData[0]) => {
    setIncentiveUserId(item.user.id)
    setIncentiveAmount(item.incentives > 0 ? String(item.incentives) : '')
    setShowIncentiveModal(true)
  }

  const handleSaveIncentive = () => {
    if (!incentiveUserId) return
    const amt = parseInt(incentiveAmount) || 0
    updateIncentiveMutation.mutate({ userId: incentiveUserId, amount: amt })
  }

  if (loadingEmployees || loadingPayrolls || loadingKasbons || loadingAttendance) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[500px] bg-[#F5F2ED] -m-10 lg:-m-12 p-10 lg:p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#C84B2F]" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Dynamic Printing Style overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-payslip, #print-payslip * {
            visibility: visible;
          }
          #print-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            background: white !important;
            color: black !important;
            padding: 40px !important;
          }
        }
      `}} />

      <div className="bg-[#F5F2ED] text-[#1A1814] -m-10 lg:-m-12 p-10 lg:p-12 min-h-screen font-sans flex flex-col gap-6 select-none">
        
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A1814]">Kelola Payroll & Gaji</h1>
            <p className="text-[13.5px] text-[#6B6760] mt-1.5">Perhitungan gaji bersih, input insentif, dan potongan kasbon karyawan</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px] bg-white border-[#E0DDD7] rounded-[10px] h-[38px] text-[13px]">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                {monthsList.map(m => (
                  <SelectItem key={m.val} value={m.val}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportExcel} variant="outline" className="bg-white border-[#E0DDD7] text-[#6B6760] hover:text-[#1A1814] hover:border-[#CBC8C2] rounded-[10px] h-[38px] text-[13px]">
              <Download className="w-4 h-4 mr-1.5" />
              Export Excel
            </Button>

            <Button 
              onClick={() => generateMutation.mutate()} 
              disabled={generateMutation.isPending}
              className="bg-[#C84B2F] hover:bg-[#b03d24] text-white border-none rounded-[10px] h-[38px] text-[13px] font-medium"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-1.5" />
              )}
              Generate Payroll
            </Button>
          </div>
        </div>

        {/* STATS COUNTER */}
        <div className="grid grid-cols-4 gap-[14px]">
          <Card className="bg-white border-[#E0DDD7] rounded-[16px] shadow-none">
            <CardContent className="p-[18px_20px]">
              <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Total Gaji Bersih</div>
              <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#1A1814]">
                {fmtCurrency(stats.totalGajiBersih)}
              </div>
              <div className="text-[12px] text-[#A8A49E] mt-1.5">{stats.countTotal} slip gaji digenerate</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E0DDD7] rounded-[16px] shadow-none">
            <CardContent className="p-[18px_20px]">
              <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Terbayar</div>
              <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#2A7A4B]">
                {stats.countPaid}
              </div>
              <div className="text-[12px] text-[#A8A49E] mt-1.5">dari {stats.countTotal} karyawan</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E0DDD7] rounded-[16px] shadow-none">
            <CardContent className="p-[18px_20px]">
              <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Total Insentif</div>
              <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#C84B2F]">
                {fmtCurrency(stats.totalInsentif)}
              </div>
              <div className="text-[12px] text-[#A8A49E] mt-1.5">bonus bulan ini</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E0DDD7] rounded-[16px] shadow-none">
            <CardContent className="p-[18px_20px]">
              <div className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Kasbon Dipotong</div>
              <div className="font-['Syne'] text-[30px] font-bold tracking-[-1px] leading-none text-[#B87333]">
                {fmtCurrency(stats.totalKasbonDipotong)}
              </div>
              <div className="text-[12px] text-[#A8A49E] mt-1.5">potongan kasbon langsung</div>
            </CardContent>
          </Card>
        </div>

        {/* FILTER BAR */}
        <div className="flex items-center gap-[10px] flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A49E]" />
            <Input 
              className="pl-[34px] bg-white border-[#E0DDD7] rounded-[10px] text-[13px] h-[38px] placeholder:text-[#A8A49E] focus-visible:ring-0 focus-visible:border-[#CBC8C2]" 
              placeholder="Cari nama atau ID..." 
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[160px] bg-white border-[#E0DDD7] rounded-[10px] h-[38px] text-[13px]">
              <SelectValue placeholder="Semua Divisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua divisi</SelectItem>
              {departments.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Tabs filter */}
          <div className="flex gap-[3px] bg-white border border-[#E0DDD7] rounded-[10px] p-[3px]">
            <button 
              onClick={() => setStatusFilter('all')} 
              className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] font-medium border-none cursor-pointer transition-all ${statusFilter === 'all' ? 'bg-[#1A1814] text-white' : 'bg-transparent text-[#6B6760] hover:text-[#1A1814]'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setStatusFilter('draft')} 
              className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] font-medium border-none cursor-pointer transition-all ${statusFilter === 'draft' ? 'bg-[#1A1814] text-white' : 'bg-transparent text-[#6B6760] hover:text-[#1A1814]'}`}
            >
              Draft
            </button>
            <button 
              onClick={() => setStatusFilter('paid')} 
              className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] font-medium border-none cursor-pointer transition-all ${statusFilter === 'paid' ? 'bg-[#1A1814] text-white' : 'bg-transparent text-[#6B6760] hover:text-[#1A1814]'}`}
            >
              Terbayar
            </button>
            <button 
              onClick={() => setStatusFilter('not_generated')} 
              className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] font-medium border-none cursor-pointer transition-all ${statusFilter === 'not_generated' ? 'bg-[#1A1814] text-white' : 'bg-transparent text-[#6B6760] hover:text-[#1A1814]'}`}
            >
              Belum Dibuat
            </button>
          </div>

          {/* Finalize Mass Action */}
          {mappedPayrollData.some(item => item.status === 'draft') && (
            <Button 
              onClick={() => markAllPaidMutation.mutate()} 
              disabled={markAllPaidMutation.isPending}
              className="ml-auto bg-[#2A7A4B] hover:bg-[#1f5d37] text-white border-none rounded-[10px] h-[38px] text-[13px] font-medium"
            >
              {markAllPaidMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
              )}
              Tandai Semua Lunas
            </Button>
          )}
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-[1fr_360px] gap-5 items-start">
          
          {/* PAYROLL TABLE */}
          <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden">
            <div className="p-[16px_20px] border-b border-[#E0DDD7] flex items-center justify-between">
              <div>
                <h3 className="font-['Syne'] text-[15px] font-bold text-[#1A1814]">Daftar Gaji Karyawan</h3>
                <p className="text-[12px] text-[#A8A49E] mt-0.5">{filteredData.length} data karyawan ditampilkan</p>
              </div>
            </div>
            <Table>
              <TableHeader className="bg-[#EDEAE4]">
                <TableRow className="border-b border-[#E0DDD7] hover:bg-transparent">
                  <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Karyawan</TableHead>
                  <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Divisi</TableHead>
                  <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Gaji Pokok</TableHead>
                  <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Insentif</TableHead>
                  <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Kasbon</TableHead>
                  <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Gaji Bersih</TableHead>
                  <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4">Status</TableHead>
                  <TableHead className="text-[10.5px] font-mono font-medium text-[#A8A49E] uppercase tracking-[0.8px] h-10 px-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-[#A8A49E] text-[13px]">
                      Tidak ada data payroll yang cocok.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, idx) => {
                    const isSelected = selectedUserId === item.user.id
                    const c = AV_COLORS[idx % AV_COLORS.length]
                    return (
                      <TableRow 
                        key={item.user.id} 
                        onClick={() => setSelectedUserId(item.user.id)}
                        className={`border-b border-[#E0DDD7] cursor-pointer transition-colors ${isSelected ? 'bg-[#F0F7F3]' : 'hover:bg-[#FAFAF8]'}`}
                      >
                        <TableCell className="p-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-[34px] h-[34px] rounded-full font-['Syne'] font-bold text-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg, color: c.fg }}>
                              <AvatarFallback className="bg-transparent">{initials(item.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-[13.5px] text-[#1A1814]">{item.user.name}</div>
                              <div className="text-[11px] text-[#A8A49E] font-mono">{item.user.emp_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-3.5 px-4 text-[13px] text-[#6B6760]">
                          {item.user.dept || '—'}
                        </TableCell>
                        <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-[#1A1814]">
                          {fmtCurrency(item.basicSalary)}
                        </TableCell>
                        <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-[#2A7A4B] font-medium">
                          {item.incentives > 0 ? `+${fmtCurrency(item.incentives)}` : 'Rp 0'}
                        </TableCell>
                        <TableCell className="p-3.5 px-4 text-[12.5px] font-mono text-[#C84B2F]">
                          {item.kasbonDeduction > 0 ? `-${fmtCurrency(item.kasbonDeduction)}` : 'Rp 0'}
                        </TableCell>
                        <TableCell className="p-3.5 px-4 text-[12.5px] font-mono font-semibold text-[#1A1814]">
                          {fmtCurrency(item.netSalary)}
                        </TableCell>
                        <TableCell className="p-3.5 px-4">
                          {item.status === 'paid' && (
                            <Badge className="bg-[#E2F0E8] text-[#2A7A4B] border-none font-medium text-[11px] px-2 py-0.5 rounded-full hover:bg-[#E2F0E8] shadow-none">
                              ● Terbayar
                            </Badge>
                          )}
                          {item.status === 'draft' && (
                            <Badge className="bg-[#F5EDE0] text-[#B87333] border-none font-medium text-[11px] px-2 py-0.5 rounded-full hover:bg-[#F5EDE0] shadow-none">
                              ● Draft
                            </Badge>
                          )}
                          {item.status === 'not_generated' && (
                            <Badge className="bg-[#EDEAE4] text-[#A8A49E] border-none font-medium text-[11px] px-2 py-0.5 rounded-full hover:bg-[#EDEAE4] shadow-none">
                              ○ Belum Dibuat
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="p-3.5 px-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 justify-end">
                            <button 
                              onClick={() => openIncentiveModal(item)}
                              className="px-2.5 py-1 rounded-[7px] text-[12px] font-medium border border-[#E0DDD7] bg-white text-[#6B6760] hover:border-[#CBC8C2] hover:text-[#1A1814] transition-all cursor-pointer"
                            >
                              Insentif
                            </button>
                            {item.status === 'draft' && (
                              <button 
                                onClick={() => markPaidMutation.mutate(item)}
                                disabled={markPaidMutation.isPending}
                                className="px-2.5 py-1 rounded-[7px] text-[12px] font-medium border-none bg-[#2A7A4B] text-white hover:bg-[#1f5d37] transition-all cursor-pointer"
                              >
                                Bayar
                              </button>
                            )}
                            {item.status !== 'not_generated' && (
                              <button 
                                onClick={() => handlePrint(item)}
                                className="p-1 rounded-[7px] border border-[#E0DDD7] bg-white text-[#6B6760] hover:border-[#CBC8C2] hover:text-[#1A1814] transition-all cursor-pointer"
                                title="Cetak Slip Gaji"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* DETAIL PANEL */}
          <div className="sticky top-5">
            {selectedItem ? (
              <div className="bg-white border border-[#E0DDD7] rounded-[16px] overflow-hidden flex flex-col">
                
                {/* HERO DETAIL */}
                <div className="bg-[#1A1814] p-5 text-white flex flex-col gap-4">
                  <div className="flex items-center gap-3.5">
                    <Avatar className="w-[52px] h-[52px] rounded-full font-['Syne'] font-bold text-[18px] flex items-center justify-center shrink-0 bg-[#F5EDE0] text-[#B87333]">
                      <AvatarFallback className="bg-transparent">{initials(selectedItem.user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-['Syne'] text-[17px] font-bold leading-tight">{selectedItem.user.name}</div>
                      <div className="text-[12px] text-white/40 font-mono mt-1">{selectedItem.user.emp_id} · {selectedItem.user.dept || 'No Dept'}</div>
                    </div>
                    <div className="ml-auto">
                      {selectedItem.status === 'paid' && <Badge className="bg-[#2A7A4B]/20 text-[#4ade80] border-none text-[11px] px-2 shadow-none font-medium rounded-full">Lunas</Badge>}
                      {selectedItem.status === 'draft' && <Badge className="bg-[#B87333]/20 text-[#F5EDE0] border-none text-[11px] px-2 shadow-none font-medium rounded-full">Draft</Badge>}
                      {selectedItem.status === 'not_generated' && <Badge className="bg-white/10 text-white/40 border-none text-[11px] px-2 shadow-none font-medium rounded-full">Belum Ada</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-0.5 bg-white/15 rounded-lg overflow-hidden border border-white/5">
                    <div className="bg-white/5 p-2.5 text-center">
                      <div className="font-['Syne'] text-[15px] font-bold text-white">{selectedItem.presentDays} hari</div>
                      <div className="text-[9.5px] text-white/35 uppercase tracking-[0.5px] font-mono mt-0.5">Kehadiran</div>
                    </div>
                    <div className="bg-white/5 p-2.5 text-center">
                      <div className="font-['Syne'] text-[15px] font-bold text-white">{fmtCurrency(selectedItem.kasbonDeduction)}</div>
                      <div className="text-[9.5px] text-white/35 uppercase tracking-[0.5px] font-mono mt-0.5">Kasbon</div>
                    </div>
                    <div className="bg-white/5 p-2.5 text-center">
                      <div className="font-['Syne'] text-[15px] font-bold text-white">{fmtCurrency(selectedItem.basicSalary)}</div>
                      <div className="text-[9.5px] text-white/35 uppercase tracking-[0.5px] font-mono mt-0.5">Gaji Pokok</div>
                    </div>
                  </div>
                </div>

                {/* DETAIL BODY */}
                <div className="p-5 flex flex-col gap-5">
                  <div>
                    <h4 className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2.5">Rincian Slip Gaji ({selectedPeriodLabel})</h4>
                    <div className="flex flex-col text-[13px] border-b border-[#E0DDD7] pb-2">
                      <div className="flex justify-between py-1.5">
                        <span className="text-[#6B6760]">Gaji Pokok</span>
                        <span className="font-medium font-mono">{fmtCurrency(selectedItem.basicSalary)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-[#2A7A4B]">
                        <span>Insentif / Tambahan</span>
                        <span className="font-medium font-mono">+{fmtCurrency(selectedItem.incentives)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 text-[#C84B2F]">
                        <span>Potongan Kasbon</span>
                        <span className="font-medium font-mono">-{fmtCurrency(selectedItem.kasbonDeduction)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 text-[14.5px] font-bold text-[#1A1814]">
                      <span>Gaji Bersih Diterima</span>
                      <span className="font-mono text-[#C84B2F]">{fmtCurrency(selectedItem.netSalary)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-2">Info Karyawan</h4>
                    <div className="flex flex-col text-[13px]">
                      <div className="flex justify-between py-1 border-b border-dashed border-[#E0DDD7]">
                        <span className="text-[#6B6760]">Role Status</span>
                        <span className="font-medium capitalize">{selectedItem.user.role || 'Employee'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-dashed border-[#E0DDD7]">
                        <span className="text-[#6B6760]">Status Karyawan</span>
                        <span className="font-medium capitalize">{selectedItem.user.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-dashed border-[#E0DDD7]">
                        <span className="text-[#6B6760]">Bergabung Sejak</span>
                        <span className="font-medium">
                          {selectedItem.user.created_at ? new Date(selectedItem.user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ATTENDANCE & KASBON PROGRESS BARS */}
                  <div>
                    <h4 className="text-[11px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono mb-3">Persentase Bulan Ini</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[12px] text-[#6B6760]">
                          <span>Kehadiran (Target 26 hari)</span>
                          <span className="font-mono">{Math.round((selectedItem.presentDays / 26) * 100)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(Math.round((selectedItem.presentDays / 26) * 100), 100)} 
                          indicatorClassName="bg-[#2A7A4B]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[12px] text-[#6B6760]">
                          <span>Limit Kasbon Terpakai</span>
                          <span className="font-mono">
                            {selectedItem.user.kasbon_limit > 0 ? Math.round((selectedItem.kasbonDeduction / selectedItem.user.kasbon_limit) * 100) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(
                            selectedItem.user.kasbon_limit > 0 
                              ? Math.round((selectedItem.kasbonDeduction / selectedItem.user.kasbon_limit) * 100) 
                              : 0, 
                            100
                          )} 
                          indicatorClassName={(selectedItem.user.kasbon_limit > 0 ? (selectedItem.kasbonDeduction / selectedItem.user.kasbon_limit) : 0) > 0.8 
                            ? 'bg-[#C84B2F]' 
                            : 'bg-[#B87333]'}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETAIL ACTIONS */}
                <div className="p-4 bg-[#EDEAE4] border-t border-[#E0DDD7] flex gap-2">
                  <Button 
                    onClick={() => openIncentiveModal(selectedItem)}
                    variant="outline" 
                    className="flex-1 bg-white border-[#E0DDD7] hover:border-[#CBC8C2] text-[#6B6760] hover:text-[#1A1814] h-[36px] text-[12.5px] rounded-[10px]"
                  >
                    Edit Insentif
                  </Button>
                  
                  {selectedItem.status !== 'not_generated' && (
                    <Button 
                      onClick={() => handlePrint(selectedItem)}
                      className="flex-1 bg-[#1A1814] hover:bg-[#2a2620] text-white border-none h-[36px] text-[12.5px] rounded-[10px]"
                    >
                      <Printer className="w-4.5 h-4.5 mr-1" />
                      Cetak Slip Gaji
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E0DDD7] rounded-[16px] p-10 text-center text-[#A8A49E] flex flex-col items-center gap-3">
                <FileText className="w-10 h-10 stroke-[1.2] text-[#A8A49E]" />
                <div>
                  <div className="font-semibold text-[13.5px] text-[#6B6760] mb-0.5">Detail Slip Gaji</div>
                  <div className="text-[12.5px]">Pilih salah satu karyawan di tabel untuk menampilkan rincian dan mencetak slip gaji.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRINT PAYSLIP TEMPLATE CONTAINER (Hidden on screen, styled for print only) */}
        {printItem && (
          <div id="print-payslip" className="hidden">
            <div className="max-w-xl mx-auto bg-white p-8 border border-[#E0DDD7] rounded-[16px] font-sans flex flex-col gap-6 text-[#1A1814]">
              {/* Slip Header */}
              <div className="border-b-2 border-[#1A1814] pb-4 flex justify-between items-end">
                <div>
                  <h2 className="font-['Syne'] text-[24px] font-bold tracking-tight text-[#1A1814]">SLIP GAJI KARYAWAN</h2>
                  <p className="text-[12.5px] text-[#6B6760] mt-1">Klinik Hewan Dr. Meow / HadiR System</p>
                </div>
                <div className="text-right text-[12px] font-mono">
                  <div>Periode: {selectedPeriodLabel}</div>
                  <div className="text-gray-400 mt-1">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>

              {/* Employee & Admin Meta Info */}
              <div className="grid grid-cols-2 gap-4 text-[13.5px] border-b border-[#E0DDD7] pb-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex"><span className="w-24 text-[#6B6760]">ID Karyawan</span><span className="font-mono">: {printItem.user.emp_id}</span></div>
                  <div className="flex"><span className="w-24 text-[#6B6760]">Nama</span><span className="font-medium">: {printItem.user.name}</span></div>
                  <div className="flex"><span className="w-24 text-[#6B6760]">Divisi</span><span>: {printItem.user.dept || '—'}</span></div>
                </div>
                <div className="flex flex-col gap-1.5 text-right">
                  <div><span className="text-[#6B6760]">Kehadiran Bulan Ini:</span> <strong className="font-mono">{printItem.presentDays} Hari</strong></div>
                  <div><span className="text-[#6B6760]">Status Pembayaran:</span> <strong className="text-[#2A7A4B]">{printItem.status === 'paid' ? 'TERBAYAR (PAID)' : 'DRAFT'}</strong></div>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-2 gap-8 py-2">
                
                {/* Income */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11.5px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono border-b border-[#E0DDD7] pb-1.5">Penerimaan (Earnings)</h4>
                  <div className="flex flex-col text-[13.5px] gap-2">
                    <div className="flex justify-between">
                      <span className="text-[#6B6760]">Gaji Pokok</span>
                      <span className="font-mono">{fmtCurrency(printItem.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-[#2A7A4B] font-medium">
                      <span>Insentif / Tambahan</span>
                      <span className="font-mono">+{fmtCurrency(printItem.incentives)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11.5px] text-[#A8A49E] uppercase tracking-[0.8px] font-mono border-b border-[#E0DDD7] pb-1.5">Potongan (Deductions)</h4>
                  <div className="flex flex-col text-[13.5px] gap-2">
                    <div className="flex justify-between text-[#C84B2F] font-medium">
                      <span>Potongan Kasbon</span>
                      <span className="font-mono">-{fmtCurrency(printItem.kasbonDeduction)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="border-t-2 border-[#1A1814] pt-4 flex justify-between items-center bg-[#F5EDE0] -mx-8 px-8 py-4">
                <span className="font-bold text-[14.5px]">GAJI BERSIH DITERIMA (NET SALARY)</span>
                <span className="font-['Syne'] text-[22px] font-bold text-[#C84B2F] font-mono">
                  {fmtCurrency(printItem.netSalary)}
                </span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 text-center text-[13px] pt-12">
                <div className="flex flex-col gap-12">
                  <div className="text-[#6B6760]">Tanda Tangan Penerima,</div>
                  <div className="font-medium underline decoration-dotted decoration-1 underline-offset-4">{printItem.user.name}</div>
                </div>
                <div className="flex flex-col gap-12">
                  <div className="text-[#6B6760]">Dr. Meow Management / Admin,</div>
                  <div className="font-medium underline decoration-dotted decoration-1 underline-offset-4">Administrator</div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center text-[10.5px] text-[#A8A49E] border-t border-dashed border-[#E0DDD7] pt-4 mt-6">
                Ini adalah slip gaji resmi yang diterbitkan secara elektronik oleh HadiR System. Dokumen ini sah dan tidak memerlukan tanda tangan basah jika disetujui.
              </div>
            </div>
          </div>
        )}

        {/* EDIT INCENTIVE DIALOG */}
        <Dialog open={showIncentiveModal} onOpenChange={setShowIncentiveModal}>
          <DialogContent className="max-w-[400px] bg-white border border-[#E0DDD7] rounded-[16px] p-6 text-[#1A1814]">
            <DialogHeader>
              <DialogTitle className="font-['Syne'] text-[17px] font-bold text-[#1A1814]">Input Insentif Manual</DialogTitle>
              <DialogDescription className="text-[12.5px] text-[#6B6760] mt-1.5">
                Masukkan nominal bonus atau insentif tambahan untuk karyawan di bulan {selectedPeriodLabel}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-[12.5px] text-[#6B6760] font-medium block mb-1.5">Nominal Insentif (Rp)</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-mono text-[#6B6760]">Rp</div>
                <Input 
                  type="number"
                  placeholder="Contoh: 500000" 
                  value={incentiveAmount}
                  onChange={e => setIncentiveAmount(e.target.value)}
                  className="pl-9 bg-white border-[#E0DDD7] rounded-[10px] text-[13.5px] h-[40px] focus-visible:ring-0 focus-visible:border-[#CBC8C2] font-mono"
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2 justify-end mt-4">
              <Button 
                onClick={() => setShowIncentiveModal(false)} 
                variant="outline" 
                className="bg-white border-[#E0DDD7] hover:border-[#CBC8C2] text-[#6B6760] hover:text-[#1A1814] h-[36px] text-[12.5px] rounded-[10px]"
              >
                Batal
              </Button>
              <Button 
                onClick={handleSaveIncentive} 
                disabled={updateIncentiveMutation.isPending}
                className="bg-[#C84B2F] hover:bg-[#b03d24] text-white border-none h-[36px] text-[12.5px] rounded-[10px]"
              >
                {updateIncentiveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  )
}