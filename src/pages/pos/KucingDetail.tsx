import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBookingDetail } from '@/hooks/pos/useBookingDetail'
import { BillingSummary } from '@/components/pos/BillingSummary'
import { WaTemplateModal } from '@/components/pos/WaTemplateModal'
import { StrukPdf } from '@/components/pos/StrukPdf'
import { formatTanggal, formatRupiah } from '@/utils/pos.utils'
import {
  ArrowLeft,
  Calendar,
  MessageCircle,
  CreditCard,
  Printer,
  Sparkles,
  HeartPulse,
  Utensils,
  Droplets,
  LogOut,
} from 'lucide-react'

export default function KucingDetail() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { booking, billing, isLoading } = useBookingDetail(bookingId)

  const [isWaModalOpen, setIsWaModalOpen] = useState(false)
  const [isStrukOpen, setIsStrukOpen] = useState(false)

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-12 text-center bg-card rounded-2xl border border-border flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">Memuat detail anabul...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!booking) {
    return (
      <AdminLayout>
        <div className="p-12 text-center bg-card rounded-2xl border border-border">
          <div className="text-3xl mb-2">🔍</div>
          <h2 className="text-base font-bold text-foreground">Data Tamu Tidak Ditemukan</h2>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Booking ID #{bookingId} tidak terdaftar di sistem.
          </p>
          <Link to="/admin/pos">
            <Button variant="outline" size="sm" className="text-xs rounded-xl">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const cat = booking.cat
  const owner = booking.owner
  const reports = booking.daily_reports || []
  const transactions = booking.transactions || []

  return (
    <AdminLayout>
      <div className="font-sans text-foreground space-y-6 pb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <Link to="/admin/pos">
              <Button
                variant="outline"
                size="sm"
                aria-label="Kembali ke Dashboard Kucing"
                title="Kembali ke Dashboard Kucing"
                className="h-10 w-10 p-0 rounded-xl border-border hover:bg-surface-soft cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                <Sparkles className="w-3.5 h-3.5" />
                Cat Boarding Timeline & History
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight flex items-center gap-2">
                <span>{cat?.nama}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    booking.status === 'aktif'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                      : 'bg-surface-soft text-muted-foreground border border-border'
                  }`}
                >
                  {booking.status === 'aktif' ? 'Sedang Menginap' : 'Selesai'}
                </span>
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWaModalOpen(true)}
              className="text-xs h-10 gap-1.5 border-emerald-200 dark:border-emerald-800/60 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer text-emerald-800 dark:text-emerald-300 rounded-xl"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Template WA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStrukOpen(true)}
              className="text-xs h-10 gap-1.5 border-border font-medium hover:bg-surface-soft cursor-pointer rounded-xl"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              Cetak Struk
            </Button>
            {booking.status === 'aktif' && (
              <Link to="/admin/pos/check-out">
                <Button
                  size="sm"
                  className="text-xs h-10 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer rounded-xl shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Proses Check-Out
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* TOP PROFILE & SUMMARY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Cat & Owner Profile */}
          <Card className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-soft border border-border shrink-0 shadow-xs">
                {cat?.foto_url ? (
                  <img
                    src={cat.foto_url}
                    alt={cat.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-amber-500/10">
                    🐾
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-heading font-bold text-foreground truncate">
                  {cat?.nama}
                </h2>
                <div className="text-xs text-muted-foreground">
                  {cat?.ras || 'Domestik'} • {cat?.jenis_kelamin || 'Jantan'}
                </div>
                <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                  Warna: {cat?.warna || '-'} • Usia: {cat?.umur_estimasi || '-'}
                </div>
              </div>
            </div>

            {cat?.catatan_kesehatan && (
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <div className="font-semibold flex items-center gap-1 mb-0.5">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  Catatan Kesehatan
                </div>
                {cat.catatan_kesehatan}
              </div>
            )}

            {/* Owner Section */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold">
                Informasi Pemilik
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">{owner?.nama}</span>
                <a
                  href={`https://wa.me/${owner?.no_wa.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold hover:underline"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {owner?.no_wa}
                </a>
              </div>
              {owner?.alamat && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  📍 {owner.alamat}
                </p>
              )}
            </div>

            {/* Booking Meta */}
            <div className="pt-3 border-t border-border space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Paket Kamar:</span>
                <span className="font-semibold text-foreground">{booking.paket}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tanggal Masuk:</span>
                <span className="font-mono text-foreground">
                  {formatTanggal(booking.tanggal_masuk)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tanggal Keluar:</span>
                <span className="font-mono text-foreground">
                  {formatTanggal(
                    booking.tanggal_keluar_aktual || booking.tanggal_keluar_estimasi
                  )}
                </span>
              </div>
            </div>
          </Card>

          {/* Col 2 & 3: Billing Summary & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {billing && (
              <BillingSummary booking={booking} billing={billing} />
            )}

            {/* Transactions Log */}
            <Card className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border text-foreground">
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-heading font-bold">
                  Riwayat Pembayaran & Transaksi
                </h3>
              </div>

              {transactions.length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada transaksi tercatat.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2.5 bg-surface-soft rounded-xl"
                    >
                      <div>
                        <span
                          className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold mr-2 ${
                            tx.tipe === 'dp'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : tx.tipe === 'pelunasan'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {tx.tipe}
                        </span>
                        <span className="text-foreground font-medium">
                          {tx.keterangan || 'Transaksi Penitipan'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-foreground tabular-nums">
                        Rp {formatRupiah(tx.jumlah)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* DAILY REPORTS TIMELINE */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-bold text-foreground">
                Timeline Laporan Harian ({reports.length} Catatan)
              </h2>
              <p className="text-xs text-muted-foreground">
                Riwayat kondisi nafsu makan, minum, feses, dan urinasi selama menginap.
              </p>
            </div>

            <Link to="/admin/pos/laporan">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8.5 border-border hover:bg-surface-soft cursor-pointer rounded-xl"
              >
                + Buat Laporan Baru
              </Button>
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground">
                Belum ada laporan harian yang dicatat untuk periode menginap ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep, idx) => (
                <Card
                  key={rep.id || idx}
                  className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-orange" />
                      <span className="font-heading font-bold text-sm text-foreground">
                        {formatTanggal(rep.tanggal)}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                      ✓ Tercatat oleh Pet Caregiver
                    </span>
                  </div>

                  {/* Health Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-surface-soft rounded-xl">
                      <div className="text-[10px] text-muted-foreground uppercase font-mono flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-brand-orange" />
                        Nafsu Makan
                      </div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {rep.nafsu_makan}
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-soft rounded-xl">
                      <div className="text-[10px] text-muted-foreground uppercase font-mono flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-cyan-600" />
                        Air Minum
                      </div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {rep.minum}
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-soft rounded-xl">
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">
                        💩 Feses (BAB)
                      </div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {rep.feses}
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-soft rounded-xl">
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">
                        🚽 Urinasi (BAK)
                      </div>
                      <div className="font-semibold text-foreground mt-0.5">
                        {rep.urinasi}
                      </div>
                    </div>
                  </div>

                  {/* Notes & Photos */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-1">
                    <div className="flex-1 space-y-1.5 text-xs">
                      {rep.kondisi_umum && (
                        <div>
                          <span className="font-semibold text-foreground">
                            Kondisi Umum:{' '}
                          </span>
                          <span className="text-muted-foreground">{rep.kondisi_umum}</span>
                        </div>
                      )}
                      {rep.keterangan && (
                        <div>
                          <span className="font-semibold text-foreground">
                            Keterangan Tambahan:{' '}
                          </span>
                          <span className="text-muted-foreground">{rep.keterangan}</span>
                        </div>
                      )}
                    </div>

                    {rep.foto_url && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-border shrink-0 shadow-xs">
                        <img
                          src={rep.foto_url}
                          alt="Foto Kucing Hari Ini"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* STRUK PDF MODAL */}
        <StrukPdf
          isOpen={isStrukOpen}
          onClose={() => setIsStrukOpen(false)}
          booking={booking}
        />

        {/* WA TEMPLATE MODAL */}
        <WaTemplateModal
          isOpen={isWaModalOpen}
          onClose={() => setIsWaModalOpen(false)}
          type="checkin"
          data={booking}
          dp={booking.transactions?.find(t => t.tipe === 'dp')?.jumlah || 0}
        />
      </div>
    </AdminLayout>
  )
}
