import { useParams } from 'react-router-dom'
import { useGroomingRealtime } from '@/hooks/grooming/useGroomingRealtime'
import {
  GROOMING_STEPS,
  GROOMING_STEP_LABELS,
  GROOMING_STEP_EMOJI,
} from '@/constants/grooming.constants'
import { openWhatsApp } from '@/utils/grooming.utils'
import { formatRupiah, formatTanggal } from '@/utils/pos.utils'
import {
  CheckCircle2,
  MessageCircle,
  RefreshCw,
  Scissors,
  ShieldCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function GroomingReport() {
  const { token } = useParams<{ token: string }>()
  const { session, cat, progressList, isLoading, lastUpdated, refresh } = useGroomingRealtime(token)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange/15 text-brand-orange flex items-center justify-center text-3xl mb-4 shadow-xs">
          🐱
        </div>
        <div className="text-base font-bold font-heading text-foreground">
          Menghubungkan ke Live Report...
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Memuat data progres pengerjaan grooming Dr. Meow secara realtime.
        </p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-surface-soft border border-border flex items-center justify-center text-2xl mb-3">
          🔍
        </div>
        <div className="text-base font-bold font-heading text-foreground">
          Sesi Grooming Tidak Ditemukan
        </div>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Tautan yang Kakak buka mungkin salah atau masa pelacakan telah berakhir. Silakan hubungi admin salon untuk tautan terbaru.
        </p>
      </div>
    )
  }

  const isDone = session.status === 'selesai' || session.current_step === 'done'
  const isPickedUp = session.status === 'dijemput'
  const currentStepIdx = GROOMING_STEPS.indexOf(session.current_step)

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-16">
      {/* TOP CLINIC BRANDING BAR */}
      <header className="bg-card/85 backdrop-blur-md border-b border-border px-4 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🐾</span>
            <div>
              <div className="font-heading font-bold text-sm tracking-tight text-foreground">
                Dr. Meow Grooming
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                Live Customer Tracker
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>

            <button
              type="button"
              onClick={refresh}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Perbarui data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION: CAT PROFILE & STATUS */}
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* CELEBRATION BANNER IF DONE */}
        {isDone && !isPickedUp && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-1.5 shadow-xs">
            <div className="text-3xl">🎉✨</div>
            <h2 className="text-base font-bold font-heading text-emerald-800 dark:text-emerald-200">
              {cat?.nama || 'Kucing Kakak'} Sudah Siap Dijemput!
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed max-w-xs mx-auto">
              Grooming telah selesai dengan sempurna. Bulu sudah wangi, bersih, dan rapi dipeluk! 🥰
            </p>
          </div>
        )}

        {isPickedUp && (
          <div className="p-3.5 bg-surface-soft border border-border rounded-2xl text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kucing telah dijemput oleh pemilik. Terima kasih! 🐾</span>
          </div>
        )}

        {/* HERO CARD */}
        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-surface-soft border border-border overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
              {cat?.foto_url ? (
                <img src={cat.foto_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🐱</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading text-foreground truncate">
                  {cat?.nama || 'Kucing Kesayangan'}
                </h1>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {cat?.ras || 'Domestic'} • {cat?.warna || 'Warna cantik'}
              </div>

              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold">
                <Scissors className="w-3.5 h-3.5" />
                <span>{session.paket}</span>
              </div>
            </div>
          </div>

          {/* ACTIVE STATUS STRIP */}
          <div className="px-5 py-3 bg-surface-soft/60 border-t border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">{GROOMING_STEP_EMOJI[session.current_step]}</span>
              <div>
                <span className="text-[10px] text-muted-foreground font-mono block">STATUS SEKARANG:</span>
                <span className="font-bold text-foreground">
                  {GROOMING_STEP_LABELS[session.current_step]}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-mono block">GROOMER:</span>
              <span className="font-semibold text-foreground">
                {session.groomer_name || 'Tim Salon'}
              </span>
            </div>
          </div>
        </Card>

        {/* MILESTONE STEPPER */}
        <Card className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold font-heading uppercase text-foreground tracking-wider font-mono">
              Tahap Pengerjaan Grooming
            </h2>
            <span className="text-[11px] font-mono text-brand-orange font-semibold">
              Step {currentStepIdx + 1} dari {GROOMING_STEPS.length}
            </span>
          </div>

          {/* Step Timeline Nodes */}
          <div className="relative pl-7 space-y-6">
            {/* Connecting line */}
            <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-neutral-200 dark:bg-neutral-800" />

            {GROOMING_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx
              const isCurrent = idx === currentStepIdx

              // Find progress photo for this step
              const stepProgress = progressList.find(p => p.step === step)

              return (
                <div key={step} className="relative group">
                  {/* Node icon */}
                  <div
                    className={`absolute -left-[27px] top-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isPast
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-brand-orange border-white dark:border-neutral-900 text-white shadow-md ring-4 ring-brand-orange/20 animate-pulse'
                        : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-[11px]">{idx + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{GROOMING_STEP_EMOJI[step]}</span>
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-brand-orange'
                              : isPast
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {GROOMING_STEP_LABELS[step]}
                        </span>
                      </div>

                      {isCurrent && (
                        <span className="text-[10px] bg-brand-orange/15 text-brand-orange font-bold font-mono px-2 py-0.5 rounded-full animate-pulse">
                          Sedang Berlangsung
                        </span>
                      )}
                    </div>

                    {/* If photo or note exists for this step */}
                    {stepProgress && (
                      <div className="mt-2 space-y-2 p-3 bg-surface-soft/80 border border-border/60 rounded-2xl">
                        {stepProgress.foto_url && (
                          <div className="rounded-xl overflow-hidden border border-border max-h-56 bg-black flex items-center justify-center">
                            <img
                              src={stepProgress.foto_url}
                              alt={stepProgress.catatan || 'Foto proses'}
                              className="max-h-56 w-auto object-contain"
                            />
                          </div>
                        )}

                        {stepProgress.catatan && (
                          <p className="text-xs text-foreground/90 leading-relaxed italic">
                            "{stepProgress.catatan}"
                          </p>
                        )}

                        <div className="text-[10px] font-mono text-muted-foreground text-right">
                          {new Date(stepProgress.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* INITIAL HEALTH & CARE CARD */}
        {session.kondisi_awal && (
          <Card className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <h3 className="text-xs font-bold font-heading">
                Catatan Pemeriksaan Awal Dokter / Salon:
              </h3>
            </div>
            <p className="text-xs text-muted-foreground bg-amber-500/10 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl leading-relaxed">
              {session.kondisi_awal}
            </p>
          </Card>
        )}

        {/* BILLING & SERVICE SUMMARY */}
        <Card className="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
            <span className="text-muted-foreground font-mono uppercase text-[10px]">
              Ringkasan Layanan
            </span>
            <span className="font-semibold text-foreground">{formatTanggal(session.tanggal)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Paket Grooming:</span>
            <span className="font-semibold text-foreground">{session.paket}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Tagihan:</span>
            <span className="font-bold text-foreground">Rp {formatRupiah(session.harga)}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
            <span className="text-muted-foreground">Status Pembayaran:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                session.sudah_bayar
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              }`}
            >
              {session.sudah_bayar ? '✓ Lunas' : 'Bayar di Kasir Salon'}
            </span>
          </div>
        </Card>

        {/* SALON CONTACT & SUPPORT */}
        <div className="pt-2 text-center space-y-3">
          <Button
            onClick={() =>
              openWhatsApp(
                '081234567890',
                `Halo Admin Dr. Meow, saya ingin bertanya tentang grooming ${cat?.nama || 'kucing saya'}...`
              )
            }
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-2xl shadow-xs gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Hubungi Admin Salon (WhatsApp)</span>
          </Button>

          <p className="text-[10px] text-muted-foreground font-mono">
            Halaman ini diperbarui otomatis secara live • Terakhir dicek:{' '}
            {lastUpdated.toLocaleTimeString('id-ID')} WIB
          </p>
        </div>
      </div>
    </div>
  )
}
