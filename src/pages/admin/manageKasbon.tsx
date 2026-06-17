import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { useAuth } from '@/hooks/useAuth'
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
import { Search, Download, Plus, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react'

type KasbonStatus = 'pending' | 'approved' | 'deducted' | 'rejected'

interface KasbonMapped {
  id: string
  name: string
  empId: string
  date: string
  amount: number
  note: string
  status: KasbonStatus
  balance: number
  user_id: string
  requested_at: string
  category: string
}

export default function ManageKasbon() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  // Filters & Modal State
  const [searchQ, setSearchQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | KasbonStatus>('all')
  const [tabFilter, setTabFilter] = useState<'all' | 'minggu' | 'hari'>('all')
  
  const [monthFilter, setMonthFilter] = useState<'all' | string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  
  const [showModal, setShowModal] = useState(false)

  // Add form states
  const [selectedUserId, setSelectedUserId] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0])
  const [reasonInput, setReasonInput] = useState('')
  const [categoryInput, setCategoryInput] = useState('Lainnya')

  // Generate last 6 months for dropdown filter
  const monthsList = useMemo(() => {
    const list = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      list.push({ val, label })
    }
    return list
  }, [])

  /* ─── 1. FETCH DATA (React Query) ─── */
  
  // Fetch active employees (for dropdown list in modal)
  const { data: employees = [] } = useQuery({
    queryKey: ['active_employees'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('users')
        .select('id, name, emp_id')
        .eq('status', 'active')
        .eq('role', 'employee')
        .order('name')

      if (error) {
        console.error('Fetch active employees error:', error)
        throw error
      }
      return data || []
    }
  })

  // Fetch all kasbon transactions
  const { data: rawKasbon = [], isLoading: loadingKasbon, refetch: refetchKasbon } = useQuery({
    queryKey: ['kasbon_list'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .select(`
          id,
          user_id,
          amount,
          reason,
          category,
          requested_at,
          status,
          approved_by,
          approved_at,
          users:user_id (
            name,
            emp_id
          )
        `)
        .order('requested_at', { ascending: false })

      if (error) {
        console.error('Fetch kasbon error:', error)
        toast.error('Gagal memuat data kasbon')
        throw error
      }
      return data || []
    }
  })

  /* ─── 2. MAP & CALCULATE REAL-TIME BALANCE ─── */
  
  const mappedKasbon = useMemo((): KasbonMapped[] => {
    return rawKasbon.map((item: any) => {
      // Calculate active unpaid balance for this user (sum of approved/pending kasbon)
      const unpaidBalance = rawKasbon
        .filter((k: any) => k.user_id === item.user_id && (k.status === 'approved' || k.status === 'pending'))
        .reduce((sum: number, k: any) => sum + Number(k.amount), 0)

      const d = new Date(item.requested_at || new Date())
      const formattedDate = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })

      return {
        id: item.id,
        name: item.users?.name || 'Karyawan',
        empId: item.users?.emp_id || '-',
        date: formattedDate,
        amount: Number(item.amount),
        note: item.reason || '',
        status: (item.status || 'pending') as KasbonStatus,
        balance: unpaidBalance,
        user_id: item.user_id || '',
        requested_at: item.requested_at || new Date().toISOString(),
        category: item.category || 'Lainnya'
      }
    })
  }, [rawKasbon])

  /* ─── 3. STATISTICS (Calculated based on selected month) ─── */
  
  const monthlyStats = useMemo(() => {
    const monthData = mappedKasbon.filter(r => {
      const itemDate = new Date(r.requested_at)
      const itemPeriod = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`
      return monthFilter === 'all' || itemPeriod === monthFilter
    })

    const total = monthData.reduce((sum, item) => sum + item.amount, 0)
    const unpaid = monthData.filter(d => d.status === 'approved' || d.status === 'pending').reduce((sum, item) => sum + item.amount, 0)
    const settled = monthData.filter(d => d.status === 'deducted').reduce((sum, item) => sum + item.amount, 0)
    const pendingCount = monthData.filter(d => d.status === 'pending').length
    const settledCount = monthData.filter(d => d.status === 'deducted').length

    const uniqueEmps = new Set(monthData.map(d => d.empId)).size
    const average = uniqueEmps > 0 ? Math.round(total / uniqueEmps) : 0

    return {
      total,
      unpaid,
      settled,
      uniqueEmps,
      average,
      pendingCount,
      settledCount,
      trxCount: monthData.length
    }
  }, [mappedKasbon, monthFilter])

  /* ─── 4. FILTERING TABLE RECORDS ─── */
  
  const filteredKasbon = useMemo(() => {
    return mappedKasbon.filter(r => {
      // Search query (name or notes/reason)
      const q = searchQ.toLowerCase()
      const matchSearch = r.name.toLowerCase().includes(q) || r.note.toLowerCase().includes(q)

      // Status filter
      const matchStatus = statusFilter === 'all' || r.status === statusFilter

      // Month/period filter
      const itemDate = new Date(r.requested_at)
      const itemPeriod = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`
      const matchMonth = monthFilter === 'all' || itemPeriod === monthFilter

      // Tab filter (All, This Week, Today)
      let matchTab = true
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - itemDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (tabFilter === 'hari') {
        matchTab = itemDate.toDateString() === now.toDateString()
      } else if (tabFilter === 'minggu') {
        matchTab = diffDays <= 7
      }

      return matchSearch && matchStatus && matchMonth && matchTab
    })
  }, [mappedKasbon, searchQ, statusFilter, monthFilter, tabFilter])

  /* ─── 5. MUTATIONS (Database Actions) ─── */

  // Approve Kasbon
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .update({
          status: 'approved',
          approved_by: currentUser?.id || null,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasbon_list'] })
      toast.success('Kasbon berhasil disetujui')
    },
    onError: (err: any) => {
      toast.error(`Gagal menyetujui: ${err.message}`)
    }
  })

  // Reject Kasbon
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .update({
          status: 'rejected',
          approved_by: currentUser?.id || null,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasbon_list'] })
      toast.success('Kasbon berhasil ditolak')
    },
    onError: (err: any) => {
      toast.error(`Gagal menolak: ${err.message}`)
    }
  })

  // Mark already deducted from salary
  const markDeductedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .update({ status: 'deducted' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasbon_list'] })
      toast.success('Status berhasil diperbarui menjadi sudah dipotong gaji')
    },
    onError: (err: any) => {
      toast.error(`Gagal memperbarui status: ${err.message}`)
    }
  })

  // Insert new kasbon (inserted directly as 'approved' because admin is creating it)
  const addKasbonMutation = useMutation({
    mutationFn: async (payload: { userId: string; amount: number; reason: string; date: string; category: string }) => {
      const { error } = await supabaseAdmin
        .schema('hr')
        .from('kasbon')
        .insert({
          user_id: payload.userId,
          amount: payload.amount,
          reason: payload.reason,
          category: payload.category,
          requested_at: new Date(payload.date).toISOString(),
          status: 'approved',
          approved_by: currentUser?.id || null,
          approved_at: new Date().toISOString()
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasbon_list'] })
      toast.success('Kasbon berhasil ditambahkan')
      setShowModal(false)
      // Reset form
      setSelectedUserId('')
      setAmountInput('')
      setReasonInput('')
      setCategoryInput('Lainnya')
    },
    onError: (err: any) => {
      toast.error(`Gagal menambahkan kasbon: ${err.message}`)
    }
  })

  /* ─── 6. HANDLERS ─── */

  const handleApprove = (id: string) => {
    approveMutation.mutate(id)
  }

  const handleReject = (id: string) => {
    rejectMutation.mutate(id)
  }

  const handleMarkDeducted = (id: string) => {
    markDeductedMutation.mutate(id)
  }

  const handleCreateKasbon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) {
      toast.error('Pilih karyawan terlebih dahulu')
      return
    }
    const amt = parseFloat(amountInput)
    if (isNaN(amt) || amt <= 0) {
      toast.error('Jumlah kasbon harus valid dan lebih dari 0')
      return
    }

    addKasbonMutation.mutate({
      userId: selectedUserId,
      amount: amt,
      reason: reasonInput.trim(),
      date: dateInput,
      category: categoryInput
    })
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-['Syne'] text-[28px] font-bold tracking-tight text-[#1A3A4A]">Log Kasbon</h1>
          <p className="text-[13.5px] text-[#4A7A8A] mt-1.5">Rekap pengambilan gaji di muka karyawan</p>
        </div>
        <div className="flex gap-2.5 items-center">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetchKasbon()}
            disabled={loadingKasbon}
            className="border-[#C8E8F5] text-[#4A7A8A] hover:bg-[#F0FAFF] h-[38px] w-[38px]"
          >
            <RefreshCw className={`w-4 h-4 ${loadingKasbon ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" className="border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF] h-[38px]" onClick={() => toast.success('Export Excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button className="bg-[#F5A940] hover:bg-[#e09833] text-white border-none h-[38px] font-medium" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Tambah Kasbon
          </Button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loadingKasbon ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#C8E8F5] rounded-[16px] shadow-sm">
          <Loader2 className="w-8 h-8 text-[#F5A940] animate-spin mb-4" />
          <p className="text-[14px] text-[#4A7A8A]">Memuat data kasbon...</p>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
              <CardContent className="p-[18px_20px]">
                 <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2">Total kasbon</div>
                 <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#F5A940]">{fmtCurrency(monthlyStats.total)}</div>
                 <div className="text-[12px] text-[#8ABAC8] mt-1.5">dari {monthlyStats.uniqueEmps} karyawan</div>
                 <Badge className="bg-[#FAF0E1] text-[#F5A940] hover:bg-[#FAF0E1] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">Bulan Terpilih</Badge>
              </CardContent>
            </Card>
            <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
              <CardContent className="p-[18px_20px]">
                 <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2">Belum dipotong</div>
                 <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#E89E3A]">{fmtCurrency(monthlyStats.unpaid)}</div>
                 <div className="text-[12px] text-[#8ABAC8] mt-1.5">{monthlyStats.pendingCount} transaksi pending</div>
                 <Badge className="bg-[#FAF0E1] text-[#E89E3A] hover:bg-[#FAF0E1] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">Akan dipotong gaji</Badge>
              </CardContent>
            </Card>
            <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
              <CardContent className="p-[18px_20px]">
                 <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2">Sudah dipotong</div>
                 <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#3AAD7A]">{fmtCurrency(monthlyStats.settled)}</div>
                 <div className="text-[12px] text-[#8ABAC8] mt-1.5">{monthlyStats.settledCount} transaksi settled</div>
                 <Badge className="bg-[#E2F0E8] text-[#3AAD7A] hover:bg-[#E2F0E8] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">Selesai</Badge>
              </CardContent>
            </Card>
            <Card className="rounded-[16px] shadow-sm border-[#C8E8F5]">
              <CardContent className="p-[18px_20px]">
                 <div className="text-[11px] text-[#8ABAC8] uppercase tracking-[0.8px] font-mono mb-2">Rata-rata per orang</div>
                 <div className="font-['Syne'] text-[26px] font-bold tracking-[-0.5px] leading-none text-[#1A3A4A]">{fmtCurrency(monthlyStats.average)}</div>
                 <div className="text-[12px] text-[#8ABAC8] mt-1.5">{monthlyStats.trxCount}x pengambilan</div>
                 <Badge className="bg-[#F0FAFF] text-[#4A7A8A] hover:bg-[#F0FAFF] shadow-none mt-2 font-medium px-2 py-0.5 rounded-full text-[11px]">Rata-rata</Badge>
              </CardContent>
            </Card>
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8ABAC8]" />
              <Input 
                className="pl-9 bg-white border-[#C8E8F5] rounded-[10px] text-[13px] h-[38px] placeholder:text-[#8ABAC8]" 
                placeholder="Cari karyawan..." 
                value={searchQ} 
                onChange={e => setSearchQ(e.target.value)} 
              />
            </div>

            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[160px] bg-white border-[#C8E8F5] rounded-[10px] h-[38px] text-[13px]">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="deducted">Sudah dipotong</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[180px] bg-white border-[#C8E8F5] rounded-[10px] h-[38px] text-[13px]">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {monthsList.map(m => (
                  <SelectItem key={m.val} value={m.val}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-1 bg-[#F0FAFF] border border-[#C8E8F5] rounded-[10px] p-1 ml-auto">
              {(['all', 'minggu', 'hari'] as const).map(t => (
                <button
                  key={t}
                  className={`px-3.5 py-1.5 rounded-[7px] text-[12.5px] transition-all font-sans border-none bg-none cursor-pointer ${
                    tabFilter === t 
                      ? 'bg-white text-[#1A3A4A] font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]' 
                      : 'text-[#4A7A8A] hover:bg-[#E4F4FD]'
                  }`}
                  onClick={() => setTabFilter(t)}
                >
                  {t === 'all' ? 'Semua' : t === 'minggu' ? 'Minggu ini' : 'Hari ini'}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <Card className="rounded-[16px] border-[#C8E8F5] shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#E4F4FD]">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Karyawan</TableHead>
                    <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Tanggal</TableHead>
                    <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Jumlah</TableHead>
                    <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Alasan</TableHead>
                    <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Status</TableHead>
                    <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap">Saldo kasbon</TableHead>
                    <TableHead className="h-auto py-3 px-[18px] font-mono text-[11px] text-[#8ABAC8] font-medium tracking-[0.8px] uppercase whitespace-nowrap"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKasbon.map((row, i) => {
                    const c = AV_COLORS[i % AV_COLORS.length]
                    return (
                      <TableRow key={row.id} className="border-b border-[#C8E8F5] last:border-none hover:bg-[#FAFAF8]">
                        <TableCell className="py-3.5 px-[18px]">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-['Syne'] text-[12px] font-bold" style={{ backgroundColor: c.bg, color: c.fg }}>
                              <AvatarFallback className="bg-transparent">{initials(row.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-[13.5px] text-[#1A3A4A]">{row.name}</div>
                              <div className="text-[11.5px] text-[#8ABAC8] font-mono">{row.empId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-[18px]">
                          <span className="font-mono text-[12.5px] text-[#4A7A8A]">{row.date}</span>
                        </TableCell>
                        <TableCell className="py-3.5 px-[18px]">
                          <span className="font-mono font-medium text-[13.5px] text-[#F5A940]">− {fmtCurrency(row.amount)}</span>
                        </TableCell>
                        <TableCell className="py-3.5 px-[18px]">
                          <span className="text-[12.5px] text-[#4A7A8A] max-w-[160px] block truncate" title={row.note}>
                            {row.note || <em className="text-[#8ABAC8] font-light">Tidak ada catatan</em>}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-[18px]">
                          {row.status === 'pending' && (
                            <Badge className="bg-[#FAF0E1] text-[#E89E3A] hover:bg-[#FAF0E1] shadow-none font-medium px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E89E3A]" /> Menunggu
                            </Badge>
                          )}
                          {row.status === 'approved' && (
                            <Badge className="bg-[#E2F0E8] text-[#3AAD7A] hover:bg-[#E2F0E8] shadow-none font-medium px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3AAD7A]" /> Disetujui
                            </Badge>
                          )}
                          {row.status === 'deducted' && (
                            <Badge className="bg-[#F0FAFF] text-[#4A7A8A] hover:bg-[#F0FAFF] shadow-none font-medium px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8ABAC8]" /> Dipotong
                            </Badge>
                          )}
                          {row.status === 'rejected' && (
                            <Badge className="bg-[#F87171]/10 text-[#F87171] hover:bg-[#F87171]/10 shadow-none font-medium px-2.5 py-1 rounded-full text-[12px] whitespace-nowrap gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" /> Ditolak
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 px-[18px]">
                          <span className={`font-mono font-medium text-[13.5px] ${row.balance > 0 ? 'text-[#F5A940]' : 'text-[#8ABAC8]'}`}>
                            {row.balance > 0 ? fmtCurrency(row.balance) : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-[18px]">
                          {row.status === 'pending' ? (
                            <div className="flex gap-1.5">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-[28px] text-[12px] px-3 rounded-[7px] bg-[#E2F0E8] border-[#b8dfc8] text-[#3AAD7A] hover:bg-[#d0ead9] hover:text-[#3AAD7A] disabled:opacity-50"
                                onClick={() => handleApprove(row.id)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-[28px] text-[12px] px-3 rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF] disabled:opacity-50"
                                onClick={() => handleReject(row.id)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                Tolak
                              </Button>
                            </div>
                          ) : row.status === 'approved' ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-[28px] text-[12px] px-3 rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A] hover:bg-[#F0FAFF] whitespace-nowrap disabled:opacity-50"
                              onClick={() => handleMarkDeducted(row.id)}
                              disabled={markDeductedMutation.isPending}
                            >
                              Tandai dipotong
                            </Button>
                          ) : (
                            <span className="text-[12px] text-[#8ABAC8] font-mono">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredKasbon.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-10 text-center text-[#8ABAC8]">
                        Tidak ada data transaksi kasbon
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between p-[14px_18px] border-t border-[#C8E8F5] text-[12.5px] text-[#8ABAC8]">
              <span>Menampilkan {filteredKasbon.length} transaksi</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A]"><ChevronLeft className="w-4 h-4"/></Button>
                <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#1A3A4A] bg-[#1A3A4A] text-white hover:bg-[#1A3A4A] hover:text-white">1</Button>
                <Button variant="outline" size="icon" className="w-[30px] h-[30px] rounded-[7px] border-[#C8E8F5] text-[#4A7A8A] hover:text-[#1A3A4A]"><ChevronRight className="w-4 h-4"/></Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* MODAL TAMBAH KASBON */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[460px] p-0 border-[#C8E8F5] rounded-[16px] overflow-hidden gap-0">
          <form onSubmit={handleCreateKasbon}>
            <DialogHeader className="p-8 pb-6 bg-white">
              <DialogTitle className="font-['Syne'] text-[20px] font-bold text-[#1A3A4A] mb-1">Tambah Kasbon</DialogTitle>
              <DialogDescription className="text-[13px] text-[#4A7A8A]">
                Catat pengambilan gaji di muka karyawan secara manual
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 pt-0 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Karyawan</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]">
                    <SelectValue placeholder="Pilih karyawan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.emp_id})
                      </SelectItem>
                    ))}
                    {employees.length === 0 && (
                      <div className="p-2 text-center text-xs text-[#8ABAC8]">Tidak ada karyawan aktif</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Jumlah (Rp)</label>
                  <Input 
                    type="number" 
                    placeholder="200000" 
                    required 
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Tanggal</label>
                  <Input 
                    type="date" 
                    required 
                    value={dateInput}
                    onChange={e => setDateInput(e.target.value)}
                    className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Kategori</label>
                <Select value={categoryInput} onValueChange={setCategoryInput}>
                  <SelectTrigger className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]">
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                    <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                    <SelectItem value="Kebutuhan rumah">Kebutuhan rumah</SelectItem>
                    <SelectItem value="Transportasi">Transportasi</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-[12px] text-[#4A7A8A] font-medium tracking-[0.2px]">Alasan / catatan</label>
                <Input 
                  type="text" 
                  placeholder="Keperluan darurat, biaya sekolah, dll..." 
                  value={reasonInput}
                  onChange={e => setReasonInput(e.target.value)}
                  className="rounded-[10px] border-[#C8E8F5] h-[42px] text-[13.5px]" 
                />
              </div>
            </div>
            <DialogFooter className="p-6 pt-0 bg-white gap-2.5 sm:justify-end">
              <Button type="button" variant="ghost" className="rounded-[10px] text-[#4A7A8A] hover:text-[#1A3A4A] h-[42px] px-6" onClick={() => setShowModal(false)}>Batal</Button>
              <Button 
                type="submit" 
                disabled={addKasbonMutation.isPending}
                className="rounded-[10px] bg-[#F5A940] hover:bg-[#e09833] text-white h-[42px] px-6"
              >
                {addKasbonMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}