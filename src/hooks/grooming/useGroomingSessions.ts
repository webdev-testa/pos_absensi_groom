import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groomingService } from '@/services/groomingService'
import type { GroomingSession, GroomingStep } from '@/types/pos'
import { toast } from 'sonner'

export function useGroomingSessions() {
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split('T')[0]

  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Query sessions
  const {
    data: sessions = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<GroomingSession[]>({
    queryKey: ['grooming_sessions', selectedDate, statusFilter],
    queryFn: () =>
      groomingService.fetchSessions({
        date: selectedDate,
        status: statusFilter,
      }),
    refetchInterval: 10000, // Poll every 10 seconds for live updates
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
    selectedDate,
    setSelectedDate,
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
