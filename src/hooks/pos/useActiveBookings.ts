import { useMemo } from 'react'
import { usePosStore } from '@/data/pos-store'

export function useActiveBookings() {
  const store = usePosStore()
  const today = new Date().toISOString().split('T')[0]

  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  const fullBookings = useMemo(() => {
    return store.getFullBookings()
  }, [store.bookings, store.cats, store.owners, store.transactions, store.dailyReports])

  const activeBookings = useMemo(() => {
    return fullBookings.filter(b => b.status === 'aktif')
  }, [fullBookings])

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
    allBookings: fullBookings,
    stats,
    today,
    tomorrow,
    isLoading: false,
  }
}
