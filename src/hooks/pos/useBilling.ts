import { useMemo } from 'react'
import { calculateBilling } from '@/utils/pos.utils'
import type { Booking, BillingCalculation } from '@/types/pos'

export function useBilling(
  booking?: Booking,
  checkoutDate?: string,
  extraCharges: { jumlah: number; keterangan?: string }[] = []
): BillingCalculation {
  return useMemo(() => {
    if (!booking) {
      return {
        jumlah_malam: 0,
        subtotal: 0,
        total_dp: 0,
        total_biaya_tambahan: 0,
        total: 0,
        sisa_bayar: 0,
      }
    }
    return calculateBilling(booking, checkoutDate, extraCharges)
  }, [booking, checkoutDate, extraCharges])
}
