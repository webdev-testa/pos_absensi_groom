import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGroomingSessions } from '@/hooks/grooming/useGroomingSessions'
import { groomingService } from '@/services/groomingService'
import type { GroomingStep } from '@/types/pos'
import {
  GROOMING_STEP_LABELS,
  GROOMING_STEP_EMOJI,
} from '@/constants/grooming.constants'
import {
  Camera,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { getGroomingReportUrl } from '@/utils/grooming.utils'

export default function GroomerWorkstation() {
  const { sessions, refetch, updateStep } = useGroomingSessions()

  // Selected session to work on
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  // Workstation filter: active (antrian + dikerjakan) vs finished (selesai + dijemput)
  const [tab, setTab] = useState<'active' | 'done'>('active')

  // Photo upload & notes state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [stepNote, setStepNote] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeSessions = sessions.filter(
    s => s.status === 'antrian' || s.status === 'dikerjakan'
  )
  const doneSessions = sessions.filter(
    s => s.status === 'selesai' || s.status === 'dijemput'
  )

  const currentList = tab === 'active' ? activeSessions : doneSessions
  const selectedSession = sessions.find(s => s.id === activeSessionId) || currentList[0] || null

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAdvanceStepWithPhoto = async (targetStep: GroomingStep) => {
    if (!selectedSession) return
    setIsUploading(true)

    try {
      let uploadedUrl: string | undefined

      if (photoFile) {
        toast.info('Mengunggah foto proses...')
        uploadedUrl = await groomingService.uploadGroomingPhoto(
          photoFile,
          selectedSession.id,
          targetStep
        )
      }

      await updateStep({
        sessionId: selectedSession.id,
        step: targetStep,
        catatan: stepNote || undefined,
        foto_url: uploadedUrl || (photoPreview as string) || undefined,
      })

      // Reset photo state
      setPhotoFile(null)
      setPhotoPreview(null)
      setStepNote('')
      toast.success(
        `Step ${GROOMING_STEP_LABELS[targetStep]} berhasil disimpan! Live report otomatis terupdate.`
      )
    } catch (err: any) {
      toast.error('Gagal memperbarui step: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* MOBILE APP BAR */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Link to="/admin/grooming">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              title="Ke Dashboard Admin"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">✂️</span>
            <div>
              <h1 className="text-sm font-bold font-heading text-foreground leading-none">
                Groomer Workstation
              </h1>
              <span className="text-[10px] text-muted-foreground font-mono">
                Dr. Meow Salon Workstation
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 w-8 p-0 rounded-lg border-border text-muted-foreground cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          <Link to="/admin/pos">
            <Button
              variant="outline"
              size="sm"
              className="text-[11px] h-8 px-2.5 rounded-lg border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Menu POS
            </Button>
          </Link>
        </div>
      </header>

      {/* MAIN WORKSTATION CONTENT */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4 pb-12">
        {/* TABS: ANTRIAN vs SELESAI */}
        <div className="flex bg-surface-soft p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'active'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Sedang Dikerjakan / Antrian</span>
            <span className="px-1.5 py-0.2 bg-brand-orange/15 text-brand-orange text-[10px] rounded-full font-mono font-bold">
              {activeSessions.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab('done')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'done'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Selesai Hari Ini</span>
            <span className="px-1.5 py-0.2 bg-surface-muted text-muted-foreground text-[10px] rounded-full font-mono font-bold">
              {doneSessions.length}
            </span>
          </button>
        </div>

        {/* HORIZONTAL CAROUSEL OF QUEUE CATS */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center justify-between">
            <span>Pilih Kucing di Meja Grooming:</span>
            <span>{currentList.length} kucing</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {currentList.map(session => {
              const isSelected = selectedSession?.id === session.id
              return (
                <button
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id)
                    setPhotoFile(null)
                    setPhotoPreview(null)
                    setStepNote('')
                  }}
                  className={`p-2.5 rounded-xl border shrink-0 text-left transition-all flex items-center gap-2.5 min-w-[170px] cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary'
                      : 'bg-card border-border hover:bg-surface-soft'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-soft border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {session.cat?.foto_url ? (
                      <img src={session.cat.foto_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🐱</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">
                      {session.cat?.nama || 'Kucing'}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{session.paket}</div>
                    <div className="text-[9.5px] font-mono text-brand-orange font-semibold flex items-center gap-1 mt-0.5">
                      {GROOMING_STEP_EMOJI[session.current_step]}{' '}
                      {GROOMING_STEP_LABELS[session.current_step].split(' ')[0]}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ACTIVE CAT DETAIL PANEL */}
        {selectedSession ? (
          <div className="space-y-4">
            {/* CAT INFO CARD */}
            <Card className="bg-card border-border shadow-xs rounded-2xl overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-surface-soft border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {selectedSession.cat?.foto_url ? (
                        <img
                          src={selectedSession.cat.foto_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🐱</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold font-heading text-foreground">
                          {selectedSession.cat?.nama}
                        </h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-surface-soft rounded-md text-muted-foreground border border-border">
                          {selectedSession.cat?.ras || 'Domestic'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Paket: <strong>{selectedSession.paket}</strong>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        Owner: {selectedSession.owner?.nama} ({selectedSession.owner?.no_wa})
                      </div>
                    </div>
                  </div>

                  <a
                    href={getGroomingReportUrl(selectedSession.public_token)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 bg-surface-soft px-2.5 py-1.5 rounded-lg border border-border shrink-0 cursor-pointer"
                    title="Buka tampilan report customer"
                  >
                    <span>Live View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Notes & Warnings */}
                {selectedSession.kondisi_awal && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-300 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-semibold">Catatan Kondisi Awal:</span>{' '}
                      {selectedSession.kondisi_awal}
                    </div>
                  </div>
                )}

                {selectedSession.catatan && (
                  <div className="p-2.5 bg-surface-soft border border-border/60 rounded-xl text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Pesan Owner:</span>{' '}
                    {selectedSession.catatan}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QUICK CAMERA CAPTURE SECTION */}
            <Card className="bg-card border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-brand-orange" />
                  <span className="text-xs font-bold font-heading text-foreground">
                    Jepret Foto Kamera HP
                  </span>
                </div>
              </div>

              {/* Hidden file input with direct camera capture */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />

              {photoPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border max-h-56 bg-black flex items-center justify-center">
                  <img src={photoPreview} alt="Preview" className="max-h-56 w-auto object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null)
                      setPhotoFile(null)
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    Ganti Foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-border hover:border-brand-orange/60 rounded-xl bg-surface-soft/40 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-orange/15 text-brand-orange flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    Ketuk untuk Ambil Foto Langsung dari Kamera
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Groomer tinggal foto kucing saat pengerjaan
                  </span>
                </button>
              )}

              {/* Step Note */}
              <div className="space-y-1">
                <Input
                  placeholder="Catatan singkat (cth: Bulu sudah disisir rapi & wangi)..."
                  value={stepNote}
                  onChange={e => setStepNote(e.target.value)}
                  className="text-xs h-9 rounded-xl border-border bg-background"
                />
              </div>
            </Card>

            {/* GIANT TACTILE STEP BUTTONS */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                <span>Update Tahap Pengerjaan Grooming:</span>
                <span className="text-brand-orange font-semibold">
                  Saat ini: {GROOMING_STEP_LABELS[selectedSession.current_step]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { step: 'bathing' as GroomingStep, label: 'Mulai Mandi & Shampo', icon: '🛁', color: 'bg-blue-600 hover:bg-blue-700' },
                  { step: 'drying' as GroomingStep, label: 'Mulai Pengeringan (Blow Dry)', icon: '💨', color: 'bg-cyan-600 hover:bg-cyan-700' },
                  { step: 'styling' as GroomingStep, label: 'Mulai Styling / Cukur Bulu', icon: '✂️', color: 'bg-purple-600 hover:bg-purple-700' },
                  { step: 'finishing' as GroomingStep, label: 'Finishing Touch & Parfum', icon: '✨', color: 'bg-pink-600 hover:bg-pink-700' },
                ].map(item => {
                  const isCurrent = selectedSession.current_step === item.step
                  const isTerminal = selectedSession.status === 'selesai' || selectedSession.status === 'dijemput' || selectedSession.status === 'dibatalkan'
                  return (
                    <Button
                      key={item.step}
                      disabled={isUploading || isTerminal}
                      onClick={() => handleAdvanceStepWithPhoto(item.step)}
                      className={`h-12 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center justify-between px-4 disabled:opacity-50 ${
                        item.color
                      } ${isCurrent ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Aktif</span>
                      ) : (
                        <ChevronRight className="w-4 h-4 opacity-70" />
                      )}
                    </Button>
                  )
                })}
              </div>

              {/* Big Selesai Button */}
              {selectedSession.status !== 'dijemput' && (
                <Button
                  disabled={isUploading || selectedSession.status === 'selesai'}
                  onClick={() => handleAdvanceStepWithPhoto('done')}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer mt-3 gap-2 disabled:opacity-50"
                >
                  <span className="text-xl">🎉</span>
                  <span>{selectedSession.status === 'selesai' ? 'GROOMING SUDAH SELESAI' : 'GROOMING SELESAI & SIAP DIJEMPUT!'}</span>
                </Button>
              )}
            </div>

            {/* TIMELINE OF PROGRESS PHOTOS TAKEN */}
            {selectedSession.progress && selectedSession.progress.length > 0 && (
              <Card className="bg-card border-border rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold font-heading text-foreground">
                  Riwayat Foto & Catatan Sesi Ini ({selectedSession.progress.length})
                </div>

                <div className="space-y-3">
                  {selectedSession.progress.map((prog, idx) => (
                    <div
                      key={prog.id || idx}
                      className="p-3 bg-surface-soft border border-border/60 rounded-xl flex items-start gap-3 text-xs"
                    >
                      {prog.foto_url ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-border">
                          <img src={prog.foto_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface-muted flex items-center justify-center text-lg shrink-0">
                          {GROOMING_STEP_EMOJI[prog.step] || '🐾'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            {GROOMING_STEP_LABELS[prog.step]}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(prog.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {prog.catatan && (
                          <div className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                            {prog.catatan}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground text-xs font-mono">
            Tidak ada kucing yang dipilih.
          </div>
        )}
      </main>
    </div>
  )
}
