import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { usePengaturan } from '@/hooks/pos/usePengaturan'
import { posService } from '@/services/posService'
import { formatRupiah } from '@/utils/pos.utils'
import type { PaketHarga } from '@/types/pos'
import {
  Building2,
  Package,
  Plus,
  Edit2,
  Save,
  Sparkles,
  ArrowLeft,
  DollarSign,
  QrCode,
  UploadCloud,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function Pengaturan() {
  const {
    settingsForm,
    setSettingsForm,
    handleSaveSettings,
    isSavingSettings,
    paketList,
    handleAddPaket,
    handleUpdatePaket,
    handleToggleAktif,
  } = usePengaturan()

  const [isUploadingQris, setIsUploadingQris] = useState(false)
  const qrisFileInputRef = useRef<HTMLInputElement>(null)

  // Modal State for Add / Edit Package
  const [isPaketModalOpen, setIsPaketModalOpen] = useState(false)
  const [editingPaket, setEditingPaket] = useState<PaketHarga | null>(null)
  const [paketFormData, setPaketFormData] = useState({
    nama: '',
    harga_per_hari: 50000,
    deskripsi: '',
    aktif: true,
  })

  const openAddPaket = () => {
    setEditingPaket(null)
    setPaketFormData({
      nama: '',
      harga_per_hari: 50000,
      deskripsi: '',
      aktif: true,
    })
    setIsPaketModalOpen(true)
  }

  const openEditPaket = (pkg: PaketHarga) => {
    setEditingPaket(pkg)
    setPaketFormData({
      nama: pkg.nama,
      harga_per_hari: pkg.harga_per_hari,
      deskripsi: pkg.deskripsi || '',
      aktif: pkg.aktif,
    })
    setIsPaketModalOpen(true)
  }

  const handleSavePaketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!paketFormData.nama.trim()) {
      toast.error('Nama paket wajib diisi!')
      return
    }

    const hargaNum = Number(paketFormData.harga_per_hari)
    if (isNaN(hargaNum) || hargaNum <= 0) {
      toast.error('Harga per hari harus lebih dari Rp 0')
      return
    }

    if (editingPaket) {
      handleUpdatePaket(editingPaket.id, {
        nama: paketFormData.nama.trim(),
        harga_per_hari: Math.max(0, hargaNum),
        deskripsi: paketFormData.deskripsi.trim() || undefined,
        aktif: paketFormData.aktif,
      })
    } else {
      handleAddPaket({
        nama: paketFormData.nama.trim(),
        harga_per_hari: Math.max(0, hargaNum),
        deskripsi: paketFormData.deskripsi.trim() || undefined,
        aktif: paketFormData.aktif,
      })
    }
    setIsPaketModalOpen(false)
  }

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault()
    handleSaveSettings()
  }

  const handleQrisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingQris(true)
      const url = await posService.uploadPhoto(file, 'qris')
      setSettingsForm(prev => ({
        ...prev,
        qris_image_url: url,
      }))
      toast.success('Foto QRIS berhasil diunggah!', {
        description: 'Klik "Simpan Info Usaha & Rekening" untuk menyimpan perubahan.',
      })
    } catch (err: any) {
      console.error('Error uploading QRIS image:', err)
      toast.error(err.message || 'Gagal mengunggah foto QRIS')
    } finally {
      setIsUploadingQris(false)
    }
  }

  return (
    <AdminLayout>
      <div className="font-sans text-foreground space-y-6 pb-12">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
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
                POS Configuration
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground tracking-tight">
                Pengaturan Penitipan Kucing ⚙️
              </h1>
            </div>
          </div>

          <div className="text-xs font-medium text-muted-foreground bg-surface-soft px-3 py-1.5 rounded-xl border border-border self-start sm:self-auto">
            {paketList.length} Paket Kamar Terdaftar
          </div>
        </div>

        {/* CENTERED CONTENT CONTAINER */}
        <div className="max-w-4xl mx-auto space-y-6">

        {/* SECTION A: INFO USAHA */}
        <Card className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border text-foreground">
            <Building2 className="w-4 h-4 text-brand-orange" />
            <div>
              <h2 className="text-sm font-heading font-bold">
                A. Informasi Tempat & Klinik
              </h2>
              <p className="text-xs text-muted-foreground">
                Nama usaha dan kontak ini akan muncul di pesan WhatsApp dan struk pelanggan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveInfo} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Usaha / Klinik *
                </label>
                <Input
                  type="text"
                  value={settingsForm.nama_usaha}
                  onChange={e =>
                    setSettingsForm(prev => ({
                      ...prev,
                      nama_usaha: e.target.value,
                    }))
                  }
                  className="h-10 text-xs sm:text-sm bg-card border-input rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nomor WhatsApp Usaha
                </label>
                <Input
                  type="tel"
                  placeholder="081234567890"
                  value={settingsForm.no_wa_usaha || ''}
                  onChange={e =>
                    setSettingsForm(prev => ({
                      ...prev,
                      no_wa_usaha: e.target.value,
                    }))
                  }
                  className="h-10 text-xs sm:text-sm font-mono bg-card border-input rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Alamat Lengkap
              </label>
              <textarea
                value={settingsForm.alamat_usaha || ''}
                onChange={e =>
                  setSettingsForm(prev => ({
                    ...prev,
                    alamat_usaha: e.target.value,
                  }))
                }
                rows={2}
                className="w-full text-xs sm:text-sm bg-card border border-input rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            {/* Rekening & QRIS Section */}
            <div className="pt-3 border-t border-border space-y-4">
              <div className="text-xs font-heading font-bold text-foreground flex items-center gap-1.5">
                <span>💳 Rekening Bank & QRIS Kasir POS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Nama Bank
                  </label>
                  <Input
                    type="text"
                    placeholder="BCA (Bank Central Asia)"
                    value={settingsForm.nama_bank || ''}
                    onChange={e =>
                      setSettingsForm(prev => ({
                        ...prev,
                        nama_bank: e.target.value,
                      }))
                    }
                    className="h-10 text-xs bg-card border-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Nomor Rekening
                  </label>
                  <Input
                    type="text"
                    placeholder="8735091234"
                    value={settingsForm.no_rekening || ''}
                    onChange={e =>
                      setSettingsForm(prev => ({
                        ...prev,
                        no_rekening: e.target.value,
                      }))
                    }
                    className="h-10 text-xs font-mono bg-card border-input rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Atas Nama Rekening
                  </label>
                  <Input
                    type="text"
                    placeholder="Dr. Meow Cat Clinic"
                    value={settingsForm.atas_nama_rekening || ''}
                    onChange={e =>
                      setSettingsForm(prev => ({
                        ...prev,
                        atas_nama_rekening: e.target.value,
                      }))
                    }
                    className="h-10 text-xs bg-card border-input rounded-xl"
                  />
                </div>
              </div>

              {/* QRIS Config & Image Upload */}
              <div className="p-4 bg-surface-soft border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <QrCode className="w-4 h-4 text-brand-orange" />
                  <span>Pengaturan QRIS Statis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      NMID QRIS (National Merchant ID)
                    </label>
                    <Input
                      type="text"
                      placeholder="ID1020304050607"
                      value={settingsForm.qris_nmid || ''}
                      onChange={e =>
                        setSettingsForm(prev => ({
                          ...prev,
                          qris_nmid: e.target.value,
                        }))
                      }
                      className="h-10 text-xs font-mono bg-card border-input rounded-xl"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Nomor referensi merchant untuk rekonsiliasi pembayaran.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Foto / Gambar QRIS (BCA / Bank / E-Wallet)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        ref={qrisFileInputRef}
                        onChange={handleQrisFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingQris}
                        onClick={() => qrisFileInputRef.current?.click()}
                        className="h-10 text-xs gap-1.5 border-border rounded-xl cursor-pointer"
                      >
                        {isUploadingQris ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5 text-primary" />
                        )}
                        {settingsForm.qris_image_url ? 'Ganti Foto QRIS' : 'Unggah Foto QRIS'}
                      </Button>

                      {settingsForm.qris_image_url && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-card">
                          <img
                            src={settingsForm.qris_image_url}
                            alt="QRIS Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Gambar ini akan ditampilkan pada pop-up kasir QRIS agar pelanggan dapat langsung melakukan scan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSavingSettings}
                className="text-xs h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer gap-1.5 rounded-xl shadow-xs"
              >
                {isSavingSettings ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Simpan Info Usaha & Rekening
              </Button>
            </div>
          </form>
        </Card>

        {/* SECTION B: KELOLA PAKET HARGA */}
        <Card className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border text-foreground">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-orange" />
              <div>
                <h2 className="text-sm font-heading font-bold">
                  B. Kelola Paket Penitipan
                </h2>
                <p className="text-xs text-muted-foreground">
                  Daftar paket harga kamar per hari untuk dipilih saat Check-In.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={openAddPaket}
              size="sm"
              className="text-xs h-9 gap-1.5 bg-brand-orange hover:bg-brand-accent-hover text-white font-medium cursor-pointer rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Paket
            </Button>
          </div>

          <div className="space-y-3 pt-1">
            {paketList.map(pkg => (
              <div
                key={pkg.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  pkg.aktif
                    ? 'bg-card border-border'
                    : 'bg-surface-soft/60 border-border opacity-60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-foreground">
                      {pkg.nama}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        pkg.aktif
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {pkg.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pkg.deskripsi || '-'}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase font-mono">
                      Tarif per Malam
                    </div>
                    <div className="font-mono font-bold text-sm text-primary tabular-nums">
                      Rp {formatRupiah(pkg.harga_per_hari)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditPaket(pkg)}
                      className="text-xs h-8 px-2.5 border-border hover:bg-surface-soft cursor-pointer rounded-lg"
                    >
                      <Edit2 className="w-3 h-3 text-muted-foreground mr-1" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAktif(pkg.id, pkg.aktif)}
                      className={`text-xs h-8 px-2.5 cursor-pointer rounded-lg ${
                        pkg.aktif
                          ? 'border-border text-muted-foreground hover:bg-surface-soft'
                          : 'border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {pkg.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        </div>

        {/* MODAL ADD / EDIT PAKET */}
        <Dialog open={isPaketModalOpen} onOpenChange={setIsPaketModalOpen}>
          <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)] bg-card text-foreground border border-border shadow-2xl p-6 rounded-2xl">
            <DialogHeader className="text-left pb-2 border-b border-border/80">
              <DialogTitle className="text-base font-heading font-bold text-foreground">
                {editingPaket ? 'Edit Paket Penitipan' : 'Tambah Paket Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Konfigurasi nama paket penitipan, tarif harian, dan rincian fasilitas.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSavePaketSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Paket *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Super VIP Suite"
                  value={paketFormData.nama}
                  onChange={e =>
                    setPaketFormData(prev => ({ ...prev, nama: e.target.value }))
                  }
                  className="h-10 text-xs sm:text-sm bg-card border-input rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Harga per Hari / Malam (Rp) *
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    value={paketFormData.harga_per_hari}
                    onChange={e =>
                      setPaketFormData(prev => ({
                        ...prev,
                        harga_per_hari: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="pl-8 h-10 text-xs sm:text-sm font-mono bg-card border-input rounded-xl tabular-nums"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Deskripsi & Fasilitas
                </label>
                <textarea
                  placeholder="Contoh: Ruang AC besar, 3x makan, playtime harian"
                  value={paketFormData.deskripsi}
                  onChange={e =>
                    setPaketFormData(prev => ({
                      ...prev,
                      deskripsi: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full text-xs sm:text-sm bg-card border border-input rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="paket-aktif-checkbox"
                  checked={paketFormData.aktif}
                  onChange={e =>
                    setPaketFormData(prev => ({
                      ...prev,
                      aktif: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label
                  htmlFor="paket-aktif-checkbox"
                  className="text-xs font-medium text-foreground cursor-pointer"
                >
                  Paket aktif & dapat dipilih saat check-in
                </label>
              </div>

              <DialogFooter className="flex gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaketModalOpen(false)}
                  className="text-xs h-10 cursor-pointer rounded-xl border-border"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="text-xs h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer rounded-xl shadow-xs"
                >
                  {editingPaket ? 'Simpan Perubahan' : 'Tambah Paket'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
