import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Printer,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { formatTanggal, formatRupiah, calculateBilling } from '@/utils/pos.utils'
import { BillingSummary } from './BillingSummary'
import type { Booking } from '@/types/pos'

interface ExtraChargeItem {
  keterangan: string
  jumlah: number
}

interface CheckOutFormProps {
  booking: Booking
  onCancel: () => void
  onConfirmCheckout: (data: {
    checkoutDate: string
    extraCharges: ExtraChargeItem[]
    pelunasanAmount: number
    metodeBayar: string
  }) => void
  onPrintPreview?: (booking: Booking) => void
}

export function CheckOutForm({
  booking,
  onCancel,
  onConfirmCheckout,
  onPrintPreview,
}: CheckOutFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [checkoutDate, setCheckoutDate] = useState(today)
  const [extraCharges, setExtraCharges] = useState<ExtraChargeItem[]>([])
  const [newChargeDesc, setNewChargeDesc] = useState('')
  const [newChargeAmount, setNewChargeAmount] = useState<number | ''>('')
  const [metodeBayar, setMetodeBayar] = useState('QRIS')

  // Calculate live billing
  const billing = calculateBilling(booking, checkoutDate, extraCharges)

  const [customPelunasan, setCustomPelunasan] = useState<number | null>(null)
  const pelunasanAmount =
    customPelunasan !== null ? customPelunasan : billing.sisa_bayar

  const handleAddExtraCharge = () => {
    if (!newChargeDesc.trim() || !newChargeAmount || Number(newChargeAmount) <= 0)
      return
    setExtraCharges(prev => [
      ...prev,
      { keterangan: newChargeDesc.trim(), jumlah: Number(newChargeAmount) },
    ])
    setNewChargeDesc('')
    setNewChargeAmount('')
  }

  const handleRemoveExtraCharge = (index: number) => {
    setExtraCharges(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border border-border rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-soft border border-border shrink-0">
            {booking.cat?.foto_url ? (
              <img
                src={booking.cat.foto_url}
                alt={booking.cat.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl bg-amber-500/10">
                🐾
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-heading font-bold text-foreground">
                Check-Out: {booking.cat?.nama}
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                Paket {booking.paket}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Owner: <strong>{booking.owner?.nama}</strong> • WA:{' '}
              <span className="font-mono">{booking.owner?.no_wa}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs h-10 cursor-pointer rounded-xl border-border"
          >
            Pilih Kucing Lain
          </Button>
          {onPrintPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPrintPreview(booking)}
              className="text-xs h-10 gap-1.5 border-border font-medium hover:bg-surface-soft cursor-pointer rounded-xl"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              Cetak Struk
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left 3 cols: Checkout settings & Extra fees */}
        <div className="md:col-span-3 space-y-5">
          {/* Tanggal Checkout */}
          <Card className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider font-mono">
              1. Tanggal Kepulangan / Check-Out
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Tanggal Masuk</label>
                <div className="p-2.5 bg-surface-soft rounded-xl font-mono text-foreground font-semibold">
                  {formatTanggal(booking.tanggal_masuk)}
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">
                  Tanggal Keluar Aktual *
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={checkoutDate}
                    onChange={e => setCheckoutDate(e.target.value)}
                    className="pl-8 h-10 text-xs font-mono bg-card border-input rounded-xl"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Biaya Tambahan */}
          <Card className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider font-mono">
                2. Biaya Tambahan & Layanan Ekstra
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {extraCharges.length} item ditambahkan
              </span>
            </div>

            {/* List of current unsaved extra charges */}
            {extraCharges.length > 0 && (
              <div className="space-y-2 pt-1">
                {extraCharges.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-surface-soft rounded-xl text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-foreground">
                        {item.keterangan}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-primary tabular-nums">
                        Rp {formatRupiah(item.jumlah)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraCharge(idx)}
                        className="text-rose-600 dark:text-rose-400 hover:text-rose-800 p-1 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Extra Charge Inputs */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="Keterangan (cth: Grooming kutu / Snack salmon)"
                value={newChargeDesc}
                onChange={e => setNewChargeDesc(e.target.value)}
                className="text-xs h-10 sm:flex-1 bg-card border-input rounded-xl"
              />
              <Input
                type="number"
                placeholder="Jumlah (Rp)"
                value={newChargeAmount}
                onChange={e =>
                  setNewChargeAmount(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="text-xs h-10 sm:w-32 font-mono bg-card border-input rounded-xl tabular-nums"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddExtraCharge}
                disabled={!newChargeDesc.trim() || !newChargeAmount}
                className="text-xs h-10 border-brand-orange text-brand-orange hover:bg-brand-orange/10 cursor-pointer shrink-0 rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
              </Button>
            </div>
          </Card>

          {/* Pelunasan & Metode Pembayaran */}
          <Card className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-heading font-bold text-foreground uppercase tracking-wider font-mono">
              3. Pelunasan & Metode Bayar
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nominal Pelunasan Diterima (Rp) *
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    value={pelunasanAmount}
                    onChange={e => setCustomPelunasan(Number(e.target.value))}
                    className="pl-8 h-10 text-xs sm:text-sm font-mono font-bold text-primary bg-card border-input rounded-xl tabular-nums"
                  />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Otomatis terisi dari sisa bayar (Rp {formatRupiah(billing.sisa_bayar)})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['QRIS', 'Tunai', 'Transfer'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetodeBayar(m)}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        metodeBayar === m
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                          : 'bg-surface-soft text-muted-foreground border-border hover:bg-card'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 cols: Billing Summary & Confirmation Button */}
        <div className="md:col-span-2 space-y-5">
          <BillingSummary
            booking={booking}
            billing={billing}
            extraCharges={extraCharges}
          />

          <Button
            type="button"
            onClick={() =>
              onConfirmCheckout({
                checkoutDate,
                extraCharges,
                pelunasanAmount,
                metodeBayar,
              })
            }
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Konfirmasi Check-Out & Buka WA
          </Button>

          <div className="p-3 bg-surface-soft border border-border rounded-xl text-[11px] text-muted-foreground leading-relaxed">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange inline mr-1" />
            Setelah konfirmasi, status penitipan akan diubah menjadi{' '}
            <strong className="text-foreground font-semibold">Selesai</strong> dan modal struk WhatsApp siap dikirimkan kepada owner.
          </div>
        </div>
      </div>
    </div>
  )
}
