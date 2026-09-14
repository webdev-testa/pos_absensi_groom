import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groomingService } from '@/services/groomingService'
import type { PaketGrooming } from '@/types/pos'
import { formatRupiah } from '@/utils/pos.utils'
import {
  Scissors,
  ArrowLeft,
  Plus,
  Edit2,
  Clock,
  Settings,
  ShieldCheck,
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

export default function GroomingPengaturan() {
  const queryClient = useQueryClient()

  // Query packages
  const { data: packages = [], isLoading } = useQuery<PaketGrooming[]>({
    queryKey: ['paket_grooming'],
    queryFn: () => groomingService.fetchPaketGrooming(),
  })

  // Modal for Add/Edit Package
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pkgForm, setPkgForm] = useState<{
    nama: string
    harga: number
    deskripsi: string
    durasi_estimasi: number
  }>({
    nama: '',
    harga: 75000,
    deskripsi: '',
    durasi_estimasi: 60,
  })

  const openAddModal = () => {
    setEditingId(null)
    setPkgForm({
      nama: '',
      harga: 75000,
      deskripsi: '',
      durasi_estimasi: 60,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (pkg: PaketGrooming) => {
    setEditingId(pkg.id)
    setPkgForm({
      nama: pkg.nama,
      harga: pkg.harga,
      deskripsi: pkg.deskripsi || '',
      durasi_estimasi: pkg.durasi_estimasi || 60,
    })
    setIsModalOpen(true)
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!pkgForm.nama.trim()) throw new Error('Nama paket wajib diisi')
      if (editingId) {
        await groomingService.updatePaketGrooming(editingId, {
          nama: pkgForm.nama,
          harga: Number(pkgForm.harga),
          deskripsi: pkgForm.deskripsi,
          durasi_estimasi: Number(pkgForm.durasi_estimasi),
        })
      } else {
        await groomingService.addPaketGrooming({
          nama: pkgForm.nama,
          harga: Number(pkgForm.harga),
          deskripsi: pkgForm.deskripsi,
          durasi_estimasi: Number(pkgForm.durasi_estimasi),
          aktif: true,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paket_grooming'] })
      setIsModalOpen(false)
      toast.success(
        editingId ? 'Paket grooming berhasil diperbarui!' : 'Paket grooming baru berhasil ditambahkan!'
      )
    },
    onError: (err: any) => {
      toast.error('Gagal menyimpan paket: ' + err.message)
    },
  })

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 font-sans text-foreground max-w-4xl mx-auto">
        {/* HEADER */}
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
                <Settings className="w-3.5 h-3.5" />
                Pengaturan Grooming
              </div>
              <h1 className="text-xl font-bold font-heading text-foreground tracking-tight">
                Kelola Paket & Layanan Grooming
              </h1>
            </div>
          </div>

          <Button
            onClick={openAddModal}
            size="sm"
            className="gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Paket Baru
          </Button>
        </div>

        {/* PACKAGES LIST */}
        <div className="space-y-3">
          <div className="text-xs font-bold font-heading text-foreground uppercase tracking-wider font-mono">
            Daftar Paket Grooming Aktif ({packages.length})
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs font-mono text-muted-foreground">
              Memuat data paket...
            </div>
          ) : packages.length === 0 ? (
            <div className="p-8 text-center bg-card border border-dashed border-border rounded-2xl text-xs text-muted-foreground">
              Belum ada paket grooming yang terdaftar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packages.map(pkg => (
                <Card
                  key={pkg.id}
                  className="bg-card border-border hover:border-border/80 transition-all rounded-2xl shadow-2xs overflow-hidden"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold font-heading text-foreground">{pkg.nama}</h3>
                        {pkg.deskripsi && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {pkg.deskripsi}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold font-heading text-foreground shrink-0 bg-surface-soft px-2.5 py-1 rounded-lg border border-border">
                        Rp {formatRupiah(pkg.harga)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" /> ±
                        {pkg.durasi_estimasi || 60} menit pengerjaan
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(pkg)}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* INFO BANNER */}
        <Card className="bg-surface-soft/60 border-border rounded-2xl p-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-orange" />
            Integrasi WhatsApp 1-Klik (`wa.me`)
          </div>
          <p className="leading-relaxed">
            Pada versi ini, seluruh notifikasi WhatsApp menggunakan protokol tautan langsung <strong>`wa.me`</strong>. Saat staf menekan tombol "Kirim WhatsApp", sistem secara otomatis memformat pesan dengan detail kucing, nama paket, dan <strong>tautan live report unik</strong> untuk disalin atau dikirim langsung ke chat owner.
          </p>
        </Card>

        {/* DIALOG: ADD/EDIT PACKAGE */}
        <Dialog open={isModalOpen} onOpenChange={open => !open && setIsModalOpen(false)}>
          <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl p-6">
            <DialogHeader className="text-left space-y-1 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-orange">
                <Scissors className="w-3.5 h-3.5" />
                {editingId ? 'Edit Paket Grooming' : 'Tambah Paket Grooming'}
              </div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                {editingId ? 'Ubah Informasi Paket' : 'Paket Layanan Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tentukan nama paket, tarif, estimasi waktu pengerjaan, dan detail layanan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Nama Paket Layanan *</label>
                <Input
                  placeholder="Cth: Full Grooming + Anti Kutu"
                  value={pkgForm.nama}
                  onChange={e => setPkgForm(p => ({ ...p, nama: e.target.value }))}
                  className="text-xs h-9 rounded-xl border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Harga (Rp) *</label>
                  <Input
                    type="number"
                    placeholder="Cth: 120000"
                    value={pkgForm.harga}
                    onChange={e => setPkgForm(p => ({ ...p, harga: Number(e.target.value) }))}
                    className="text-xs h-9 rounded-xl border-border bg-background font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Estimasi Waktu (Menit)</label>
                  <Input
                    type="number"
                    placeholder="Cth: 60"
                    value={pkgForm.durasi_estimasi}
                    onChange={e =>
                      setPkgForm(p => ({ ...p, durasi_estimasi: Number(e.target.value) }))
                    }
                    className="text-xs h-9 rounded-xl border-border bg-background font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Deskripsi Layanan Termasuk</label>
                <textarea
                  placeholder="Cth: Mandi shampoo obat, pembersihan telinga, potong kuku, blow dry..."
                  value={pkgForm.deskripsi}
                  onChange={e => setPkgForm(p => ({ ...p, deskripsi: e.target.value }))}
                  rows={3}
                  className="w-full text-xs text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs h-9 border-border rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Paket'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
