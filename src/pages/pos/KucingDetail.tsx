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
  const { booking, billing } = useBookingDetail(bookingId)

  const [isWaModalOpen, setIsWaModalOpen] = useState(false)
  const [isStrukOpen, setIsStrukOpen] = useState(false)

  if (!booking) {
    return (
      <AdminLayout>
        <div className="p-12 text-center bg-white rounded-2xl border border-border">
          <div className="text-3xl mb-2">🔍</div>
          <h2 className="text-base font-bold text-ink">Data Tamu Tidak Ditemukan</h2>
          <p className="text-xs text-ink-muted mt-1 mb-4">
            Booking ID #{bookingId} tidak terdaftar di sistem.
          </p>
          <Link to="/admin/pos">
            <Button variant="outline" size="sm" className="text-xs">
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
      <div className="font-sans text-ink space-y-6 pb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <Link to="/admin/pos">
              <Button
                variant="outline"
                size="sm"
                aria-label="Kembali ke Dashboard Kucing"
                title="Kembali ke Dashboard Kucing"
                className="h-9 w-9 p-0 rounded-xl border-hairline hover:bg-surface-soft cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-ink" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                <Sparkles className="w-3.5 h-3.5" />
                Cat Boarding Timeline & History
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-ink tracking-tight flex items-center gap-2">
                <span>{cat?.nama}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    booking.status === 'aktif'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-surface-soft text-ink-muted border border-hairline'
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
              className="text-xs h-9 gap-1.5 border-hairline font-medium hover:bg-surface-soft cursor-pointer text-emerald-700"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Template WA
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStrukOpen(true)}
              className="text-xs h-9 gap-1.5 border-hairline font-medium hover:bg-surface-soft cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              Cetak Struk
            </Button>
            {booking.status === 'aktif' && (
              <Link to="/admin/pos/check-out">
                <Button
                  size="sm"
                  className="text-xs h-9 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer"
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
          <Card className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-soft border border-hairline shrink-0 shadow-xs">
                {cat?.foto_url ? (
                  <img
                    src={cat.foto_url}
                    alt={cat.nama}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-amber-50">
                    🐾
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-heading font-bold text-ink truncate">
                  {cat?.nama}
                </h2>
                <div className="text-xs text-ink-muted">
                  {cat?.ras || 'Domestik'} • {cat?.jenis_kelamin || 'Jantan'}
                </div>
                <div className="text-[11px] text-ink-subtle mt-0.5">
                  Warna: {cat?.warna || '-'} • Usia: {cat?.umur_estimasi || '-'}
                </div>
              </div>
            </div>

            {cat?.catatan_kesehatan && (
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 leading-relaxed">
                <div className="font-semibold flex items-center gap-1 mb-0.5">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-700" />
                  Catatan Kesehatan
                </div>
                {cat.catatan_kesehatan}
              </div>
            )}

            {/* Owner Section */}
            <div className="pt-3 border-t border-hairline space-y-2">
              <div className="text-[10px] uppercase font-mono tracking-wider text-ink-muted font-semibold">
                Informasi Pemilik
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink">{owner?.nama}</span>
                <a
                  href={`https://wa.me/${owner?.no_wa.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  {owner?.no_wa}
                </a>
              </div>
              {owner?.alamat && (
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  📍 {owner.alamat}
                </p>
              )}
            </div>

            {/* Booking Meta */}
            <div className="pt-3 border-t border-hairline space-y-1.5 text-xs">
              <div className="flex justify-between text-ink-muted">
                <span>Paket Kamar:</span>
                <span className="font-semibold text-ink">{booking.paket}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Tanggal Masuk:</span>
                <span className="font-mono text-ink">
                  {formatTanggal(booking.tanggal_masuk)}
                </span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Tanggal Keluar:</span>
                <span className="font-mono text-ink">
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
            <Card className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border text-ink">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-heading font-bold">
                  Riwayat Pembayaran & Transaksi
                </h3>
              </div>

              {transactions.length === 0 ? (
                <p className="text-xs text-ink-muted">Belum ada transaksi tercatat.</p>
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
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.tipe === 'pelunasan'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.tipe}
                        </span>
                        <span className="text-ink font-medium">
                          {tx.keterangan || 'Transaksi Penitipan'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-primary">
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
              <h2 className="text-base font-heading font-bold text-ink">
                Timeline Laporan Harian ({reports.length} Catatan)
              </h2>
              <p className="text-xs text-ink-muted">
                Riwayat kondisi nafsu makan, minum, feses, dan urinasi selama menginap.
              </p>
            </div>

            <Link to="/admin/pos/laporan">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8.5 border-hairline hover:bg-surface-soft cursor-pointer"
              >
                + Buat Laporan Baru
              </Button>
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-hairline-strong">
              <p className="text-xs text-ink-muted">
                Belum ada laporan harian yang dicatat untuk periode menginap ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep, idx) => (
                <Card
                  key={rep.id || idx}
                  className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hairline">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-orange" />
                      <span className="font-heading font-bold text-sm text-ink">
                        {formatTanggal(rep.tanggal)}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ✓ Tercatat oleh Pet Caregiver
                    </span>
                  </div>

                  {/* Health Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-surface-soft rounded-xl">
                      <div className="text-[10px] text-ink-muted uppercase font-mono flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-brand-orange" />
                        Nafsu Makan
                      </div>
                      <div className="font-semibold text-ink mt-0.5">
                        {rep.nafsu_makan}
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-soft rounded-xl">
                      <div className="text-[10px] text-ink-muted uppercase font-mono flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-cyan-600" />
                        Air Minum
                      </div>
                      <div className="font-semibold text-ink mt-0.5">
                        {rep.minum}
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-soft rounded-xl">
                      <div className="text-[10px] text-ink-muted uppercase font-mono">
                        💩 Feses (BAB)
                      </div>
                      <div className="font-semibold text-ink mt-0.5">
                        {rep.feses}
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-soft rounded-xl">
                      <div className="text-[10px] text-ink-muted uppercase font-mono">
                        🚽 Urinasi (BAK)
                      </div>
                      <div className="font-semibold text-ink mt-0.5">
                        {rep.urinasi}
                      </div>
                    </div>
                  </div>

                  {/* Notes & Photos */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-1">
                    <div className="flex-1 space-y-1.5 text-xs">
                      {rep.kondisi_umum && (
                        <div>
                          <span className="font-semibold text-ink">
                            Kondisi Umum:{' '}
                          </span>
                          <span className="text-ink-muted">{rep.kondisi_umum}</span>
                        </div>
                      )}
                      {rep.keterangan && (
                        <div>
                          <span className="font-semibold text-ink">
                            Keterangan Tambahan:{' '}
                          </span>
                          <span className="text-ink-muted">{rep.keterangan}</span>
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
