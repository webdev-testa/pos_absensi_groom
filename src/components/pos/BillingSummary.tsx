import { Card } from '@/components/ui/card'
import { formatRupiah } from '@/utils/pos.utils'
import type { Booking, BillingCalculation } from '@/types/pos'
import { Receipt, Calendar, CreditCard, PlusCircle } from 'lucide-react'

interface BillingSummaryProps {
  booking?: Booking
  billing: BillingCalculation
  extraCharges?: { jumlah: number; keterangan?: string }[]
  className?: string
}

export function BillingSummary({
  booking,
  billing,
  extraCharges = [],
  className = '',
}: BillingSummaryProps) {
  const existingBiayaTambahan =
    booking?.transactions?.filter(t => t.tipe === 'biaya_tambahan') || []

  return (
    <Card
      className={`bg-white border border-border rounded-2xl p-5 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border/80 text-ink">
        <Receipt className="w-4 h-4 text-brand-orange" />
        <h3 className="text-sm font-heading font-bold">Rincian Tagihan & Biaya</h3>
      </div>

      <div className="space-y-2.5 text-xs font-sans">
        {/* Subtotal Days x Rate */}
        <div className="flex items-center justify-between text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-ink-subtle" />
            Sewa Kamar ({billing.jumlah_malam} malam × Rp{' '}
            {formatRupiah(booking?.harga_per_hari || 0)})
          </span>
          <span className="font-mono font-semibold text-ink">
            Rp {formatRupiah(billing.subtotal)}
          </span>
        </div>

        {/* Existing Additional Fees */}
        {existingBiayaTambahan.map((tx, idx) => (
          <div
            key={tx.id || idx}
            className="flex items-center justify-between text-ink-muted pl-4 border-l-2 border-amber-200"
          >
            <span className="truncate pr-2">
              Biaya Tambahan: {tx.keterangan || 'Layanan Tambahan'}
            </span>
            <span className="font-mono font-medium text-ink shrink-0">
              + Rp {formatRupiah(tx.jumlah)}
            </span>
          </div>
        ))}

        {/* New Unsaved Additional Fees */}
        {extraCharges.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-amber-800 bg-amber-50/70 px-2 py-1 rounded-md"
          >
            <span className="flex items-center gap-1 truncate pr-2 font-medium">
              <PlusCircle className="w-3 h-3 text-amber-600 shrink-0" />
              {item.keterangan || 'Biaya Tambahan Baru'}
            </span>
            <span className="font-mono font-semibold shrink-0">
              + Rp {formatRupiah(item.jumlah)}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="pt-2 border-t border-hairline flex items-center justify-between font-semibold text-ink text-sm">
          <span>Total Tagihan</span>
          <span className="font-mono text-base font-bold text-primary">
            Rp {formatRupiah(billing.total)}
          </span>
        </div>

        {/* DP paid */}
        <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 px-3 py-2 rounded-xl">
          <span className="flex items-center gap-1.5 font-medium">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            DP / Uang Muka yang Dibayar
          </span>
          <span className="font-mono font-bold">
            - Rp {formatRupiah(billing.total_dp)}
          </span>
        </div>

        {/* Sisa Bayar */}
        <div className="flex items-center justify-between text-ink bg-surface-soft p-3.5 rounded-xl border border-hairline">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-ink-muted font-semibold">
              Sisa Pelunasan
            </div>
            <div className="text-[10px] text-ink-subtle">
              {billing.sisa_bayar <= 0 ? 'Sudah Lunas' : 'Wajib dibayar saat checkout'}
            </div>
          </div>
          <div className="text-right">
            <span
              className={`font-mono text-lg font-bold ${
                billing.sisa_bayar > 0 ? 'text-brand-orange' : 'text-emerald-600'
              }`}
            >
              Rp {formatRupiah(billing.sisa_bayar)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
