import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useActiveBookings } from '@/hooks/pos/useActiveBookings'
import { useDailyReport } from '@/hooks/pos/useDailyReport'
import { ActiveBookingCard } from '@/components/pos/ActiveBookingCard'
import { DailyReportForm } from '@/components/pos/DailyReportForm'
import { WaTemplateModal } from '@/components/pos/WaTemplateModal'
import { formatTanggal } from '@/utils/pos.utils'
import {
  PlusCircle,
  ClipboardList,
  AlertCircle,
  LogOut,
  Sparkles,
  Calendar,
} from 'lucide-react'

export default function PosDashboard() {
  const { activeBookings, stats, today, tomorrow } = useActiveBookings()
  const {
    openReportForm,
    closeReportForm,
    isFormOpen,
    selectedBooking,
    formData,
    setFormData,
    saveReport,
    savedReport,
    isWaModalOpen,
    setIsWaModalOpen,
    pengaturan,
  } = useDailyReport()

  const [activeTab, setActiveTab] = useState<'all' | 'unreported' | 'today_checkout'>('all')

  const displayedBookings = activeBookings.filter(b => {
    if (activeTab === 'unreported') return !b.sudah_laporan
    if (activeTab === 'today_checkout') return b.tanggal_keluar_estimasi === today
    return true
  })

  return (
    <AdminLayout>
      <div className="font-sans text-foreground space-y-6 pb-12">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
              <Sparkles className="w-3.5 h-3.5" />
              Cat Boarding & Care Module
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight mt-0.5">
              Dashboard Penitipan Kucing 🐱
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Hari ini: <strong>{formatTanggal(today)}</strong></span>
              <span>•</span>
              <span>Klinik Dr. Meow</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/admin/pos/laporan">
              <Button
                variant="outline"
                className="h-10 text-xs sm:text-sm border-border font-medium hover:bg-surface-soft cursor-pointer rounded-xl"
              >
                <ClipboardList className="w-4 h-4 mr-1.5 text-primary" />
                Laporan Harian
              </Button>
            </Link>
            <Link to="/admin/pos/check-in">
              <Button className="h-10 text-xs sm:text-sm bg-brand-orange hover:bg-brand-accent-hover text-white font-semibold shadow-xs cursor-pointer rounded-xl">
                <PlusCircle className="w-4 h-4 mr-1.5"/>
                Check-In Kucing Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* STAT METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Aktif */}
          <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Kucing Menginap
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-brand-orange flex items-center justify-center text-base">
                🐾
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
              {stats.totalActive}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Total anabul aktif saat ini</p>
          </Card>

          {/* Belum Laporan */}
          <Card
            onClick={() => setActiveTab('unreported')}
            className={`border rounded-2xl p-4 sm:p-5 shadow-xs cursor-pointer transition-all ${
              stats.notReportedToday > 0
                ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300/80 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-900 dark:text-amber-200 uppercase tracking-wider font-semibold">
                Belum Laporan
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-200 tabular-nums">
              {stats.notReportedToday}
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-1">
              {stats.notReportedToday === 0
                ? 'Semua kucing sudah dilaporkan hari ini! 🎉'
                : 'Perlu dicatat kondisinya hari ini'}
            </p>
          </Card>

          {/* Checkout Hari Ini */}
          <Card
            onClick={() => setActiveTab('today_checkout')}
            className={`border rounded-2xl p-4 sm:p-5 shadow-xs cursor-pointer transition-all ${
              stats.checkoutToday > 0
                ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/60'
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-rose-800 dark:text-rose-200 uppercase tracking-wider font-semibold">
                Checkout Hari Ini
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-rose-800 dark:text-rose-200 tabular-nums">
              {stats.checkoutToday}
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-300/80 mt-1">Dijadwalkan pulang hari ini</p>
          </Card>

          {/* Checkout Besok */}
          <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Checkout Besok
              </span>
              <div className="w-8 h-8 rounded-xl bg-surface-soft text-foreground flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
              {stats.checkoutTomorrow}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Dijadwalkan pulang besok</p>
          </Card>
        </div>

        {/* SECTION: ACTIVE BOOKINGS GRID */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground">
                Kucing Sedang Menginap
              </h2>
              <p className="text-xs text-muted-foreground">
                Status laporan harian, periode titip, dan detail kontak owner.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-soft p-1 rounded-xl border border-border w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Semua ({activeBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unreported')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'unreported'
                    ? 'bg-amber-500 text-white shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Belum Laporan ({stats.notReportedToday})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('today_checkout')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'today_checkout'
                    ? 'bg-rose-600 text-white shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Checkout Hari Ini ({stats.checkoutToday})
              </button>
            </div>
          </div>

          {displayedBookings.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border">
              <div className="text-3xl mb-2">🐾</div>
              <h3 className="text-sm font-bold text-foreground">Tidak ada data untuk filter ini</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Semua kucing dalam kategori ini telah diproses atau belum ada data.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('all')}
                className="text-xs rounded-xl"
              >
                Tampilkan Semua Kucing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBookings.map(booking => (
                <ActiveBookingCard
                  key={booking.id}
                  booking={booking}
                  today={today}
                  tomorrow={tomorrow}
                  onQuickReport={openReportForm}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK REPORT FORM MODAL */}
      <DailyReportForm
        isOpen={isFormOpen}
        onClose={closeReportForm}
        booking={selectedBooking}
        today={today}
        formData={formData}
        setFormData={setFormData}
        onSave={saveReport}
      />

      {/* WHATSAPP TEMPLATE MODAL */}
      <WaTemplateModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        type="daily_report"
        data={selectedBooking}
        report={savedReport}
        namaUsaha={pengaturan.nama_usaha}
      />
    </AdminLayout>
  )
}
