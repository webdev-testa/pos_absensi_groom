import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDailyReport } from '@/hooks/pos/useDailyReport'
import { DailyReportForm } from '@/components/pos/DailyReportForm'
import { WaTemplateModal } from '@/components/pos/WaTemplateModal'
import { formatTanggal } from '@/utils/pos.utils'
import {
  FileCheck,
  FileEdit,
  ClipboardList,
  Sparkles,
  ArrowLeft,
  Calendar,
  Eye,
} from 'lucide-react'

export default function LaporanHarian() {
  const {
    today,
    filter,
    setFilter,
    activeBookings,
    filteredBookings,
    selectedBooking,
    isFormOpen,
    openReportForm,
    closeReportForm,
    formData,
    setFormData,
    saveReport,
    savedReport,
    isWaModalOpen,
    setIsWaModalOpen,
    pengaturan,
  } = useDailyReport()

  const reportedCount = activeBookings.filter(b => b.sudah_laporan).length
  const unreportedCount = activeBookings.filter(b => !b.sudah_laporan).length

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
                Cat Health & Care Monitoring
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-ink tracking-tight">
                Laporan Harian Kucing 📋
              </h1>
              <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-primary" />
                <span>Tanggal Laporan: <strong>{formatTanggal(today)}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ {reportedCount} Sudah Lapor
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              ⚠️ {unreportedCount} Belum Lapor
            </span>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-1 bg-surface-soft p-1 rounded-xl border border-hairline w-fit">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-ink shadow-xs font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Semua Anabul ({activeBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unreported')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === 'unreported'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Belum Laporan ({unreportedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('reported')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filter === 'reported'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Sudah Laporan ({reportedCount})
          </button>
        </div>

        {/* CAT CARDS GRID */}
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-hairline-strong">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="text-sm font-bold text-ink">Tidak ada kucing pada kategori ini</h3>
            <p className="text-xs text-ink-muted mt-1 mb-4">
              {filter === 'unreported'
                ? 'Luar biasa! Semua kucing telah selesai dibuatkan laporan hari ini.'
                : 'Belum ada data untuk filter yang dipilih.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs"
            >
              Tampilkan Semua
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map(booking => {
              const cat = booking.cat
              const owner = booking.owner
              const todayReport = booking.daily_reports?.find(
                r => r.tanggal === today
              )

              return (
                <Card
                  key={booking.id}
                  className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between mb-3">
                      {booking.sudah_laporan ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FileCheck className="w-3 h-3" />
                          Laporan Hari Ini Siap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                          <FileEdit className="w-3 h-3" />
                          Belum Dibuat
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-ink-muted bg-surface-soft px-2 py-0.5 rounded-md">
                        Paket {booking.paket}
                      </span>
                    </div>

                    {/* Cat Profile */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-soft border border-hairline shrink-0">
                        {cat?.foto_url ? (
                          <img
                            src={cat.foto_url}
                            alt={cat.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl bg-amber-50">
                            🐾
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-heading font-bold text-ink truncate">
                          {cat?.nama}
                        </h3>
                        <div className="text-xs text-ink-muted truncate">
                          {cat?.ras || 'Domestik'} • {cat?.warna || '-'}
                        </div>
                        <div className="text-xs text-primary font-medium mt-1 truncate">
                          Owner: {owner?.nama} ({owner?.no_wa})
                        </div>
                      </div>
                    </div>

                    {/* Today's Health Report Summary if available */}
                    {todayReport ? (
                      <div className="p-3 bg-[#FAF8F5] border border-hairline rounded-xl mb-4 space-y-1.5 text-xs">
                        <div className="flex justify-between text-ink-muted">
                          <span>Nafsu Makan:</span>
                          <span className="font-semibold text-ink truncate max-w-[150px]">
                            {todayReport.nafsu_makan}
                          </span>
                        </div>
                        <div className="flex justify-between text-ink-muted">
                          <span>Air Minum:</span>
                          <span className="font-semibold text-ink">
                            {todayReport.minum}
                          </span>
                        </div>
                        <div className="flex justify-between text-ink-muted">
                          <span>Feses (BAB):</span>
                          <span className="font-semibold text-ink">
                            {todayReport.feses}
                          </span>
                        </div>
                        {todayReport.kondisi_umum && (
                          <div className="pt-1.5 border-t border-hairline text-[11px] text-ink-muted line-clamp-2 italic">
                            &quot;{todayReport.kondisi_umum}&quot;
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl mb-4 text-xs text-amber-900 leading-relaxed">
                        <div className="font-semibold flex items-center gap-1 mb-0.5">
                          <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                          Belum ada catatan kesehatan
                        </div>
                        Isi form nafsu makan, BAB, BAK, dan foto untuk dikirimkan ke owner.
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-hairline flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => openReportForm(booking)}
                      className={`flex-1 text-xs h-9 font-semibold cursor-pointer gap-1.5 ${
                        booking.sudah_laporan
                          ? 'bg-surface-card hover:bg-surface-soft text-ink border border-border'
                          : 'bg-brand-orange hover:bg-brand-accent-hover text-white shadow-xs'
                      }`}
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      {booking.sudah_laporan ? 'Edit Laporan' : 'Tulis Laporan'}
                    </Button>

                    <Link to={`/admin/pos/kucing/${booking.id}`}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-9 px-3 border-hairline hover:bg-surface-soft cursor-pointer"
                        title="Lihat Riwayat Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5 text-ink-muted" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* REPORT FORM MODAL */}
        <DailyReportForm
          isOpen={isFormOpen}
          onClose={closeReportForm}
          booking={selectedBooking}
          today={today}
          formData={formData}
          setFormData={setFormData}
          onSave={saveReport}
        />

        {/* WA TEMPLATE MODAL */}
        <WaTemplateModal
          isOpen={isWaModalOpen}
          onClose={() => setIsWaModalOpen(false)}
          type="daily_report"
          data={selectedBooking}
          report={savedReport}
          namaUsaha={pengaturan.nama_usaha}
        />
      </div>
    </AdminLayout>
  )
}
