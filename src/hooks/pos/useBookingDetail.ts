import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { posService } from '@/services/posService'
import { calculateBilling } from '@/utils/pos.utils'
import type { Booking, BillingCalculation } from '@/types/pos'

export function useBookingDetail(bookingId?: string) {
  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Booking | null>({
    queryKey: ['pos_booking', bookingId],
    queryFn: () => (bookingId ? posService.fetchBookingById(bookingId) : Promise.resolve(null)),
    enabled: Boolean(bookingId),
    staleTime: 1000 * 30,
  })

  const billing: BillingCalculation | undefined = useMemo(() => {
    if (!booking) return undefined
    return calculateBilling(booking)
  }, [booking])

  return {
    booking: booking || undefined,
    billing,
    isLoading,
    isError,
    error,
    refetch,
  }
}
