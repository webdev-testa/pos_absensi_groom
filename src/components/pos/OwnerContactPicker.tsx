import { useState, useId } from 'react'
import {
  Search,
  X,
  UserPlus,
  CheckCircle2,
  Phone,
  MapPin,
  ArrowRight,
  RotateCcw,
  Users,
  MessageCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Owner } from '@/types/pos'
import { openWhatsApp } from '@/utils/grooming.utils'

export interface NewOwnerFormValues {
  nama: string
  no_wa: string
  email?: string
  alamat?: string
}

export interface OwnerContactPickerProps<T extends NewOwnerFormValues = any> {
  selectedOwner: Owner | null
  onSelectOwner: (owner: Owner) => void
  onClearOwner: () => void
  isNewOwner: boolean
  onToggleNewOwner: (isNew: boolean) => void
  newOwnerData: T
  onChangeNewOwnerData: (updater: (prev: T) => T) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  owners: Owner[]
  isLoading?: boolean
  onProceedNext: () => void
  accentColor?: 'orange' | 'accent'
  title?: string
  description?: string
}

const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return ''
  const clean = phone.replace(/\D/g, '')
  if (clean.length >= 10 && clean.length <= 13) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`
  }
  return phone
}

export function OwnerContactPicker({
  selectedOwner,
  onSelectOwner,
  onClearOwner,
  isNewOwner,
  onToggleNewOwner,
  newOwnerData,
  onChangeNewOwnerData,
  searchQuery,
  onSearchChange,
  owners = [],
  isLoading = false,
  onProceedNext,
  accentColor = 'orange',
  title = 'Identitas Pemilik Kucing',
  description = 'Pilih dari daftar kontak owner terdaftar atau buat pendaftaran baru.',
}: OwnerContactPickerProps) {
  const [selectedSort, setSelectedSort] = useState<'all' | 'with-cats'>('all')
  const namaInputId = useId()
  const noWaInputId = useId()
  const alamatInputId = useId()
  const emailInputId = useId()

  const brandButtonClass =
    accentColor === 'orange'
      ? 'bg-brand-orange hover:bg-brand-orange/90 text-white'
      : 'bg-brand-accent hover:bg-brand-accent-hover text-brand-surface'

  const filteredOwners = owners.filter(owner => {
    if (selectedSort === 'with-cats' && (!owner.cats || owner.cats.length === 0)) {
      return false
    }
    return true
  })

  // Quick action to auto-fill query when creating new owner
  const handleQuickRegisterFromSearch = () => {
    const trimmed = searchQuery.trim()
    const isDigits = /^08\d+$/.test(trimmed) || /^\+?\d{8,}$/.test(trimmed)
    onChangeNewOwnerData(prev => ({
      ...prev,
      nama: isDigits ? prev.nama : trimmed,
      no_wa: isDigits ? trimmed : prev.no_wa,
    }))
    onToggleNewOwner(true)
  }

  return (
    <div className="space-y-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/70">
        <div>
          <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-orange" />
            {title}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        {!isNewOwner && !selectedOwner && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleNewOwner(true)}
            className="text-xs h-9 gap-1.5 rounded-xl border-dashed border-border hover:bg-surface-soft font-semibold cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 text-brand-orange" />
            + Daftarkan Pemilik Baru
          </Button>
        )}
      </div>

      {/* STATE 1: OWNER TERPILIH (HERO SUMMARY) */}
      {selectedOwner && !isNewOwner && (
        <Card className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/5 shadow-xs space-y-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Kontak Owner Terpilih
              </span>
              <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                ID: {selectedOwner.id}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearOwner}
              className="text-xs h-8 gap-1.5 rounded-xl border-border bg-card hover:bg-surface-soft text-muted-foreground hover:text-foreground cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ganti / Cari Owner Lain
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange/15 text-brand-orange border border-brand-orange/25 font-bold font-heading text-xl flex items-center justify-center shrink-0 shadow-xs">
              {selectedOwner.nama?.charAt(0)?.toUpperCase() || 'O'}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold font-heading text-foreground truncate">
                  {selectedOwner.nama}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1 font-mono font-medium text-foreground">
                  <Phone className="w-3.5 h-3.5 text-brand-orange" />
                  {formatPhoneDisplay(selectedOwner.no_wa)}
                </div>

                {selectedOwner.no_wa && (
                  <button
                    type="button"
                    onClick={() =>
                      openWhatsApp(
                        selectedOwner.no_wa,
                        `Halo Kak ${selectedOwner.nama}! 🐾 Kami dari Dr. Meow Care.`
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    title="Kirim pesan WhatsApp"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Buka WhatsApp
                  </button>
                )}

                {selectedOwner.alamat && (
                  <div className="flex items-center gap-1 text-muted-foreground truncate max-w-xs">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{selectedOwner.alamat}</span>
                  </div>
                )}
              </div>

              {selectedOwner.cats && selectedOwner.cats.length > 0 && (
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Kucing Terdaftar:
                  </span>
                  {selectedOwner.cats.map(cat => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-card border border-border text-foreground shadow-2xs"
                    >
                      <span>🐱</span>
                      <span>{cat.nama}</span>
                      {cat.ras && (
                        <span className="text-muted-foreground text-[10px]">({cat.ras})</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              onClick={onProceedNext}
              className={`text-xs h-10 px-6 font-semibold rounded-xl cursor-pointer shadow-xs ${brandButtonClass}`}
            >
              Lanjut ke Pilih Kucing →
            </Button>
          </div>
        </Card>
      )}

      {/* STATE 2: FORM PENDAFTARAN OWNER BARU */}
      {isNewOwner && (
        <Card className="p-5 bg-card border border-border rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              <h3 className="text-sm font-bold font-heading text-foreground">
                Formulir Pendaftaran Owner Baru
              </h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleNewOwner(false)}
              className="text-xs h-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
            >
              ← Batal / Kembali ke Kontak
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label htmlFor={namaInputId} className="text-xs font-semibold text-foreground">
                Nama Lengkap Owner <span className="text-destructive">*</span>
              </label>
              <Input
                id={namaInputId}
                placeholder="Cth: Kak Fara Nabila"
                value={newOwnerData.nama}
                onChange={e =>
                  onChangeNewOwnerData(prev => ({ ...prev, nama: e.target.value }))
                }
                className="text-xs h-10 rounded-xl border-border bg-background"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={noWaInputId} className="text-xs font-semibold text-foreground">
                Nomor WhatsApp Aktif <span className="text-destructive">*</span>
              </label>
              <Input
                id={noWaInputId}
                placeholder="Cth: 081234567890"
                value={newOwnerData.no_wa}
                onChange={e =>
                  onChangeNewOwnerData(prev => ({ ...prev, no_wa: e.target.value }))
                }
                className="text-xs h-10 rounded-xl border-border bg-background"
              />
              {newOwnerData.no_wa && newOwnerData.no_wa.replace(/\D/g, '').length < 8 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Nomor WhatsApp minimal 8 digit angka.
                </p>
              )}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label htmlFor={alamatInputId} className="text-xs font-medium text-foreground">
                Alamat Lengkap (Opsional)
              </label>
              <Input
                id={alamatInputId}
                placeholder="Cth: Jl. Kemang Raya No. 14, Jakarta Selatan"
                value={newOwnerData.alamat || ''}
                onChange={e =>
                  onChangeNewOwnerData(prev => ({ ...prev, alamat: e.target.value }))
                }
                className="text-xs h-10 rounded-xl border-border bg-background"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label htmlFor={emailInputId} className="text-xs font-medium text-foreground">
                Email (Opsional)
              </label>
              <Input
                id={emailInputId}
                type="email"
                placeholder="Cth: owner@gmail.com"
                value={newOwnerData.email || ''}
                onChange={e =>
                  onChangeNewOwnerData(prev => ({ ...prev, email: e.target.value }))
                }
                className="text-xs h-10 rounded-xl border-border bg-background"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onToggleNewOwner(false)}
              className="text-xs h-9 rounded-xl border-border cursor-pointer"
            >
              Batal
            </Button>

            <Button
              type="button"
              onClick={onProceedNext}
              disabled={
                !newOwnerData.nama.trim() ||
                newOwnerData.no_wa.replace(/\D/g, '').length < 8
              }
              className={`text-xs h-9 px-6 font-semibold rounded-xl cursor-pointer ${brandButtonClass}`}
            >
              Simpan & Lanjut ke Data Kucing →
            </Button>
          </div>
        </Card>
      )}

      {/* STATE 3: CONTACT DIRECTORY & SEARCH */}
      {!selectedOwner && !isNewOwner && (
        <div className="space-y-3.5">
          {/* SEARCH INPUT & FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Cari nama owner, nomor WA, atau nama kucing (cth: Fara / 0812 / Milo)..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="pl-10 pr-9 text-xs h-11 rounded-xl border-border bg-card shadow-2xs focus-visible:ring-brand-orange/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Hapus kata kunci pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* QUICK SORT / FILTER CHIPS */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedSort('all')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  selectedSort === 'all'
                    ? 'bg-card border-brand-orange/50 text-foreground font-semibold shadow-2xs'
                    : 'bg-surface-soft border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Semua ({owners.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSort('with-cats')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  selectedSort === 'with-cats'
                    ? 'bg-card border-brand-orange/50 text-foreground font-semibold shadow-2xs'
                    : 'bg-surface-soft border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Punya Kucing ({owners.filter(o => o.cats && o.cats.length > 0).length})
              </button>
            </div>
          </div>

          {/* CONTACT LIST DIRECTORY */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-1">
              <span>
                {searchQuery ? `Hasil Pencarian (${filteredOwners.length})` : `Daftar Kontak Pemilik (${filteredOwners.length})`}
              </span>
              <span className="text-[10px] lowercase text-muted-foreground/70">
                Klik kartu kontak untuk memilih
              </span>
            </div>

            {/* LOADING SKELETON */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border/60 bg-card/60 animate-pulse flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-soft shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 w-28 bg-surface-soft rounded" />
                      <div className="h-2.5 w-20 bg-surface-soft rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CONTACT CARDS GRID */}
            {!isLoading && filteredOwners.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredOwners.map(owner => {
                  const hasCats = owner.cats && owner.cats.length > 0
                  return (
                    <div
                      key={owner.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectOwner(owner)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelectOwner(owner)
                        }
                      }}
                      className="p-3.5 rounded-xl border border-border bg-card hover:bg-surface-soft hover:border-brand-orange/40 transition-all cursor-pointer flex flex-col justify-between gap-2.5 group shadow-2xs hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20 flex items-center justify-center font-bold text-xs font-heading shrink-0 group-hover:scale-105 transition-transform">
                            {owner.nama?.charAt(0)?.toUpperCase() || 'O'}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-bold font-heading text-foreground truncate group-hover:text-brand-orange transition-colors">
                              {owner.nama}
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-muted-foreground/80 shrink-0" />
                              <span>{formatPhoneDisplay(owner.no_wa)}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] px-2.5 rounded-lg text-brand-orange group-hover:bg-brand-orange/10 transition-colors shrink-0 cursor-pointer pointer-events-none"
                        >
                          Pilih <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>

                      {/* CATS OR ADDRESS PREVIEW */}
                      <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                        {hasCats ? (
                          <div className="flex items-center gap-1 overflow-hidden">
                            <span className="text-[10px] shrink-0 font-medium">🐱</span>
                            <span className="truncate text-foreground/80 font-medium">
                              {owner.cats!.map(c => c.nama).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic text-[10px]">
                            Belum ada kucing tercatat
                          </span>
                        )}

                        {owner.alamat && (
                          <span className="text-[10px] text-muted-foreground/70 truncate max-w-[120px] text-right hidden sm:inline">
                            {owner.alamat}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* EMPTY STATE */}
            {!isLoading && filteredOwners.length === 0 && (
              <div className="p-8 text-center bg-card border border-dashed border-border rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center mx-auto text-muted-foreground">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Tidak ditemukan kontak owner
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    {searchQuery
                      ? `Tidak ada kontak yang cocok dengan "${searchQuery}". Anda bisa langsung mendaftarkannya sebagai pelanggan baru.`
                      : 'Belum ada kontak pemilik terdaftar di sistem.'}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleQuickRegisterFromSearch}
                  className={`text-xs h-9 px-4 font-medium rounded-xl cursor-pointer ${brandButtonClass}`}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  {searchQuery
                    ? `+ Daftarkan "${searchQuery}" sebagai Owner Baru`
                    : '+ Daftarkan Pemilik Baru'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
