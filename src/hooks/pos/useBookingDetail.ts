import { useMemo } from 'react'
import { usePosStore } from '@/data/pos-store'
import { calculateBilling } from '@/utils/pos.utils'
import type { Booking, BillingCalculation } from '@/types/pos'

export function useBookingDetail(bookingId?: string) {
  const store = usePosStore()

  const booking: Booking | undefined = useMemo(() => {
    if (!bookingId) return undefined
    return store.getBookingById(bookingId)
  }, [bookingId, store.bookings, store.cats, store.owners, store.transactions, store.dailyReports])

  const billing: BillingCalculation | undefined = useMemo(() => {
    if (!booking) return undefined
    return calculateBilling(booking)
  }, [booking])

  return {
    booking,
    billing,
    isLoading: false,
  }
}
