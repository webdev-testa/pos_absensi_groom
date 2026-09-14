import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGroomingSessions } from '@/hooks/grooming/useGroomingSessions'
import type { GroomingSession } from '@/types/pos'
import {
  GROOMING_STEPS,
  GROOMING_STEP_LABELS,
  GROOMING_STEP_EMOJI,
} from '@/constants/grooming.constants'
import {
  getStepBadgeConfig,
  getStatusBadgeConfig,
  getGroomingReportUrl,
  generateGroomingCheckinWa,
  generateGroomingDoneWa,
  openWhatsApp,
} from '@/utils/grooming.utils'
import { formatRupiah } from '@/utils/pos.utils'
import {
  Scissors,
  PlusCircle,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
  User,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function GroomingDashboard() {
  const {
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredSessions,
    stats,
    isLoading,
    refetch,
    updateStep,
    markPickedUp,
  } = useGroomingSessions()

  // WA Modal state
  const [waModalSession, setWaModalSession] = useState<GroomingSession | null>(null)
  const [waModalType, setWaModalType] = useState<'checkin' | 'done'>('checkin')

  // Step advancement state
  const [advancingSession, setAdvancingSession] = useState<GroomingSession | null>(null)
  const [nextStepCatatan, setNextStepCatatan] = useState<string>('')

  const handleOpenWaModal = (session: GroomingSession, type: 'checkin' | 'done') => {
    setWaModalSession(session)
    setWaModalType(type)
  }

  const getWaMessage = (session: GroomingSession, type: 'checkin' | 'done') => {
    const reportUrl = getGroomingReportUrl(session.public_token)
    return type === 'checkin'
      ? generateGroomingCheckinWa(session, reportUrl)
      : generateGroomingDoneWa(session, reportUrl)
  }

  const handleSendWa = () => {
    if (!waModalSession) return
    const message = getWaMessage(waModalSession, waModalType)
    const phone = waModalSession.owner?.no_wa || ''
    if (!phone) {
      toast.error('Nomor WhatsApp pemilik tidak ditemukan.')
      return
    }
    openWhatsApp(phone, message)
    setWaModalSession(null)
  }

  const handleCopyWaText = () => {
    if (!waModalSession) return
    const message = getWaMessage(waModalSession, waModalType)
    navigator.clipboard.writeText(message)
    toast.success('Pesan WhatsApp berhasil disalin ke clipboard!')
  }

  const handleAdvanceStep = async () => {
    if (!advancingSession) return
    const currentIdx = GROOMING_STEPS.indexOf(advancingSession.current_step)
    if (currentIdx < GROOMING_STEPS.length - 1) {
      const nextStep = GROOMING_STEPS[currentIdx + 1]
      await updateStep({
        sessionId: advancingSession.id,
        step: nextStep,
        catatan: nextStepCatatan || undefined,
      })
      setAdvancingSession(null)
      setNextStepCatatan('')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 font-sans text-foreground">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
              <Scissors className="w-3.5 h-3.5" />
              Modul Grooming Kucing
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground tracking-tight mt-0.5">
              Live Grooming Station
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pantau antrian pengerjaan grooming & bagikan live report realtime ke WhatsApp customer.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 text-xs h-9 border-border bg-card hover:bg-surface-soft rounded-xl cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              Refresh
            </Button>

            <Link to="/groomer">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9 border-brand-accent/40 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 rounded-xl cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Workstation Groomer
              </Button>
            </Link>

            <Link to="/admin/grooming/new">
              <Button
                size="sm"
                className="gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Check-in Grooming Baru
              </Button>
            </Link>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="bg-card border-border shadow-2xs rounded-2xl">
            <CardContent className="p-4">
              <div className="text-[11px] font-mono uppercase text-muted-foreground">Total Sesi Hari Ini</div>
              <div className="text-2xl font-bold font-heading text-foreground mt-1">{stats.total}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Kucing terdaftar</div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/5 border-amber-200/80 dark:border-amber-900/50 shadow-2xs rounded-2xl">
            <CardContent className="p-4">
              <div className="text-[11px] font-mono uppercase text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Dalam Antrian
              </div>
              <div className="text-2xl font-bold font-heading text-amber-700 dark:text-amber-300 mt-1">
                {stats.antrian}
              </div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Menunggu giliran</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5 border-blue-200/80 dark:border-blue-900/50 shadow-2xs rounded-2xl">
            <CardContent className="p-4">
              <div className="text-[11px] font-mono uppercase text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Sedang Dikerjakan
              </div>
              <div className="text-2xl font-bold font-heading text-blue-700 dark:text-blue-300 mt-1">
                {stats.dikerjakan}
              </div>
              <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">Di workstation</div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/5 border-emerald-200/80 dark:border-emerald-900/50 shadow-2xs rounded-2xl">
            <CardContent className="p-4">
              <div className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Selesai / Dijemput
              </div>
              <div className="text-2xl font-bold font-heading text-emerald-700 dark:text-emerald-300 mt-1">
                {stats.selesai + stats.dijemput}
              </div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                {stats.selesai} siap dijemput
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1 bg-card border-border shadow-2xs rounded-2xl">
            <CardContent className="p-4">
              <div className="text-[11px] font-mono uppercase text-muted-foreground">Estimasi Omset</div>
              <div className="text-xl font-bold font-heading text-foreground mt-1">
                Rp {formatRupiah(stats.totalOmset)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Hari ini</div>
            </CardContent>
          </Card>
        </div>

        {/* CONTROLS: FILTER TABS & SEARCH */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl shadow-2xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'antrian', label: 'Antrian' },
              { id: 'dikerjakan', label: 'Dikerjakan' },
              { id: 'selesai', label: 'Selesai' },
              { id: 'dijemput', label: 'Dijemput' },
            ].map(tab => {
              const active = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-soft'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search Input & Date */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama kucing / owner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl border-border bg-background"
              />
            </div>

            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="text-xs h-9 w-36 rounded-xl border-border bg-background"
              />
            </div>
          </div>
        </div>

        {/* SESSIONS LIST */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-xs font-mono">
            Memuat data sesi grooming...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card border border-dashed border-border rounded-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-soft flex items-center justify-center mb-3">
              <Scissors className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-sm font-semibold font-heading text-foreground">Tidak ada sesi grooming</div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Belum ada antrian grooming untuk filter ini. Daftarkan kucing yang baru datang melalui Check-in Baru.
            </p>
            <Link to="/admin/grooming/new" className="mt-4">
              <Button size="sm" className="gap-1.5 text-xs h-9 rounded-xl cursor-pointer">
                <PlusCircle className="w-3.5 h-3.5" />
                Check-in Grooming Baru
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map(session => {
              const stepBadge = getStepBadgeConfig(session.current_step)
              const statusBadge = getStatusBadgeConfig(session.status)
              const stepIdx = GROOMING_STEPS.indexOf(session.current_step)
              const totalSteps = GROOMING_STEPS.length
              const progressPct = Math.round(((stepIdx + 1) / totalSteps) * 100)

              return (
                <Card
                  key={session.id}
                  className="bg-card border-border hover:border-border/80 transition-all shadow-2xs hover:shadow-xs rounded-2xl overflow-hidden flex flex-col"
                >
                  {/* CARD HEADER */}
                  <div className="p-4 pb-3 border-b border-border/60 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-surface-soft border border-border overflow-hidden shrink-0 flex items-center justify-center">
                        {session.cat?.foto_url ? (
                          <img
                            src={session.cat.foto_url}
                            alt={session.cat?.nama || 'Cat'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🐱</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold font-heading text-foreground truncate">
                            {session.cat?.nama || 'Kucing'}
                          </h3>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            • {session.cat?.ras || 'Domestic'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 shrink-0" />
                          <span className="truncate">{session.owner?.nama || 'Owner'}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-4 py-3 space-y-3 flex-1 text-xs">
                    {/* Service & Price */}
                    <div className="flex items-center justify-between p-2.5 bg-surface-soft border border-border/60 rounded-xl">
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">Paket Layanan</div>
                        <div className="font-semibold text-foreground">{session.paket}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">Biaya</div>
                        <div className="font-bold text-foreground">Rp {formatRupiah(session.harga)}</div>
                      </div>
                    </div>

                    {/* Progress Bar & Current Step */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <span className="text-sm">{GROOMING_STEP_EMOJI[session.current_step]}</span>
                          <span className="font-medium text-foreground">{stepBadge.label}</span>
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-surface-soft rounded-full h-2 overflow-hidden border border-border/40">
                        <div
                          className="bg-brand-orange h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta info: Groomer & Notes */}
                    <div className="pt-1 text-[11px] text-muted-foreground space-y-1">
                      {session.groomer_name && (
                        <div className="flex items-center gap-1 text-foreground/80">
                          <Scissors className="w-3 h-3 text-muted-foreground" />
                          <span>Groomer: <strong>{session.groomer_name}</strong></span>
                        </div>
                      )}
                      {session.kondisi_awal && (
                        <div className="flex items-start gap-1 text-amber-700 dark:text-amber-300 text-[10.5px]">
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">Kondisi: {session.kondisi_awal}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="p-3 bg-surface-soft/40 border-t border-border flex flex-col gap-2">
                    {/* Primary Step & Status Action */}
                    {session.status === 'antrian' && (
                      <Button
                        size="sm"
                        onClick={() => updateStep({ sessionId: session.id, step: 'bathing' })}
                        className="w-full text-xs h-8.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer"
                      >
                        Mulai Mandi / Bathing 🛁
                      </Button>
                    )}

                    {session.status === 'dikerjakan' && session.current_step !== 'done' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAdvancingSession(session)}
                          className="flex-1 text-xs h-8.5 border-border font-medium hover:bg-surface-soft rounded-xl cursor-pointer"
                        >
                          Lanjut Step Berikutnya <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateStep({ sessionId: session.id, step: 'done' })}
                          className="text-xs h-8.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer shrink-0"
                        >
                          Selesai ✨
                        </Button>
                      </div>
                    )}

                    {session.status === 'selesai' && (
                      <Button
                        size="sm"
                        onClick={() => markPickedUp(session.id)}
                        className="w-full text-xs h-8.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl cursor-pointer"
                      >
                        Tandai Sudah Dijemput Owner 🐾
                      </Button>
                    )}

                    {/* WhatsApp & Live Link Row */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleOpenWaModal(
                            session,
                            session.status === 'selesai' ? 'done' : 'checkin'
                          )
                        }
                        className="flex-1 text-[11px] h-8 border-border hover:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 rounded-xl cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        {session.status === 'selesai' ? 'WA Siap Jemput' : 'WA Link Live'}
                      </Button>

                      <a
                        href={getGroomingReportUrl(session.public_token)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center h-8 px-2.5 rounded-xl border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-soft transition-colors cursor-pointer"
                        title="Buka Live Report Customer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* DIALOG: 1-CLICK WHATSAPP SHARE */}
        <Dialog open={!!waModalSession} onOpenChange={open => !open && setWaModalSession(null)}>
          <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl p-6">
            <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="w-3.5 h-3.5" />
                1-Click WhatsApp Link
              </div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                {waModalType === 'checkin'
                  ? 'Kirim Tautan Live Report ke Owner'
                  : 'Kirim Notifikasi Siap Dijemput'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pesan ini berisi link live report khusus untuk pemilik kucing.
              </DialogDescription>
            </DialogHeader>

            {waModalSession && (
              <div className="space-y-3 py-2 text-xs">
                {/* Owner info pill */}
                <div className="p-3 bg-surface-soft border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{waModalSession.owner?.nama}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      {waModalSession.owner?.no_wa || 'No WA tidak tersedia'}
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-brand-orange/15 text-brand-orange px-2.5 py-1 rounded-lg">
                    🐱 {waModalSession.cat?.nama}
                  </span>
                </div>

                {/* Message preview */}
                <div className="relative">
                  <textarea
                    readOnly
                    value={getWaMessage(waModalSession, waModalType)}
                    rows={10}
                    className="w-full text-xs font-mono text-foreground bg-surface-soft border border-border rounded-xl p-3 leading-relaxed resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyWaText}
                className="text-xs h-9 border-border rounded-xl cursor-pointer"
              >
                Salin Pesan Saja
              </Button>
              <Button
                size="sm"
                onClick={handleSendWa}
                className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Buka WhatsApp (Kirim)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: ADVANCE STEP WITH NOTES */}
        <Dialog open={!!advancingSession} onOpenChange={open => !open && setAdvancingSession(null)}>
          <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl p-6">
            <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                <Scissors className="w-3.5 h-3.5" />
                Lanjut ke Tahap Berikutnya
              </div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                Update Step {advancingSession?.cat?.nama}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pilih atau tambahkan catatan progres untuk dilaporkan ke customer.
              </DialogDescription>
            </DialogHeader>

            {advancingSession && (
              <div className="space-y-4 py-2 text-xs">
                <div className="p-3 bg-surface-soft border border-border rounded-xl flex items-center justify-between">
                  <div className="text-muted-foreground">Tahap Sekarang:</div>
                  <div className="font-bold text-foreground">
                    {GROOMING_STEP_LABELS[advancingSession.current_step]}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Catatan Pengerjaan (Opsional):
                  </label>
                  <textarea
                    placeholder="Contoh: Bulu kusut di punggung sudah disisir rapi..."
                    value={nextStepCatatan}
                    onChange={e => setNextStepCatatan(e.target.value)}
                    rows={3}
                    className="w-full text-xs text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdvancingSession(null)}
                className="text-xs h-9 border-border rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleAdvanceStep}
                className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl cursor-pointer"
              >
                Simpan & Lanjut Step
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
