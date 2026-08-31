import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  NAFSU_MAKAN_OPTIONS,
  MINUM_OPTIONS,
  FESES_OPTIONS,
  URINASI_OPTIONS,
} from '@/constants/pos.constants'
import { formatTanggal } from '@/utils/pos.utils'
import type { Booking } from '@/types/pos'
import type { DailyReportFormData } from '@/hooks/pos/useDailyReport'
import {
  Utensils,
  Droplets,
  HeartPulse,
  Camera,
  Save,
  Sparkles,
  Info,
} from 'lucide-react'

import { posService } from '@/services/posService'
import { toast } from 'sonner'

interface DailyReportFormProps {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
  today: string
  formData: DailyReportFormData
  setFormData: React.Dispatch<React.SetStateAction<DailyReportFormData>>
  onSave: () => void
}

export function DailyReportForm({
  isOpen,
  onClose,
  booking,
  today,
  formData,
  setFormData,
  onSave,
}: DailyReportFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string>(formData.foto_url || '')
  const [isUploading, setIsUploading] = useState(false)

  if (!booking) return null

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPhotoPreview(localUrl)
      try {
        setIsUploading(true)
        const uploadedUrl = await posService.uploadPhoto(file, 'reports')
        setPhotoPreview(uploadedUrl)
        setFormData(prev => ({ ...prev, foto_url: uploadedUrl }))
        toast.success('Foto berhasil diunggah ke storage!')
      } catch (err: any) {
        console.error('Upload error:', err)
        toast.error(err.message || 'Gagal mengunggah foto')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-w-[calc(100%-2rem)] bg-card text-foreground border border-border shadow-2xl p-6 sm:p-7 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left pb-3 border-b border-border/80">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
            <Sparkles className="w-3.5 h-3.5" />
            Pencatatan Kondisi Harian
          </div>
          <DialogTitle className="text-lg font-heading font-bold text-foreground">
            Laporan Harian: {booking.cat?.nama}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
            <span>🗓️ Tanggal: {formatTanggal(today)}</span>
            <span>•</span>
            <span>Owner: {booking.owner?.nama}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Cat Mini Profile Banner */}
        <div className="flex items-center gap-3 p-3 bg-surface-soft border border-border rounded-xl">
          <div className="w-11 h-11 rounded-lg overflow-hidden bg-card border border-border shrink-0">
            {booking.cat?.foto_url ? (
              <img
                src={booking.cat.foto_url}
                alt={booking.cat.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg bg-amber-500/10">
                🐾
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-foreground truncate">
              {booking.cat?.nama} ({booking.cat?.ras || 'Domestik'})
            </div>
            <div className="text-[11px] text-muted-foreground line-clamp-1">
              {booking.cat?.catatan_kesehatan || 'Kondisi awal sehat'}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono font-medium text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-md">
              Paket {booking.paket}
            </span>
          </div>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            onSave()
          }}
          className="space-y-5 pt-1"
        >
          {/* SECTION 1: NAFSU MAKAN */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-brand-orange" />
              Nafsu Makan *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NAFSU_MAKAN_OPTIONS.map(opt => {
                const isSelected = formData.nafsu_makan === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({ ...prev, nafsu_makan: opt }))
                    }
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                        : 'bg-surface-soft text-foreground hover:bg-card border-border'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SECTION 2: MINUM */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Konsumsi Air Minum *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MINUM_OPTIONS.map(opt => {
                const isSelected = formData.minum === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({ ...prev, minum: opt }))
                    }
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                        : 'bg-surface-soft text-foreground hover:bg-card border-border'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SECTION 3: FESES / BAB */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <span className="text-xs">💩</span>
              Feses (Buang Air Besar / BAB) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FESES_OPTIONS.map(opt => {
                const isSelected = formData.feses === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({ ...prev, feses: opt }))
                    }
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                        : 'bg-surface-soft text-foreground hover:bg-card border-border'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SECTION 4: URINASI / BAK */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <span className="text-xs">🚽</span>
              Urinasi (Buang Air Kecil / BAK) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {URINASI_OPTIONS.map(opt => {
                const isSelected = formData.urinasi === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({ ...prev, urinasi: opt }))
                    }
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                        : 'bg-surface-soft text-foreground hover:bg-card border-border'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SECTION 5: KONDISI UMUM & KETERANGAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                Kondisi Umum & Mood
              </label>
              <textarea
                placeholder="Contoh: Sangat aktif bermain laser, ramah, suka dielus di dagu."
                value={formData.kondisi_umum}
                onChange={e =>
                  setFormData(prev => ({ ...prev, kondisi_umum: e.target.value }))
                }
                rows={3}
                className="w-full text-xs bg-card border border-input rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                Keterangan / Catatan Tambahan
              </label>
              <textarea
                placeholder="Contoh: Bulu sudah disisir sore, treat salmon habis, kandang bersih."
                value={formData.keterangan}
                onChange={e =>
                  setFormData(prev => ({ ...prev, keterangan: e.target.value }))
                }
                rows={3}
                className="w-full text-xs bg-card border border-input rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          {/* SECTION 6: FOTO KUCING HARI INI */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-brand-orange" />
              Foto Kucing Hari Ini
            </label>
            <div className="flex items-center gap-3">
              <label className={`flex items-center gap-2 px-3.5 py-2 bg-surface-soft hover:bg-surface-muted border border-border rounded-xl text-xs font-medium text-foreground cursor-pointer transition-colors ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                <Camera className="w-4 h-4 text-brand-orange" />
                <span>{isUploading ? 'Mengunggah foto...' : 'Pilih Foto dari Galeri / Kamera'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-9 h-9 object-cover rounded-lg border border-border"
                  />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {isUploading ? 'Mengunggah...' : '✓ Foto terlampir'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-10 cursor-pointer rounded-xl border-border"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="text-xs h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs cursor-pointer gap-1.5 rounded-xl"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan & Buka WhatsApp Modal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
