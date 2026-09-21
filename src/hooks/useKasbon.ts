import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { useAuth } from '@/hooks/useAuth'
import type { KasbonStatus, KasbonMapped, ActiveEmployeeOption } from '@/types/kasbon'

export function useKasbon() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  // Filters & Modal State
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQ = searchParams.get('search') || ''
  const setSearchQ = useCallback((val: string) => {
    setSearchParams(prev => {
      if (val) {
        prev.set('search', val)
      } else {
        prev.delete('search')
      }
      return prev
    }, { replace: true })
  }, [setSearchParams])

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
  const { data: employees = [] } = useQuery<ActiveEmployeeOption[]>({
    queryKey: ['active_employees'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .schema('hr')
        .from('users')
        .select('id, name, emp_id, kasbon_limit')
        .eq('status', 'active')
        .eq('role', 'employee')
        .order('name')

      if (error) {
        console.error('Fetch active employees error:', error)
        throw error
      }
      return (data || []).map((u: Record<string, unknown>) => ({
        id: u.id as string,
        name: (u.name as string) || '',
        emp_id: (u.emp_id as string) || '',
        kasbon_limit: u.kasbon_limit !== undefined && u.kasbon_limit !== null ? Number(u.kasbon_limit) : 0,
      })) as ActiveEmployeeOption[]
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
      return (monthFilter === 'all' || itemPeriod === monthFilter) && r.status !== 'rejected'
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
      queryClient.invalidateQueries({ queryKey: ['employees'] })
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
      queryClient.invalidateQueries({ queryKey: ['employees'] })
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
      queryClient.invalidateQueries({ queryKey: ['employees'] })
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
      queryClient.invalidateQueries({ queryKey: ['employees'] })
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

  const handleApprove = useCallback((id: string) => {
    approveMutation.mutate(id)
  }, [approveMutation])

  const handleReject = useCallback((id: string) => {
    rejectMutation.mutate(id)
  }, [rejectMutation])

  const handleMarkDeducted = useCallback((id: string) => {
    markDeductedMutation.mutate(id)
  }, [markDeductedMutation])

  // Calculate remaining limit for selected employee
  const selectedEmpLimitInfo = useMemo(() => {
    if (!selectedUserId) return null
    const emp = employees.find(e => e.id === selectedUserId)
    if (!emp) return null

    const limit = Number(emp.kasbon_limit) || 0

    // Sum all non-rejected kasbon for this user in the current calendar month
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const used = rawKasbon
      .filter((k: any) => {
        if (k.user_id !== selectedUserId || k.status === 'rejected') return false
        const reqDate = new Date(k.requested_at)
        return reqDate.getFullYear() === currentYear && reqDate.getMonth() === currentMonth
      })
      .reduce((sum: number, k: any) => sum + Number(k.amount), 0)

    return {
      limit,
      used,
      remaining: limit - used
    }
  }, [selectedUserId, employees, rawKasbon])

  const handleCreateKasbon = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) {
      toast.error('Pilih karyawan terlebih dahulu')
      return
    }
    const amt = parseFloat(amountInput.replace(/\./g, ''))
    if (isNaN(amt) || amt <= 0) {
      toast.error('Jumlah kasbon harus valid dan lebih dari 0')
      return
    }

    if (selectedEmpLimitInfo) {
      const remaining = selectedEmpLimitInfo.remaining
      if (amt > remaining) {
        toast.error(`Jumlah kasbon melebihi sisa limit karyawan (Sisa: Rp ${remaining.toLocaleString('id-ID')})`)
        return
      }
    }

    addKasbonMutation.mutate({
      userId: selectedUserId,
      amount: amt,
      reason: reasonInput.trim(),
      date: dateInput,
      category: categoryInput
    })
  }, [selectedUserId, amountInput, reasonInput, dateInput, categoryInput, addKasbonMutation, selectedEmpLimitInfo])

  return {
    searchQ,
    setSearchQ,
    statusFilter,
    setStatusFilter,
    tabFilter,
    setTabFilter,
    monthFilter,
    setMonthFilter,
    showModal,
    setShowModal,
    selectedUserId,
    setSelectedUserId,
    amountInput,
    setAmountInput,
    dateInput,
    setDateInput,
    reasonInput,
    setReasonInput,
    categoryInput,
    setCategoryInput,
    monthsList,
    employees,
    loadingKasbon,
    refetchKasbon,
    monthlyStats,
    filteredKasbon,
    handleApprove,
    handleReject,
    handleMarkDeducted,
    handleCreateKasbon,
    approveMutation,
    rejectMutation,
    markDeductedMutation,
    addKasbonMutation,
    selectedEmpLimitInfo,
  }
}
