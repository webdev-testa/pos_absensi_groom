import { useState } from 'react'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { usePengaturan } from '@/hooks/pos/usePengaturan'
import { formatRupiah } from '@/utils/pos.utils'
import type { PaketHarga } from '@/types/pos'
import {
  Building2,
  Package,
  Plus,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'

export default function Pengaturan() {
  const {
    settingsForm,
    setSettingsForm,
    handleSaveSettings,
    paketList,
    handleAddPaket,
    handleUpdatePaket,
    handleToggleAktif,
    handleResetData,
  } = usePengaturan()

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
    if (!paketFormData.nama.trim()) return

    if (editingPaket) {
      handleUpdatePaket(editingPaket.id, {
        nama: paketFormData.nama.trim(),
        harga_per_hari: Number(paketFormData.harga_per_hari),
        deskripsi: paketFormData.deskripsi.trim() || undefined,
        aktif: paketFormData.aktif,
      })
      toast.success('Paket berhasil diperbarui!')
    } else {
      handleAddPaket({
        nama: paketFormData.nama.trim(),
        harga_per_hari: Number(paketFormData.harga_per_hari),
        deskripsi: paketFormData.deskripsi.trim() || undefined,
        aktif: paketFormData.aktif,
      })
      toast.success('Paket baru berhasil ditambahkan!')
    }
    setIsPaketModalOpen(false)
  }

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault()
    handleSaveSettings()
    toast.success('Pengaturan Info Usaha berhasil disimpan!')
  }

  return (
    <AdminLayout>
      <div className="font-sans text-ink space-y-6 pb-12 max-w-4xl">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <Link to="/admin/pos">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl border-hairline hover:bg-surface-soft cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-ink" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                <Sparkles className="w-3.5 h-3.5" />
                POS Configuration
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-ink tracking-tight">
                Pengaturan Penitipan Kucing ⚙️
              </h1>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              handleResetData()
              toast.info('Data mock telah direset ke data bawaan awal.')
            }}
            className="text-xs h-9 gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data Mock
          </Button>
        </div>

        {/* SECTION A: INFO USAHA */}
        <Card className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border text-ink">
            <Building2 className="w-4 h-4 text-brand-orange" />
            <div>
              <h2 className="text-sm font-heading font-bold">
                A. Informasi Tempat & Klinik
              </h2>
              <p className="text-xs text-ink-muted">
                Nama usaha dan kontak ini akan muncul di pesan WhatsApp dan struk pelanggan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveInfo} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
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
                  className="h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
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
                  className="h-10 text-xs sm:text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
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
                className="w-full text-xs sm:text-sm bg-surface-card border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="text-xs h-9 px-4 bg-primary hover:bg-primary-hover text-white font-medium cursor-pointer gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Info Usaha
              </Button>
            </div>
          </form>
        </Card>

        {/* SECTION B: KELOLA PAKET HARGA */}
        <Card className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border text-ink">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-orange" />
              <div>
                <h2 className="text-sm font-heading font-bold">
                  B. Kelola Paket Penitipan
                </h2>
                <p className="text-xs text-ink-muted">
                  Daftar paket harga kamar per hari untuk dipilih saat Check-In.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={openAddPaket}
              size="sm"
              className="text-xs h-8.5 gap-1.5 bg-brand-orange hover:bg-brand-accent-hover text-white font-medium cursor-pointer"
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
                    ? 'bg-white border-border'
                    : 'bg-surface-soft/60 border-hairline opacity-60'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-ink">
                      {pkg.nama}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        pkg.aktif
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {pkg.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {pkg.deskripsi || '-'}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] text-ink-muted uppercase font-mono">
                      Tarif per Malam
                    </div>
                    <div className="font-mono font-bold text-sm text-primary">
                      Rp {formatRupiah(pkg.harga_per_hari)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditPaket(pkg)}
                      className="text-xs h-8 px-2.5 border-hairline hover:bg-surface-soft cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-ink-muted mr-1" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAktif(pkg.id, pkg.aktif)}
                      className={`text-xs h-8 px-2.5 cursor-pointer ${
                        pkg.aktif
                          ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
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

        {/* MODAL ADD / EDIT PAKET */}
        <Dialog open={isPaketModalOpen} onOpenChange={setIsPaketModalOpen}>
          <DialogContent className="max-w-md bg-white border border-border shadow-2xl p-6 rounded-2xl">
            <DialogHeader className="text-left pb-2 border-b border-border/80">
              <DialogTitle className="text-base font-heading font-bold text-ink">
                {editingPaket ? 'Edit Paket Penitipan' : 'Tambah Paket Baru'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSavePaketSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Nama Paket *
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Super VIP Suite"
                  value={paketFormData.nama}
                  onChange={e =>
                    setPaketFormData(prev => ({ ...prev, nama: e.target.value }))
                  }
                  className="h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Harga per Hari / Malam (Rp) *
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <Input
                    type="number"
                    value={paketFormData.harga_per_hari}
                    onChange={e =>
                      setPaketFormData(prev => ({
                        ...prev,
                        harga_per_hari: Number(e.target.value),
                      }))
                    }
                    className="pl-8 h-10 text-xs sm:text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
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
                  className="w-full text-xs sm:text-sm bg-surface-card border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
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
                  className="text-xs font-medium text-ink cursor-pointer"
                >
                  Paket aktif & dapat dipilih saat check-in
                </label>
              </div>

              <DialogFooter className="flex gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaketModalOpen(false)}
                  className="text-xs h-9 cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="text-xs h-9 px-4 bg-primary hover:bg-primary-hover text-white font-medium cursor-pointer"
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
