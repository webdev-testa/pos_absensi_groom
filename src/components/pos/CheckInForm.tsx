import {
  Search,
  UserPlus,
  Cat as CatIcon,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Info,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatRupiah, hitungMalam } from '@/utils/pos.utils'
import type { useCheckIn } from '@/hooks/pos/useCheckIn'

type CheckInHookReturn = ReturnType<typeof useCheckIn>

interface CheckInFormProps {
  checkIn: CheckInHookReturn
  onInitiateCheckIn?: () => void
}

export function CheckInForm({ checkIn, onInitiateCheckIn }: CheckInFormProps) {
  const {
    step,
    setStep,
    // Step 1
    searchOwnerQuery,
    setSearchOwnerQuery,
    searchResults,
    selectedOwner,
    selectOwner,
    isNewOwner,
    setIsNewOwner,
    chooseNewOwner,
    newOwnerData,
    setNewOwnerData,
    // Step 2
    ownerCats,
    selectedCat,
    setSelectedCat,
    selectCat,
    isNewCat,
    setIsNewCat,
    chooseNewCat,
    newCatData,
    setNewCatData,
    // Step 3
    activePakets,
    bookingData,
    setBookingData,
    selectPaket,
    // Final
    submitCheckIn,
  } = checkIn

  // Step 3 Live calculation
  const totalNights = hitungMalam(
    bookingData.tanggal_masuk,
    bookingData.tanggal_keluar_estimasi
  )
  const totalCost = totalNights * (bookingData.harga_per_hari || 0)
  const sisaBayar = Math.max(0, totalCost - (bookingData.dp || 0))

  return (
    <div className="space-y-6">
      {/* Progress Step Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
        {[
          { num: 1, title: 'Owner / Pemilik' },
          { num: 2, title: 'Data Kucing' },
          { num: 3, title: 'Paket & Check-In' },
        ].map((s, idx) => {
          const isCurrent = step === s.num
          const isDone = step > s.num
          return (
            <div key={s.num} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all ${
                  isCurrent
                    ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20 shadow-xs'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-soft text-ink-muted border border-border'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">
                  Langkah {s.num}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-ink' : 'text-ink-muted'
                  }`}
                >
                  {s.title}
                </div>
              </div>
              {idx < 2 && (
                <div className="hidden md:block w-12 h-0.5 bg-border mx-2" />
              )}
            </div>
          )
        })}
      </div>

      {/* STEP 1: OWNER SELECTION */}
      {step === 1 && (
        <Card className="max-w-2xl mx-auto bg-white border border-border rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/80">
            <div>
              <h2 className="text-base font-heading font-bold text-ink">
                Langkah 1: Pilih atau Daftarkan Owner
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Cari data pelanggan lama berdasarkan Nama / No WA, atau buat baru.
              </p>
            </div>
            {!isNewOwner && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={chooseNewOwner}
                className="text-xs h-8.5 gap-1.5 border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 font-medium cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Owner Baru
              </Button>
            )}
          </div>

          {!isNewOwner ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <Input
                  type="text"
                  placeholder="Ketik nama atau nomor WhatsApp owner (cth: Fara / 0812...)"
                  value={searchOwnerQuery}
                  onChange={e => setSearchOwnerQuery(e.target.value)}
                  className="pl-9.5 h-11 text-xs sm:text-sm bg-surface-card border-border focus-visible:ring-primary rounded-xl"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {searchOwnerQuery.trim() !== '' && (
                <div className="space-y-2 mt-3">
                  <div className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                    Hasil Pencarian ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center bg-[#FAF8F5] rounded-xl border border-hairline">
                      <p className="text-xs text-ink-muted mb-3">
                        Tidak ditemukan data owner dengan kata kunci &quot;{searchOwnerQuery}&quot;
                      </p>
                      <Button
                        type="button"
                        onClick={chooseNewOwner}
                        size="sm"
                        className="text-xs bg-primary hover:bg-primary-hover text-white cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        Buat Data Owner Baru
                      </Button>
                    </div>
                  ) : (
                    searchResults.map(owner => (
                      <div
                        key={owner.id}
                        onClick={() => selectOwner(owner)}
                        className="p-3.5 bg-surface-soft hover:bg-surface-muted/80 border border-hairline hover:border-brand-orange/40 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-ink group-hover:text-brand-orange transition-colors">
                            {owner.nama}
                          </div>
                          <div className="text-xs text-ink-muted font-mono flex items-center gap-2 mt-0.5">
                            <span>📞 {owner.no_wa}</span>
                            {owner.email && <span>• {owner.email}</span>}
                          </div>
                          {owner.cats && owner.cats.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {owner.cats.map(c => (
                                <span
                                  key={c.id}
                                  className="inline-flex items-center text-[10px] bg-white border border-border px-2 py-0.5 rounded-md text-ink-muted"
                                >
                                  🐱 {c.nama} ({c.ras || 'Domestik'})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-brand-orange group-hover:translate-x-1 transition-transform"
                        >
                          Pilih <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {searchOwnerQuery.trim() === '' && (
                <div className="p-8 text-center bg-[#FAF8F5] border border-dashed border-hairline-strong rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-brand-orange flex items-center justify-center mx-auto mb-3 text-xl">
                    🔍
                  </div>
                  <h3 className="text-sm font-semibold text-ink">Cari Data Pelanggan</h3>
                  <p className="text-xs text-ink-muted max-w-sm mx-auto mt-1 mb-4">
                    Ketik nama atau nomor WA di kolom pencarian di atas untuk memilih owner yang sudah terdaftar.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={chooseNewOwner}
                    size="sm"
                    className="text-xs border-hairline font-medium hover:bg-white cursor-pointer"
                  >
                    Atau Klik untuk Buat Owner Baru
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* New Owner Input Form */
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>📝 Mengisi formulir pelanggan baru</span>
                <button
                  type="button"
                  onClick={() => setIsNewOwner(false)}
                  className="text-[11px] underline font-medium text-amber-900 hover:text-amber-700 cursor-pointer"
                >
                  Kembali ke pencarian
                </button>
              </div>

              <div>
                <label htmlFor="owner-fullname" className="block text-xs font-semibold text-ink mb-1">
                  Nama Lengkap Owner *
                </label>
                <Input
                  id="owner-fullname"
                  type="text"
                  placeholder="Contoh: Ibu Rina Kartika"
                  value={newOwnerData.nama}
                  onChange={e =>
                    setNewOwnerData(prev => ({ ...prev, nama: e.target.value }))
                  }
                  className="h-10 text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="owner-phone" className="block text-xs font-semibold text-ink mb-1">
                    Nomor WhatsApp *
                  </label>
                  <Input
                    id="owner-phone"
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={newOwnerData.no_wa}
                    onChange={e =>
                      setNewOwnerData(prev => ({ ...prev, no_wa: e.target.value }))
                    }
                    className="h-10 text-xs sm:text-sm font-mono"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="owner-email" className="block text-xs font-semibold text-ink mb-1">
                    Email (Opsional)
                  </label>
                  <Input
                    id="owner-email"
                    type="email"
                    placeholder="Contoh: rina@gmail.com"
                    value={newOwnerData.email}
                    onChange={e =>
                      setNewOwnerData(prev => ({ ...prev, email: e.target.value }))
                    }
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="owner-address" className="block text-xs font-semibold text-ink mb-1">
                  Alamat Tempat Tinggal
                </label>
                <textarea
                  id="owner-address"
                  placeholder="Contoh: Jl. Cipete Raya No. 10, Jakarta Selatan"
                  value={newOwnerData.alamat}
                  onChange={e =>
                    setNewOwnerData(prev => ({ ...prev, alamat: e.target.value }))
                  }
                  rows={2}
                  className="w-full text-xs sm:text-sm bg-surface-card border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewOwner(false)}
                  className="text-xs h-9 cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={!newOwnerData.nama.trim() || !newOwnerData.no_wa.trim()}
                  onClick={() => {
                    setSelectedCat(null)
                    setIsNewCat(true)
                    setStep(2)
                  }}
                  className="text-xs h-9 bg-primary hover:bg-primary-hover text-white cursor-pointer"
                >
                  Lanjut ke Data Kucing <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STEP 2: CAT SELECTION */}
      {step === 2 && (
        <Card className="max-w-2xl mx-auto bg-white border border-border rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/80">
            <div>
              <h2 className="text-base font-heading font-bold text-ink">
                Langkah 2: Pilih atau Tambah Kucing
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Owner:{' '}
                <strong className="text-primary">
                  {selectedOwner ? selectedOwner.nama : newOwnerData.nama}
                </strong>
                {selectedOwner && (
                  <span className="font-mono text-ink-muted ml-1">
                    ({selectedOwner.no_wa})
                  </span>
                )}
              </p>
            </div>
            {selectedOwner && !isNewCat && ownerCats.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={chooseNewCat}
                className="text-xs h-8.5 gap-1.5 border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 font-medium cursor-pointer"
              >
                <CatIcon className="w-3.5 h-3.5" />
                + Kucing Baru
              </Button>
            )}
          </div>

          {/* If owner has existing cats and not in new-cat mode */}
          {selectedOwner && !isNewCat && ownerCats.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-ink mb-2">
                Pilih kucing yang akan dititipkan:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ownerCats.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => selectCat(cat)}
                    className="p-4 bg-surface-soft hover:bg-surface-muted/90 border-2 border-hairline hover:border-brand-orange rounded-xl transition-all cursor-pointer flex items-center gap-3.5 group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-border shrink-0">
                      {cat.foto_url ? (
                        <img
                          src={cat.foto_url}
                          alt={cat.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-amber-50">
                          🐾
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-ink group-hover:text-brand-orange transition-colors truncate">
                        {cat.nama}
                      </div>
                      <div className="text-xs text-ink-muted truncate">
                        {cat.ras || 'Domestik'} • {cat.jenis_kelamin || 'Jantan'}
                      </div>
                      {cat.umur_estimasi && (
                        <div className="text-[11px] text-ink-subtle mt-0.5">
                          Usia: {cat.umur_estimasi}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="text-xs h-9 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke Owner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={chooseNewCat}
                  className="text-xs h-9 border-brand-orange text-brand-orange hover:bg-brand-orange/10 cursor-pointer"
                >
                  Tambah Kucing Baru Lainnya
                </Button>
              </div>
            </div>
          ) : (
            /* New Cat Form */
            <div className="space-y-4">
              {selectedOwner && ownerCats.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                  <span>📝 Menambahkan kucing baru untuk {selectedOwner.nama}</span>
                  <button
                    type="button"
                    onClick={() => setIsNewCat(false)}
                    className="text-[11px] underline font-medium text-amber-900 hover:text-amber-700 cursor-pointer"
                  >
                    Pilih dari kucing yang sudah ada
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cat-name" className="block text-xs font-semibold text-ink mb-1">
                    Nama Kucing *
                  </label>
                  <Input
                    id="cat-name"
                    type="text"
                    placeholder="Contoh: Mochi / Milo"
                    value={newCatData.nama}
                    onChange={e =>
                      setNewCatData(prev => ({ ...prev, nama: e.target.value }))
                    }
                    className="h-10 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cat-breed" className="block text-xs font-semibold text-ink mb-1">
                    Ras Kucing
                  </label>
                  <Input
                    id="cat-breed"
                    type="text"
                    placeholder="Contoh: British Shorthair, Persia, Domestik"
                    value={newCatData.ras}
                    onChange={e =>
                      setNewCatData(prev => ({ ...prev, ras: e.target.value }))
                    }
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-ink mb-1">
                    Jenis Kelamin *
                  </span>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Jenis kelamin kucing">
                    {(['Jantan', 'Betina'] as const).map(gender => {
                      const isSelected = newCatData.jenis_kelamin === gender
                      return (
                        <button
                          key={gender}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() =>
                            setNewCatData(prev => ({ ...prev, jenis_kelamin: gender }))
                          }
                          className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-surface-soft text-ink-muted border-border hover:bg-white'
                          }`}
                        >
                          {gender === 'Jantan' ? '♂ Jantan' : '♀ Betina'}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="cat-color" className="block text-xs font-semibold text-ink mb-1">
                    Warna / Corak
                  </label>
                  <Input
                    id="cat-color"
                    type="text"
                    placeholder="Contoh: Abu-abu / Tuxedo"
                    value={newCatData.warna}
                    onChange={e =>
                      setNewCatData(prev => ({ ...prev, warna: e.target.value }))
                    }
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="cat-age" className="block text-xs font-semibold text-ink mb-1">
                    Estimasi Usia
                  </label>
                  <Input
                    id="cat-age"
                    type="text"
                    placeholder="Contoh: 1.5 tahun"
                    value={newCatData.umur_estimasi}
                    onChange={e =>
                      setNewCatData(prev => ({
                        ...prev,
                        umur_estimasi: e.target.value,
                      }))
                    }
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cat-notes" className="block text-xs font-semibold text-ink mb-1">
                  Catatan Kesehatan / Alergi / Kebiasaan
                </label>
                <textarea
                  id="cat-notes"
                  placeholder="Contoh: Alergi ayam, suka treats salmon, riwayat flu sembuh"
                  value={newCatData.catatan_kesehatan}
                  onChange={e =>
                    setNewCatData(prev => ({
                      ...prev,
                      catatan_kesehatan: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full text-xs sm:text-sm bg-surface-card border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="text-xs h-9 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke Owner
                </Button>
                <Button
                  type="button"
                  disabled={!newCatData.nama.trim()}
                  onClick={() => {
                    setSelectedCat(null)
                    setStep(3)
                  }}
                  className="text-xs h-9 bg-primary hover:bg-primary-hover text-white cursor-pointer"
                >
                  Lanjut ke Paket Penitipan <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STEP 3: BOOKING DETAILS & PACKAGE */}
      {step === 3 && (
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <Card className="md:col-span-2 bg-white border border-border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="pb-3 border-b border-border/80">
              <h2 className="text-base font-heading font-bold text-ink">
                Langkah 3: Rincian Paket & Tanggal Menginap
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Kucing:{' '}
                <strong className="text-brand-orange">
                  {selectedCat ? selectedCat.nama : newCatData.nama}
                </strong>{' '}
                • Owner:{' '}
                <strong className="text-primary">
                  {selectedOwner ? selectedOwner.nama : newOwnerData.nama}
                </strong>
              </p>
            </div>

            {/* Paket Selection Cards */}
            <div>
              <span className="block text-xs font-semibold text-ink mb-2">
                Pilih Paket Penitipan *
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Paket penitipan kucing">
                {activePakets.map(pkg => {
                  const isSelected = bookingData.paket === pkg.nama
                  return (
                    <div
                      key={pkg.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault()
                          selectPaket(pkg.nama)
                        }
                      }}
                      onClick={() => selectPaket(pkg.nama)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? 'border-brand-orange bg-amber-50/50 shadow-xs'
                          : 'border-hairline bg-surface-soft hover:bg-white hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-xs text-ink flex items-center gap-1">
                          <Sparkles
                            className={`w-3.5 h-3.5 ${
                              isSelected ? 'text-brand-orange' : 'text-ink-muted'
                            }`}
                          />
                          {pkg.nama}
                        </span>
                        <span className="font-mono text-xs font-bold text-primary">
                          Rp {formatRupiah(pkg.harga_per_hari)}/hr
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted line-clamp-2 leading-snug">
                        {pkg.deskripsi || '-'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Custom Rate per day if needed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-rate" className="block text-xs font-semibold text-ink mb-1">
                  Harga per Hari (Rp)
                </label>
                <Input
                  id="booking-rate"
                  type="number"
                  value={bookingData.harga_per_hari}
                  onChange={e =>
                    setBookingData(prev => ({
                      ...prev,
                      harga_per_hari: Number(e.target.value),
                    }))
                  }
                  className="h-10 text-xs sm:text-sm font-mono"
                />
              </div>

              <div>
                <label htmlFor="booking-dp" className="block text-xs font-semibold text-ink mb-1">
                  Uang Muka / DP (Opsional)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="booking-dp"
                    type="number"
                    placeholder="0"
                    value={bookingData.dp || ''}
                    onChange={e =>
                      setBookingData(prev => ({
                        ...prev,
                        dp: Number(e.target.value),
                      }))
                    }
                    className="pl-8 h-10 text-xs sm:text-sm font-mono text-emerald-700 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-checkin" className="block text-xs font-semibold text-ink mb-1">
                  Tanggal Masuk (Check-In) *
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="booking-checkin"
                    type="date"
                    value={bookingData.tanggal_masuk}
                    onChange={e =>
                      setBookingData(prev => ({
                        ...prev,
                        tanggal_masuk: e.target.value,
                      }))
                    }
                    className="pl-8 h-10 text-xs sm:text-sm font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="booking-checkout" className="block text-xs font-semibold text-ink mb-1">
                  Estimasi Tanggal Keluar (Check-Out) *
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="booking-checkout"
                    type="date"
                    value={bookingData.tanggal_keluar_estimasi}
                    onChange={e =>
                      setBookingData(prev => ({
                        ...prev,
                        tanggal_keluar_estimasi: e.target.value,
                      }))
                    }
                    className="pl-8 h-10 text-xs sm:text-sm font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label htmlFor="booking-notes" className="block text-xs font-semibold text-ink mb-1">
                Catatan Khusus / Permintaan Khusus
              </label>
              <textarea
                id="booking-notes"
                placeholder="Contoh: Tolong disisir sore hari, jangan disatukan dengan kucing lain, bawa makanan sendiri"
                value={bookingData.catatan}
                onChange={e =>
                  setBookingData(prev => ({ ...prev, catatan: e.target.value }))
                }
                rows={2}
                className="w-full text-xs sm:text-sm bg-surface-card border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="text-xs h-9 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (onInitiateCheckIn) {
                    onInitiateCheckIn()
                  } else {
                    submitCheckIn()
                  }
                }}
                className="text-xs h-10 px-5 bg-brand-orange hover:bg-brand-accent-hover text-white font-semibold shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Konfirmasi & Simpan Check-In
              </Button>
            </div>
          </Card>

          {/* Right 1 Col: Summary Card */}
          <div className="space-y-4">
            <Card className="bg-[#FAF8F5] border border-border rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-hairline font-heading font-bold text-xs text-ink">
                <Info className="w-4 h-4 text-brand-orange" />
                Ringkasan Estimasi Check-In
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <span>Durasi Menginap</span>
                  <span className="font-mono font-bold text-ink">
                    {totalNights} Malam
                  </span>
                </div>

                <div className="flex justify-between text-ink-muted">
                  <span>Paket Dipilih</span>
                  <span className="font-medium text-ink">{bookingData.paket}</span>
                </div>

                <div className="flex justify-between text-ink-muted">
                  <span>Tarif / Malam</span>
                  <span className="font-mono text-ink">
                    Rp {formatRupiah(bookingData.harga_per_hari)}
                  </span>
                </div>

                <div className="pt-2 border-t border-hairline flex justify-between font-bold text-ink text-sm">
                  <span>Total Estimasi</span>
                  <span className="font-mono text-primary">
                    Rp {formatRupiah(totalCost)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg text-[11px] font-medium">
                  <span>DP Dibayar Sekarang</span>
                  <span className="font-mono font-bold">
                    - Rp {formatRupiah(bookingData.dp || 0)}
                  </span>
                </div>

                <div className="flex justify-between bg-white p-2.5 rounded-xl border border-hairline text-xs font-semibold text-ink">
                  <span>Sisa Pelunasan Nanti</span>
                  <span className="font-mono text-brand-orange font-bold">
                    Rp {formatRupiah(sisaBayar)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-hairline text-[11px] text-ink-muted leading-relaxed">
                ✨ Setelah klik <strong>Konfirmasi Check-In</strong>, modal template WhatsApp akan otomatis terbuka untuk dikirimkan ke owner.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
