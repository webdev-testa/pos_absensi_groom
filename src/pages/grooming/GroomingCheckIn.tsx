import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OwnerContactPicker } from '@/components/pos/OwnerContactPicker'
import { useGroomingForm } from '@/hooks/grooming/useGroomingForm'
import {
  Scissors,
  ArrowLeft,
  Plus,
  Check,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Clock,
  AlertCircle,
  Copy,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatRupiah, copyToClipboard } from '@/utils/pos.utils'
import {
  getGroomingReportUrl,
  generateGroomingCheckinWa,
  openWhatsApp,
} from '@/utils/grooming.utils'
import { toast } from 'sonner'

export default function GroomingCheckIn() {
  const navigate = useNavigate()
  const {
    step,
    setStep,
    // Owner
    searchOwnerQuery,
    setSearchOwnerQuery,
    selectedOwner,
    isNewOwner,
    setIsNewOwner,
    newOwnerData,
    setNewOwnerData,
    ownerSearchResults,
    isSearchingOwners,
    handleSelectOwner,
    handleClearOwner,
    // Cat
    selectedCat,
    isNewCat,
    setIsNewCat,
    newCatData,
    setNewCatData,
    ownerCats,
    handleSelectCat,
    handleChooseNewCat,
    // Details
    formData,
    setFormData,
    packages,
    handleSelectPackage,
    // Submission
    submitCheckIn,
    isSubmitting,
    createdSession,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    resetForm,
  } = useGroomingForm()

  // Checklist for quick initial condition tags
  const [quickTags, setQuickTags] = useState<string[]>([])

  const toggleQuickTag = (tag: string) => {
    let next: string[]
    if (quickTags.includes(tag)) {
      next = quickTags.filter(t => t !== tag)
    } else {
      next = [...quickTags, tag]
    }
    setQuickTags(next)
    setFormData(prev => ({
      ...prev,
      kondisiAwal: next.join(', '),
    }))
  }

  const handleSendWa = () => {
    if (!createdSession) return
    const reportUrl = getGroomingReportUrl(createdSession.public_token)
    const message = generateGroomingCheckinWa(createdSession, reportUrl)
    const phone = createdSession.owner?.no_wa || newOwnerData.no_wa
    if (!phone) {
      toast.error('Nomor WhatsApp pemilik tidak ditemukan.')
      return
    }
    openWhatsApp(phone, message)
  }

  const handleCopyLink = async () => {
    if (!createdSession) return
    const reportUrl = getGroomingReportUrl(createdSession.public_token)
    const success = await copyToClipboard(reportUrl)
    if (success) {
      toast.success('Link live report berhasil disalin!')
    } else {
      toast.error('Gagal menyalin link ke clipboard.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 font-sans text-foreground max-w-4xl mx-auto">
        {/* HEADER & NAVIGATION */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Link to="/admin/grooming">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-border bg-card hover:bg-surface-soft cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                <Scissors className="w-3.5 h-3.5" />
                Check-In Grooming
              </div>
              <h1 className="text-xl font-bold font-heading text-foreground tracking-tight">
                Pendaftaran Kucing Masuk
              </h1>
            </div>
          </div>

          {/* STEP INDICATOR */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: 'Owner' },
              { num: 2, label: 'Kucing' },
              { num: 3, label: 'Layanan' },
            ].map(s => (
              <div key={s.num} className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.num
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-surface-soft text-muted-foreground'
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className="text-xs font-medium hidden sm:inline text-muted-foreground">
                  {s.label}
                </span>
                {s.num < 3 && <span className="text-muted-foreground/40 hidden sm:inline">•</span>}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: OWNER SELECTION (DIRECT DIRECTORY + SEARCH) */}
        {step === 1 && (
          <OwnerContactPicker
            selectedOwner={selectedOwner}
            onSelectOwner={handleSelectOwner}
            onClearOwner={handleClearOwner}
            isNewOwner={isNewOwner}
            onToggleNewOwner={setIsNewOwner}
            newOwnerData={newOwnerData}
            onChangeNewOwnerData={setNewOwnerData}
            searchQuery={searchOwnerQuery}
            onSearchChange={setSearchOwnerQuery}
            owners={ownerSearchResults}
            isLoading={isSearchingOwners}
            onProceedNext={() => {
              if (!selectedOwner && (!isNewOwner || !newOwnerData.nama || !newOwnerData.no_wa)) {
                toast.error('Pilih owner atau isi formulir owner baru terlebih dahulu!')
                return
              }
              if (isNewOwner || !selectedOwner || ownerCats.length === 0) {
                setIsNewCat(true)
              }
              setStep(2)
            }}
            accentColor="orange"
            title="Langkah 1: Identitas Pemilik Kucing"
            description="Pilih dari kontak pemilik terdaftar atau daftarkan pelanggan baru untuk check-in grooming."
          />
        )}

        {/* STEP 2: CAT SELECTION */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold font-heading text-foreground">
                Langkah 2: Pilih atau Tambah Kucing
              </h2>
              <p className="text-xs text-muted-foreground">
                Pemilik:{' '}
                <strong>
                  {selectedOwner ? selectedOwner.nama : newOwnerData.nama} (
                  {selectedOwner ? selectedOwner.no_wa : newOwnerData.no_wa})
                </strong>
              </p>
            </div>

            {/* Existing cats list for returning owner */}
            {selectedOwner && ownerCats.length > 0 && !isNewCat && (
              <div className="space-y-2.5">
                <div className="text-[11px] font-mono uppercase text-muted-foreground">
                  Pilih Kucing Milik {selectedOwner.nama}:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ownerCats.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCat(cat)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedCat?.id === cat.id
                          ? 'bg-primary/5 border-primary shadow-xs'
                          : 'bg-card border-border hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-soft border border-border overflow-hidden shrink-0 flex items-center justify-center">
                          {cat.foto_url ? (
                            <img src={cat.foto_url} alt={cat.nama} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">🐱</span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{cat.nama}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {cat.ras || 'Domestic'} • {cat.jenis_kelamin || 'Jantan'}
                          </div>
                        </div>
                      </div>
                      {selectedCat?.id === cat.id && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Option to Add New Cat */}
            {!isNewCat && (
              <Button
                type="button"
                variant="outline"
                onClick={handleChooseNewCat}
                className="w-full text-xs h-10 border-dashed border-border gap-1.5 rounded-xl hover:bg-surface-soft cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Kucing Baru
              </Button>
            )}

            {/* New Cat Form */}
            {isNewCat && (
              <Card className="bg-card border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-xs font-bold font-heading text-foreground">Form Kucing Baru</span>
                  {ownerCats.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsNewCat(false)}
                      className="text-[11px] h-7 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Pilih dari Kucing Lama
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Nama Kucing *</label>
                    <Input
                      placeholder="Cth: Milo"
                      value={newCatData.nama}
                      onChange={e => setNewCatData(p => ({ ...p, nama: e.target.value }))}
                      className="text-xs h-9 rounded-xl border-border bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Ras / Breed</label>
                    <Input
                      placeholder="Cth: British Shorthair, Persia, Domestik"
                      value={newCatData.ras}
                      onChange={e => setNewCatData(p => ({ ...p, ras: e.target.value }))}
                      className="text-xs h-9 rounded-xl border-border bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Jenis Kelamin</label>
                    <div className="flex gap-2">
                      {['Jantan', 'Betina'].map(jk => (
                        <button
                          key={jk}
                          type="button"
                          onClick={() =>
                            setNewCatData(p => ({ ...p, jenis_kelamin: jk as 'Jantan' | 'Betina' }))
                          }
                          className={`flex-1 text-xs py-2 rounded-xl border transition-all cursor-pointer ${
                            newCatData.jenis_kelamin === jk
                              ? 'bg-primary text-primary-foreground font-semibold border-primary'
                              : 'bg-background text-muted-foreground border-border hover:bg-surface-soft'
                          }`}
                        >
                          {jk}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Warna / Corak</label>
                    <Input
                      placeholder="Cth: Abu-abu polos / Tabby"
                      value={newCatData.warna}
                      onChange={e => setNewCatData(p => ({ ...p, warna: e.target.value }))}
                      className="text-xs h-9 rounded-xl border-border bg-background"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="text-xs h-10 border-border rounded-xl cursor-pointer"
              >
                ← Kembali ke Owner
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!selectedCat && (!isNewCat || !newCatData.nama)) {
                    toast.error('Pilih atau isi nama kucing terlebih dahulu!')
                    return
                  }
                  setStep(3)
                }}
                className="text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl cursor-pointer"
              >
                Lanjut ke Paket Layanan →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: GROOMING PACKAGE & INITIAL CONDITION */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold font-heading text-foreground">
                Langkah 3: Pilih Paket & Kondisi Awal
              </h2>
              <p className="text-xs text-muted-foreground">
                Kucing: <strong>{selectedCat ? selectedCat.nama : newCatData.nama}</strong> • Owner:{' '}
                <strong>{selectedOwner ? selectedOwner.nama : newOwnerData.nama}</strong>
              </p>
            </div>

            {/* Packages Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold font-heading text-foreground">
                Pilih Paket Grooming *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {packages.map(pkg => {
                  const isSelected = formData.paketNama === pkg.nama
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary'
                          : 'bg-card border-border hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-foreground">{pkg.nama}</div>
                          {pkg.deskripsi && (
                            <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                              {pkg.deskripsi}
                            </div>
                          )}
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </div>

                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/50 text-xs">
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ±{pkg.durasi_estimasi || 60} menit
                        </span>
                        <span className="font-bold text-foreground">
                          Rp {formatRupiah(pkg.harga)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Initial Condition Checklist & Notes */}
            <Card className="bg-card border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-brand-orange shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Pemeriksaan Fisik & Kondisi Awal Kucing
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Catat kondisi awal agar transparan kepada pemilik dan terpampang di live report.
                  </p>
                </div>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Bulu Sehat & Bersih',
                  'Gimbal / Kusut',
                  'Kutu Ringan',
                  'Kutu Parah',
                  'Jamur Telinga',
                  'Jamur Punggung/Dagu',
                  'Kuku Panjang',
                  'Telinga Kotor',
                  'Kucing Galak/Agresif',
                ].map(tag => {
                  const active = quickTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleQuickTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        active
                          ? 'bg-brand-orange text-white border-brand-orange font-medium'
                          : 'bg-surface-soft text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  )
                })}
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-xs font-medium text-foreground">
                  Catatan Kondisi Fisik Lengkap:
                </label>
                <textarea
                  placeholder="Contoh: Jamur kering di cuping telinga kiri, ada gimbal di bawah ketiak..."
                  value={formData.kondisiAwal}
                  onChange={e => setFormData(p => ({ ...p, kondisiAwal: e.target.value }))}
                  rows={2}
                  className="w-full text-xs text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Pesan Khusus dari Owner (Opsional):
                </label>
                <textarea
                  placeholder="Contoh: Jangan dipotong bulu ekornya ya kak..."
                  value={formData.catatan}
                  onChange={e => setFormData(p => ({ ...p, catatan: e.target.value }))}
                  rows={2}
                  className="w-full text-xs text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </Card>

            {/* Groomer Assignment & Payment Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Ditugaskan ke Groomer</label>
                <Input
                  placeholder="Cth: Budi (Groomer 1)"
                  value={formData.groomerName}
                  onChange={e => setFormData(p => ({ ...p, groomerName: e.target.value }))}
                  className="text-xs h-9 rounded-xl border-border bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Status Pembayaran</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, sudahBayar: false }))}
                    className={`flex-1 text-xs py-2 rounded-xl border transition-all cursor-pointer ${
                      !formData.sudahBayar
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold border-amber-300'
                        : 'bg-card text-muted-foreground border-border hover:bg-surface-soft'
                    }`}
                  >
                    Bayar Nanti (Saat Jemput)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, sudahBayar: true }))}
                    className={`flex-1 text-xs py-2 rounded-xl border transition-all cursor-pointer ${
                      formData.sudahBayar
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border-emerald-300'
                        : 'bg-card text-muted-foreground border-border hover:bg-surface-soft'
                    }`}
                  >
                    Sudah Bayar Lunas
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="text-xs h-10 border-border rounded-xl cursor-pointer"
              >
                ← Kembali ke Kucing
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => submitCheckIn()}
                className="text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Menyimpan Check-in...' : 'Simpan & Dapatkan Link WA ✨'}
              </Button>
            </div>
          </div>
        )}

        {/* DIALOG: CHECK-IN SUCCESS & 1-CLICK WA SHARE */}
        <Dialog open={isSuccessModalOpen} onOpenChange={open => !open && setIsSuccessModalOpen(false)}>
          <DialogContent className="sm:max-w-xl max-w-[calc(100%-2rem)] w-full bg-card text-foreground border border-border shadow-2xl p-6 sm:p-7 rounded-2xl max-h-[92vh] overflow-y-auto min-w-0">
            <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Check-in Grooming Berhasil!
              </div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                Tautan Live Report Siap Dibagikan
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Kirim link ke WhatsApp pemilik agar mereka bisa memantau progres mandi & foto kucing secara realtime.
              </DialogDescription>
            </DialogHeader>

            {createdSession && (
              <div className="space-y-3.5 py-2 text-xs min-w-0 w-full">
                {/* Summary Pill */}
                <div className="p-3 bg-surface-soft border border-border rounded-xl flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-foreground text-sm truncate">
                      🐱 {createdSession.cat?.nama || 'Kucing'}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      Paket: <strong>{createdSession.paket}</strong> (Rp{' '}
                      {formatRupiah(createdSession.harga)})
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-muted-foreground font-mono truncate">
                      {createdSession.owner?.nama}
                    </div>
                    <div className="text-[11px] font-mono text-foreground font-semibold">
                      {createdSession.owner?.no_wa}
                    </div>
                  </div>
                </div>

                {/* Share Link Preview */}
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[11px] font-mono uppercase text-muted-foreground font-semibold">
                    URL Live Report Customer:
                  </span>
                  <div className="flex items-center gap-2 p-2 bg-surface-soft border border-border rounded-xl min-w-0">
                    <span
                      className="font-mono text-xs text-foreground truncate min-w-0 flex-1 px-1.5 select-all"
                      title={getGroomingReportUrl(createdSession.public_token)}
                    >
                      {getGroomingReportUrl(createdSession.public_token)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="h-8 px-2.5 text-xs text-foreground border-border hover:bg-card cursor-pointer shrink-0 font-medium"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" /> Salin
                    </Button>
                  </div>
                </div>

                {/* WhatsApp Message Preview */}
                <div className="space-y-1.5 min-w-0">
                  <span className="text-[11px] font-mono uppercase text-muted-foreground font-semibold">
                    Preview Template WhatsApp:
                  </span>
                  <textarea
                    readOnly
                    value={generateGroomingCheckinWa(
                      createdSession,
                      getGroomingReportUrl(createdSession.public_token)
                    )}
                    rows={7}
                    className="w-full text-xs font-mono text-foreground bg-surface-soft border border-border rounded-xl p-3 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary block shadow-inner"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border/60 sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetForm()
                  navigate('/admin/grooming')
                }}
                className="text-xs h-9.5 border-border rounded-xl cursor-pointer w-full sm:w-auto"
              >
                Ke Dashboard
              </Button>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <a
                  href={createdSession ? getGroomingReportUrl(createdSession.public_token) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-xs h-9.5 px-3 rounded-xl border border-border text-foreground hover:bg-surface-soft cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Buka Live Report
                </a>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSendWa}
                  className="text-xs h-9.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  Kirim WhatsApp ke Owner
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
