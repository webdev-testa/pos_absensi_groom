import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { posService } from '@/services/posService'
import type { Booking } from '@/types/pos'

export function useActiveBookings() {
  const today = new Date().toISOString().split('T')[0]

  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  const {
    data: allBookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Booking[]>({
    queryKey: ['pos_bookings'],
    queryFn: () => posService.fetchBookings(),
    staleTime: 1000 * 30, // 30 seconds
  })

  const activeBookings = useMemo(() => {
    return allBookings.filter(b => b.status === 'aktif')
  }, [allBookings])

  const stats = useMemo(() => {
    const totalActive = activeBookings.length
    const notReportedToday = activeBookings.filter(b => !b.sudah_laporan).length
    const checkoutToday = activeBookings.filter(
      b => b.tanggal_keluar_estimasi === today
    ).length
    const checkoutTomorrow = activeBookings.filter(
      b => b.tanggal_keluar_estimasi === tomorrow
    ).length

    return {
      totalActive,
      notReportedToday,
      checkoutToday,
      checkoutTomorrow,
    }
  }, [activeBookings, today, tomorrow])

  return {
    activeBookings,
    allBookings,
    stats,
    today,
    tomorrow,
    isLoading,
    isError,
    error,
    refetch,
  }
}
