import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { formatTanggal, formatRupiah, calculateBilling } from '@/utils/pos.utils'
import type { Booking, Pengaturan } from '@/types/pos'

interface StrukPdfProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  pengaturan?: Pengaturan
}

export function StrukPdf({
  isOpen,
  onClose,
  booking,
  pengaturan = {
    id: 1,
    nama_usaha: 'Dr. Meow Cat Hotel & Care',
    no_wa_usaha: '081234567890',
    alamat_usaha: 'Jl. Ahmad Yani No. 45, Jakarta Selatan',
  },
}: StrukPdfProps) {
  if (!booking) return null

  const billing = calculateBilling(booking)
  const todayStr = new Date().toISOString()

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] bg-card text-foreground border border-border shadow-2xl p-6 rounded-2xl">
        <DialogHeader className="text-center pb-2 border-b border-border/60">
          <DialogTitle className="text-base font-heading font-bold text-foreground">
            Pratinjau Struk Penitipan
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Struk resmi Dr. Meow Cat Hotel untuk pelanggan
          </DialogDescription>
        </DialogHeader>

        {/* Printable Struk Body */}
        <div
          id="struk-print-area"
          className="p-5 bg-surface-soft border border-border rounded-xl text-xs font-mono text-foreground space-y-3 shadow-inner"
        >
          {/* Clinic Header */}
          <div className="text-center pb-3 border-b border-dashed border-border">
            <div className="text-lg">🐾</div>
            <div className="font-bold text-sm uppercase tracking-wide">
              {pengaturan.nama_usaha}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {pengaturan.alamat_usaha || 'Jakarta'}
            </div>
            <div className="text-[10px] text-muted-foreground">
              WA: {pengaturan.no_wa_usaha || '-'}
            </div>
          </div>

          {/* Struk Metadata */}
          <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Booking:</span>
              <span className="font-bold">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal Cetak:</span>
              <span>{formatTanggal(todayStr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner:</span>
              <span className="font-bold">{booking.owner?.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kucing:</span>
              <span className="font-bold">
                {booking.cat?.nama} ({booking.cat?.ras || 'Domestik'})
              </span>
            </div>
          </div>

          {/* Stay Info */}
          <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paket:</span>
              <span>{booking.paket}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-In:</span>
              <span>{formatTanggal(booking.tanggal_masuk)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-Out:</span>
              <span>
                {formatTanggal(
                  booking.tanggal_keluar_aktual || booking.tanggal_keluar_estimasi
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durasi:</span>
              <span className="font-bold">{billing.jumlah_malam} Malam</span>
            </div>
          </div>

          {/* Billing Breakdown */}
          <div className="space-y-1.5 pt-1 text-[11px]">
            <div className="flex justify-between">
              <span>
                Sewa Kamar ({billing.jumlah_malam}x Rp {formatRupiah(booking.harga_per_hari)})
              </span>
              <span className="tabular-nums">Rp {formatRupiah(billing.subtotal)}</span>
            </div>

            {billing.total_biaya_tambahan > 0 && (
              <div className="flex justify-between text-amber-900 dark:text-amber-300">
                <span>Biaya Tambahan</span>
                <span className="tabular-nums">+ Rp {formatRupiah(billing.total_biaya_tambahan)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold pt-1 border-t border-border text-xs">
              <span>TOTAL</span>
              <span className="tabular-nums">Rp {formatRupiah(billing.total)}</span>
            </div>

            <div className="flex justify-between text-emerald-800 dark:text-emerald-300 font-semibold">
              <span>DP Dibayar</span>
              <span className="tabular-nums">- Rp {formatRupiah(billing.total_dp)}</span>
            </div>

            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-border">
              <span>SISA / LUNAS</span>
              <span className="tabular-nums">Rp {formatRupiah(billing.sisa_bayar)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-border text-[10px] text-muted-foreground">
            <p>Terima kasih atas kepercayaan Anda!</p>
            <p className="mt-0.5">Semoga anabul selalu sehat & ceria 🐱</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs h-10 cursor-pointer flex-1 rounded-xl border-border"
          >
            Tutup
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="text-xs h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer flex-1 gap-1.5 rounded-xl shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
