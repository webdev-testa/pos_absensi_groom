import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  Phone,
  FileCheck,
  FileEdit,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { formatTanggalPendek, formatRupiah, hitungMalam } from '@/utils/pos.utils'
import type { Booking } from '@/types/pos'

interface ActiveBookingCardProps {
  booking: Booking
  today: string
  tomorrow: string
  onQuickReport?: (booking: Booking) => void
}

export function ActiveBookingCard({
  booking,
  today,
  tomorrow,
  onQuickReport,
}: ActiveBookingCardProps) {
  const cat = booking.cat
  const owner = booking.owner

  // Calculate day number (e.g. Hari ke-3)
  const daysStayed = hitungMalam(booking.tanggal_masuk, today)
  const isCheckoutToday = booking.tanggal_keluar_estimasi === today
  const isCheckoutTomorrow = booking.tanggal_keluar_estimasi === tomorrow
  const isOverdue = booking.tanggal_keluar_estimasi < today

  return (
    <Card className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {booking.sudah_laporan ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                <FileCheck className="w-3 h-3" />
                Sudah Laporan Hari Ini
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 animate-pulse">
                <FileEdit className="w-3 h-3" />
                Belum Laporan Hari Ini
              </span>
            )}

            {isCheckoutToday && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60">
                🔔 Keluar Hari Ini
              </span>
            )}
            {isCheckoutTomorrow && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60">
                ⏳ Keluar Besok
              </span>
            )}
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800">
                ⚠️ Lewat Estimasi
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono font-medium text-muted-foreground bg-surface-soft px-2 py-0.5 rounded-md shrink-0">
            Hari ke-{daysStayed}
          </span>
        </div>

        {/* Cat & Owner Main Details */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-soft border border-border shrink-0 shadow-xs">
            {cat?.foto_url ? (
              <img
                src={cat.foto_url}
                alt={cat.nama}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl bg-amber-500/10">
                🐾
              </div>
            )}
            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-mono py-0.5 uppercase tracking-wider">
              {cat?.jenis_kelamin || 'Kucing'}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <Link
                to={`/admin/pos/kucing/${booking.id}`}
                className="text-base font-heading font-bold text-foreground hover:text-brand-orange transition-colors truncate"
              >
                {cat?.nama || 'Tanpa Nama'}
              </Link>
            </div>
            <div className="text-xs text-muted-foreground truncate font-medium">
              {cat?.ras || 'Domestik'} {cat?.warna ? `• ${cat.warna}` : ''}
            </div>

            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-foreground/80">
              <span className="font-semibold text-primary truncate">
                {owner?.nama || 'Owner'}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-0.5">
                <Phone className="w-2.5 h-2.5" />
                {owner?.no_wa || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Stay & Package Info */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-surface-soft border border-border rounded-xl mb-4 text-xs">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
              Paket
            </div>
            <div className="font-semibold text-foreground flex items-center gap-1 mt-0.5 truncate">
              <Sparkles className="w-3 h-3 text-brand-orange shrink-0" />
              {booking.paket}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono tabular-nums">
              Rp {formatRupiah(booking.harga_per_hari)}/hr
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
              Periode
            </div>
            <div className="text-[11px] text-foreground font-medium flex items-center gap-1 mt-0.5 truncate">
              <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
              {formatTanggalPendek(booking.tanggal_masuk)}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
              <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
              s/d {formatTanggalPendek(booking.tanggal_keluar_estimasi)}
            </div>
          </div>
        </div>

        {booking.catatan && (
          <div className="text-[11px] text-muted-foreground italic line-clamp-1 mb-4 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            &quot;{booking.catatan}&quot;
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="pt-2 border-t border-border flex items-center gap-2">
        {onQuickReport && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onQuickReport(booking)}
            className={`flex-1 text-xs h-8.5 font-medium cursor-pointer rounded-xl ${
              booking.sudah_laporan
                ? 'border-border text-muted-foreground hover:text-foreground'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-none shadow-xs'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 mr-1" />
            {booking.sudah_laporan ? 'Edit Laporan' : 'Buat Laporan'}
          </Button>
        )}

        <Link to={`/admin/pos/kucing/${booking.id}`} className="flex-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs h-8.5 border-border hover:bg-surface-soft text-foreground font-medium cursor-pointer rounded-xl"
          >
            Detail
            <ArrowRight className="w-3 h-3 ml-1 text-muted-foreground" />
          </Button>
        </Link>

        <Link to={`/admin/pos/check-out`}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            title="Check Out Kucing Ini"
            className="text-xs h-8.5 px-2.5 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer rounded-xl"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
