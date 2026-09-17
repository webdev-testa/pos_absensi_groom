import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groomingService } from '@/services/groomingService'
import type { GroomingSession, GroomingStep } from '@/types/pos'
import { toast } from 'sonner'

export type GroomingPeriodPreset = 'today' | '7days' | '30days' | 'custom'

export function useGroomingSessions() {
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split('T')[0]

  const [periodPreset, setPeriodPreset] = useState<GroomingPeriodPreset>('today')
  const [selectedDateState, setSelectedDateState] = useState<string>(today)
  const [customStartDate, setCustomStartDate] = useState<string>(today)
  const [customEndDate, setCustomEndDate] = useState<string>(today)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Calculate actual date range based on selected period preset
  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    const formatDate = (d: Date) => d.toISOString().split('T')[0]

    if (periodPreset === 'today') {
      return { startDate: today, endDate: today }
    }
    if (periodPreset === '7days') {
      const past = new Date(now)
      past.setDate(past.getDate() - 6)
      return { startDate: formatDate(past), endDate: today }
    }
    if (periodPreset === '30days') {
      const past = new Date(now)
      past.setDate(past.getDate() - 29)
      return { startDate: formatDate(past), endDate: today }
    }

    // custom range
    const s = customStartDate || selectedDateState || today
    const e = customEndDate || selectedDateState || today
    return {
      startDate: s <= e ? s : e,
      endDate: s <= e ? e : s,
    }
  }, [periodPreset, today, customStartDate, customEndDate, selectedDateState])

  const setSelectedDate = (d: string) => {
    setSelectedDateState(d)
    setCustomStartDate(d)
    setCustomEndDate(d)
    if (d === today) {
      setPeriodPreset('today')
    } else {
      setPeriodPreset('custom')
    }
  }

  const periodLabel = useMemo(() => {
    switch (periodPreset) {
      case 'today':
        return 'Hari Ini'
      case '7days':
        return '7 Hari Terakhir'
      case '30days':
        return '30 Hari Terakhir'
      case 'custom':
        return startDate === endDate ? startDate : `${startDate} s/d ${endDate}`
      default:
        return 'Hari Ini'
    }
  }, [periodPreset, startDate, endDate])

  // Query sessions
  const {
    data: sessions = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<GroomingSession[]>({
    queryKey: ['grooming_sessions', periodPreset, startDate, endDate, statusFilter],
    queryFn: () =>
      groomingService.fetchSessions({
        startDate,
        endDate,
        status: statusFilter,
      }),
    // Live polling only needed when monitoring today's queue
    refetchInterval: periodPreset === 'today' ? 10000 : false,
  })

  // Filtered by search query (cat name or owner name)
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions
    const q = searchQuery.toLowerCase()
    return sessions.filter(
      s =>
        s.cat?.nama?.toLowerCase().includes(q) ||
        s.owner?.nama?.toLowerCase().includes(q) ||
        s.paket?.toLowerCase().includes(q) ||
        s.groomer_name?.toLowerCase().includes(q)
    )
  }, [sessions, searchQuery])

  // Statistics
  const stats = useMemo(() => {
    const antrian = sessions.filter(s => s.status === 'antrian').length
    const dikerjakan = sessions.filter(s => s.status === 'dikerjakan').length
    const selesai = sessions.filter(s => s.status === 'selesai').length
    const dijemput = sessions.filter(s => s.status === 'dijemput').length
    const totalOmset = sessions
      .filter(s => s.status !== 'dibatalkan')
      .reduce((acc, s) => acc + (s.harga || 0), 0)

    return {
      total: sessions.length,
      antrian,
      dikerjakan,
      selesai,
      dijemput,
      totalOmset,
    }
  }, [sessions])

  // Mutation: advance step
  const updateStepMutation = useMutation({
    mutationFn: async ({
      sessionId,
      step,
      catatan,
      foto_url,
    }: {
      sessionId: string
      step: GroomingStep
      catatan?: string
      foto_url?: string
    }) => {
      await groomingService.updateStep(sessionId, step, { catatan, foto_url })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grooming_sessions'] })
      toast.success('Progress grooming berhasil diperbarui!')
    },
    onError: (err: any) => {
      toast.error('Gagal memperbarui progress: ' + err.message)
    },
  })

  // Mutation: mark as picked up
  const markPickedUpMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await groomingService.markPickedUp(sessionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grooming_sessions'] })
      toast.success('Kucing telah ditandai sudah dijemput owner!')
    },
    onError: (err: any) => {
      toast.error('Gagal memperbarui status: ' + err.message)
    },
  })

  return {
    today,
    selectedDate: selectedDateState,
    setSelectedDate,
    periodPreset,
    setPeriodPreset,
    startDate,
    endDate,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    periodLabel,
    isLiveToday: periodPreset === 'today',
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sessions,
    filteredSessions,
    stats,
    isLoading,
    isRefetching,
    refetch,
    updateStep: updateStepMutation.mutateAsync,
    markPickedUp: markPickedUpMutation.mutateAsync,
    isUpdating: updateStepMutation.isPending || markPickedUpMutation.isPending,
  }
}
