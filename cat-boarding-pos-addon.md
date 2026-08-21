# 🐱 Cat Boarding POS — Add-on Module Instructions

## Context

This is an add-on to an **existing React + Supabase web app** that already has:
- ✅ Supabase connected (client already initialized)
- ✅ Login / auth working
- ✅ Admin web dashboard with sidebar navigation
- ✅ HR modules: employee management, attendance, kasbon, payroll
- ✅ Employee native mobile app (untouched, not relevant here)

**What this document covers:**
1. New Supabase tables to create (SQL only)
2. New routes and pages to add to the existing React admin web
3. Sidebar navigation update
4. POS-specific components

Do NOT re-do auth, Supabase client setup, or any existing HR module.

---

## Part 1 — New Supabase Tables

Go to **Supabase Dashboard → SQL Editor** and run the following.

---

### Table: owners
```sql
create table owners (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  no_wa text not null unique,
  email text,
  alamat text,
  created_at timestamptz default now()
);
```
> `no_wa` is `unique` on purpose — the check-in flow later does `upsert(..., { onConflict: 'no_wa' })`, which requires a unique constraint on that column to work at all.

### Table: cats
```sql
create table cats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete cascade not null,
  nama text not null,
  ras text,
  jenis_kelamin text check (jenis_kelamin in ('Jantan', 'Betina')),
  warna text,
  umur_estimasi text,
  catatan_kesehatan text,
  foto_url text,
  created_at timestamptz default now()
);
```

### Table: bookings
```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid references cats(id) on delete cascade not null,
  owner_id uuid references owners(id) on delete cascade not null,
  tanggal_masuk date not null,
  tanggal_keluar_estimasi date not null,
  tanggal_keluar_aktual date,
  paket text not null,
  harga_per_hari numeric(12,2) not null,
  catatan text,
  status text default 'aktif' check (status in ('aktif', 'selesai', 'dibatalkan')),
  created_at timestamptz default now()
);
```

### Table: transactions
```sql
create table transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade not null,
  tipe text not null check (tipe in ('dp', 'pelunasan', 'biaya_tambahan')),
  jumlah numeric(12,2) not null,
  keterangan text,
  created_at timestamptz default now()
);
```

### Table: daily_reports
```sql
create table daily_reports (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade not null,
  cat_id uuid references cats(id) on delete cascade not null,
  tanggal date not null,
  nafsu_makan text not null,
  minum text not null,
  feses text not null,
  urinasi text not null,
  kondisi_umum text,
  keterangan text,
  foto_url text,
  created_at timestamptz default now(),
  unique(booking_id, tanggal)
);
```

### Table: paket_harga
```sql
create table paket_harga (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  harga_per_hari numeric(12,2) not null,
  deskripsi text,
  aktif boolean default true
);

-- Default packages — edit as needed
insert into paket_harga (nama, harga_per_hari, deskripsi) values
  ('Basic',    50000,  'Kandang standar, makan 2x sehari'),
  ('Standard', 75000,  'Kandang standar, makan 3x sehari, playtime'),
  ('Premium',  100000, 'Kandang besar, makan 3x sehari, grooming ringan, playtime');
```

### Table: pengaturan

Single-row settings table. Backs the business name used in every WA template and PDF struk — without this, templates would ship with the literal text "[NAMA_TEMPAT]" instead of a real business name.
```sql
create table pengaturan (
  id int primary key default 1,
  nama_usaha text not null default 'Nama Usaha Anda',
  no_wa_usaha text,
  alamat_usaha text,
  constraint pengaturan_single_row check (id = 1)
);

insert into pengaturan (id, nama_usaha) values (1, 'Nama Usaha Anda');
```

### RLS Policies
```sql
-- Enable RLS
alter table owners enable row level security;
alter table cats enable row level security;
alter table bookings enable row level security;
alter table transactions enable row level security;
alter table daily_reports enable row level security;
alter table paket_harga enable row level security;
alter table pengaturan enable row level security;

-- Authenticated staff can do everything
create policy "Staff full access" on owners
  for all to authenticated using (true) with check (true);
create policy "Staff full access" on cats
  for all to authenticated using (true) with check (true);
create policy "Staff full access" on bookings
  for all to authenticated using (true) with check (true);
create policy "Staff full access" on transactions
  for all to authenticated using (true) with check (true);
create policy "Staff full access" on daily_reports
  for all to authenticated using (true) with check (true);
create policy "Staff full access" on paket_harga
  for all to authenticated using (true) with check (true);
create policy "Staff full access" on pengaturan
  for all to authenticated using (true) with check (true);
```

### Storage Bucket
In **Supabase Dashboard → Storage**:
1. Create new bucket named `cat-photos`
2. Toggle **Public bucket** ON

Then run:
```sql
create policy "Public read" on storage.objects
  for select using (bucket_id = 'cat-photos');

create policy "Auth upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'cat-photos');

create policy "Auth delete" on storage.objects
  for delete to authenticated using (bucket_id = 'cat-photos');
```

---

## Part 2 — TypeScript Types

Add these to your existing types file (or create `src/types/pos.types.ts`):

```typescript
export interface Owner {
  id: string
  nama: string
  no_wa: string
  email?: string
  alamat?: string
  created_at: string
}

export interface Cat {
  id: string
  owner_id: string
  nama: string
  ras?: string
  jenis_kelamin?: 'Jantan' | 'Betina'
  warna?: string
  umur_estimasi?: string
  catatan_kesehatan?: string
  foto_url?: string
  created_at: string
  owner?: Owner
}

export interface Booking {
  id: string
  cat_id: string
  owner_id: string
  tanggal_masuk: string
  tanggal_keluar_estimasi: string
  tanggal_keluar_aktual?: string
  paket: string
  harga_per_hari: number
  catatan?: string
  status: 'aktif' | 'selesai' | 'dibatalkan'
  created_at: string
  cat?: Cat
  owner?: Owner
  transactions?: Transaction[]
  daily_reports?: DailyReport[]
}

export interface Transaction {
  id: string
  booking_id: string
  tipe: 'dp' | 'pelunasan' | 'biaya_tambahan'
  jumlah: number
  keterangan?: string
  created_at: string
}

export interface DailyReport {
  id: string
  booking_id: string
  cat_id: string
  tanggal: string
  nafsu_makan: string
  minum: string
  feses: string
  urinasi: string
  kondisi_umum?: string
  keterangan?: string
  foto_url?: string
  created_at: string
}

export interface PaketHarga {
  id: string
  nama: string
  harga_per_hari: number
  deskripsi?: string
  aktif: boolean
}

// For billing calculation at checkout
export interface BillingCalculation {
  jumlah_malam: number
  subtotal: number
  total_dp: number
  total_biaya_tambahan: number
  total: number
  sisa_bayar: number
}
```

---

## Part 3 — New File Structure

Add these files to your existing React project. Do not touch existing HR files.

```
src/
├── pages/pos/                        ← or /views/pos/ — match your existing convention
│   ├── PosDashboard.tsx              ← today's overview
│   ├── CheckIn.tsx                   ← new booking form
│   ├── LaporanHarian.tsx             ← daily report list + form
│   ├── CheckOut.tsx                  ← checkout + billing
│   ├── KucingDetail.tsx              ← per-cat history page
│   └── Pengaturan.tsx                ← manage paket harga
│
├── components/pos/
│   ├── ActiveBookingCard.tsx         ← cat card with report status indicator
│   ├── CheckInForm.tsx               ← multi-step: owner → cat → booking
│   ├── DailyReportForm.tsx           ← checklist form
│   ├── CheckOutForm.tsx              ← billing + payment form
│   ├── BillingSummary.tsx            ← reusable billing display
│   ├── WaTemplateModal.tsx           ← copy-paste WA message modal
│   └── StrukPdf.tsx                  ← PDF receipt generator
│
└── hooks/pos/
    ├── useActiveBookings.ts
    ├── useBookingDetail.ts
    └── useBilling.ts
```

---

## Part 4 — Sidebar Navigation Update

In your existing sidebar component, add a POS section. Keep it visually grouped separately from HR:

```tsx
// Add to your existing sidebar — exact implementation depends on your sidebar component
// Pattern: two groups separated by a divider

// Group 1: existing HR items (unchanged)
{ label: 'Karyawan', path: '/karyawan', icon: Users }
{ label: 'Absensi', path: '/absensi', icon: Clock }
{ label: 'Kasbon', path: '/kasbon', icon: Wallet }
{ label: 'Penggajian', path: '/penggajian', icon: FileText }

// Divider + group label

// Group 2: new POS items
{ label: 'Dashboard Kucing', path: '/pos',           icon: Home }
{ label: 'Check-in Kucing',  path: '/pos/check-in',  icon: PlusCircle }
{ label: 'Laporan Harian',   path: '/pos/laporan',   icon: ClipboardList }
{ label: 'Check-out',        path: '/pos/check-out', icon: LogOut }
{ label: 'Pengaturan POS',   path: '/pos/pengaturan',icon: Settings }
```

Add routes for all `/pos/*` paths in your existing router, pointing to the new page components.

---

## Part 5 — Page Implementations

### 5.1 POS Dashboard (`/pos`)

**What it shows:**
- Stat cards: total kucing aktif, belum laporan hari ini, checkout hari ini/besok
- List of all active bookings today with report status
- Quick action buttons: Check-in Kucing Baru, Buat Laporan Harian

**Query:**
```typescript
const today = new Date().toISOString().split('T')[0]

// Get active bookings with today's report status
const { data } = await supabase
  .from('bookings')
  .select(`
    *,
    cat:cats(*),
    owner:owners(*),
    daily_reports(tanggal)
  `)
  .eq('status', 'aktif')
  .lte('tanggal_masuk', today)

// Derive report status client-side
const withReportStatus = data.map(b => ({
  ...b,
  sudah_laporan: b.daily_reports.some(r => r.tanggal === today)
}))
```

**`ActiveBookingCard` component shows:**
- Cat photo (or paw placeholder)
- Nama kucing + ras
- Owner name + WA number
- Hari ke-N (calculated from tanggal_masuk)
- Green badge if already reported today, orange badge if not
- Amber badge "Keluar hari ini" / "Keluar besok" if checkout is near

---

### 5.2 Check-In Form (`/pos/check-in`)

Multi-step form. Use local state to track step (1 → 2 → 3).

**Step 1 — Owner**

Search existing owner first:
```typescript
// Search by WA number or name as user types
const { data } = await supabase
  .from('owners')
  .select('*, cats(*)')
  .or(`no_wa.ilike.%${query}%,nama.ilike.%${query}%`)
  .limit(5)
```

- If found: show owner card with their cats, let staff tap one → set `selectedOwner` in state, or choose "Owner Baru" to clear it and show the new-owner fields (nama, no_wa, email, alamat)
- If not found: show form fields for new owner directly, `selectedOwner` stays unset

**Step 2 — Cat**

- If `selectedOwner` has existing cats: show cat cards to pick from → tapping one sets `selectedCat` in state, or staff chooses "Tambah Kucing Baru" to clear it and show the new-cat fields
- If new owner, or "Tambah Kucing Baru" was chosen: show fields (nama, ras, jenis_kelamin, warna, umur_estimasi, catatan_kesehatan), `selectedCat` stays unset

`selectedOwner` / `selectedCat` are exactly what the submit logic in Step 3 checks to decide insert vs reuse.

**Step 3 — Booking Details**

```
Paket:              [dropdown from paket_harga table]
Harga/malam:        [auto-filled from paket, editable]
Tanggal Masuk:      [date picker, default today]
Tgl Keluar Estimasi:[date picker]
Catatan:            [text area]
DP (optional):      [number input]
```

**On submit — branch on whether owner/cat were picked from search results (`selectedOwner` / `selectedCat` state from Steps 1–2) or typed as new:**
```typescript
// 1. Owner: reuse if selected from search, otherwise insert new
let ownerId: string
if (selectedOwner) {
  ownerId = selectedOwner.id
} else {
  const { data: owner } = await supabase
    .from('owners')
    .insert(ownerData)
    .select().single()
  ownerId = owner.id
}

// 2. Cat: reuse if selected from search, otherwise insert new
// IMPORTANT: for a returning cat, do NOT insert a new row — reuse the
// existing cat_id, or every repeat visit fragments that cat's daily
// report history across duplicate cat records instead of one timeline.
let catId: string
if (selectedCat) {
  catId = selectedCat.id
} else {
  const { data: cat } = await supabase
    .from('cats')
    .insert({ ...catData, owner_id: ownerId })
    .select().single()
  catId = cat.id
}

// 3. Insert booking — always a new row, even for a returning cat.
// This is what actually represents "this stay" — one cat can have many bookings.
const { data: booking } = await supabase
  .from('bookings')
  .insert({ ...bookingData, cat_id: catId, owner_id: ownerId })
  .select().single()

// 4. Insert DP transaction if amount > 0
if (dpAmount > 0) {
  await supabase.from('transactions')
    .insert({ booking_id: booking.id, tipe: 'dp', jumlah: dpAmount })
}

// 5. Show WA template modal
```
> Wrap steps 1–4 in a try/catch. If step 3 or 4 fails after 1–2 succeeded, you can end up with an orphaned owner/cat and no booking — not fatal, but worth surfacing an error to staff rather than failing silently.

---

### 5.3 Daily Report Form (`/pos/laporan`)

**List view:**
- Show all active cats today as a grid of cards
- Two tabs or filter: "Semua" / "Belum Laporan" / "Sudah Laporan"
- Tap a cat → open report form in a modal or slide-over panel

**Report form fields — use styled radio button groups, not plain radio inputs:**

```
Nafsu Makan (pick one):
  [ Sangat baik ] [ Baik ] [ Cukup ] [ Kurang ] [ Tidak nafsu makan ]

Minum (pick one):
  [ Sangat Banyak ] [ Banyak ] [ Normal ] [ Sedikit ] [ Tidak minum ]

Feses/BAB (pick one):
  [ Tidak BAB ] [ Normal ] [ Lembek ] [ Cair/diare ] [ Ada lendir ] [ Ada darah ]

Urinasi/BAK (pick one):
  [ Tidak BAK ] [ Normal ] [ Sedikit ] [ Banyak/Sering ] [ Warna tidak normal ] [ Mengejan ]

Kondisi Umum:   [text area — optional]
Keterangan:     [text area — optional]
Foto:           [file input — camera preferred on mobile]
```

**Photo upload flow:**
```typescript
// 1. Compress image before upload
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(1200 / img.width, 1200 / img.height, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.8)
    }
    img.src = URL.createObjectURL(file)
  })
}

// 2. Upload to Supabase Storage
const path = `reports/${bookingId}/${tanggal}.jpg`
const { data } = await supabase.storage
  .from('cat-photos')
  .upload(path, compressedBlob, { upsert: true })

// 3. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('cat-photos')
  .getPublicUrl(path)
```

**On save — use upsert so staff can edit today's report:**
```typescript
await supabase
  .from('daily_reports')
  .upsert(
    { booking_id, cat_id, tanggal, ...formData, foto_url: publicUrl },
    { onConflict: 'booking_id,tanggal' }
  )
```

After saving: close form, show `WaTemplateModal` with daily report template.

---

### 5.4 Check-Out (`/pos/check-out`)

**List view:** searchable list of active bookings.

**Billing calculation (derive from DB data):**
```typescript
const calculateBilling = (booking: Booking): BillingCalculation => {
  const checkoutDate = new Date() // or selected date
  const checkinDate = new Date(booking.tanggal_masuk)
  const jumlah_malam = Math.ceil(
    (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const subtotal = jumlah_malam * booking.harga_per_hari
  const total_dp = booking.transactions
    ?.filter(t => t.tipe === 'dp')
    .reduce((sum, t) => sum + t.jumlah, 0) ?? 0
  const total_biaya_tambahan = booking.transactions
    ?.filter(t => t.tipe === 'biaya_tambahan')
    .reduce((sum, t) => sum + t.jumlah, 0) ?? 0
  const total = subtotal + total_biaya_tambahan
  const sisa_bayar = total - total_dp

  return { jumlah_malam, subtotal, total_dp, total_biaya_tambahan, total, sisa_bayar }
}
```

**Form shows:**
- Billing summary (read-only calculation)
- Add biaya tambahan button (repeatable: item description + amount)
- Pelunasan amount input (pre-filled with sisa_bayar)
- Confirm Checkout button

**On confirm:**
```typescript
// 1. Insert biaya_tambahan transactions if any
for (const item of biayaTambahan) {
  await supabase.from('transactions').insert({
    booking_id: booking.id,
    tipe: 'biaya_tambahan',
    jumlah: item.jumlah,
    keterangan: item.keterangan
  })
}

// 2. Insert pelunasan transaction
await supabase.from('transactions').insert({
  booking_id: booking.id,
  tipe: 'pelunasan',
  jumlah: pelunasanAmount
})

// 3. Update booking status
await supabase
  .from('bookings')
  .update({
    status: 'selesai',
    tanggal_keluar_aktual: new Date().toISOString().split('T')[0]
  })
  .eq('id', booking.id)

// 4. Show WA template modal + PDF struk button
```

---

### 5.5 Cat Detail (`/pos/kucing/:bookingId`)

**Sections:**
- Cat info card (foto, nama, ras, jenis kelamin, catatan kesehatan)
- Owner info (nama, no_wa)
- Booking summary (paket, tgl masuk, tgl keluar, status)
- Billing summary
- Daily report timeline — chronological, each entry shows date + kondisi ringkas + foto thumbnail — click to expand full report
- Transaction log

**Query:**
```typescript
const { data: booking } = await supabase
  .from('bookings')
  .select(`
    *,
    cat:cats(*),
    owner:owners(*),
    transactions(*),
    daily_reports(*)
  `)
  .eq('id', bookingId)
  .single()
```

---

### 5.6 Pengaturan (`/pos/pengaturan`)

Two sections on this page:

**A. Info Usaha** — feeds the business name into every WA template and PDF struk, replacing the `[NAMA_TEMPAT]` placeholder.
```typescript
// Load
const { data: settings } = await supabase
  .from('pengaturan')
  .select('*')
  .eq('id', 1)
  .single()

// Save
await supabase
  .from('pengaturan')
  .update({ nama_usaha, no_wa_usaha, alamat_usaha })
  .eq('id', 1)
```
Fields: Nama Usaha, No WA Usaha, Alamat. Fetch this once (e.g. in a small context/hook shared across the POS module) and pass `settings.nama_usaha` into the template generator functions — see Part 6.

**B. Kelola Paket Harga** — simple CRUD over `paket_harga`.
```typescript
const { data: pakets } = await supabase
  .from('paket_harga')
  .select('*')
  .order('harga_per_hari')

await supabase.from('paket_harga').insert({ nama, harga_per_hari, deskripsi })
await supabase.from('paket_harga').update({ harga_per_hari }).eq('id', paketId)
await supabase.from('paket_harga').update({ aktif: false }).eq('id', paketId) // soft-delete
```
Prefer toggling `aktif: false` over a hard delete — bookings store their own `harga_per_hari` snapshot at check-in time, so retiring a package never rewrites the price on past bookings, but a hard delete would break the `paket` name reference on old records.

---

## Part 6 — WA Template Modal

This is the most important component. Reuse it across check-in, daily report, and check-out.

**`src/components/pos/WaTemplateModal.tsx`**

```tsx
// Props
interface WaTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'checkin' | 'daily_report' | 'checkout'
  data: Booking & { billing?: BillingCalculation }
  report?: DailyReport
}
```

**Modal contains:**
- Owner WA number displayed prominently at the top (so staff knows who to message)
- Formatted message in a scrollable `<textarea>` (read-only)
- "Salin Pesan" button — copies text + shows toast "✅ Pesan disalin!"
- If daily report has photo: note below "📸 Jangan lupa kirim foto kucing juga ya!"
- "Tutup" button

---

### Template: Check-in

```typescript
// namaUsaha comes from the pengaturan table (Part 5.6) — fetch once, pass in here
const generateCheckinTemplate = (booking: Booking, dp: number, namaUsaha: string): string => {
  const estimasiMalam = hitungMalam(booking.tanggal_masuk, booking.tanggal_keluar_estimasi)
  const total = estimasiMalam * booking.harga_per_hari
  const sisa = total - dp

  return `Halo ${booking.owner?.nama}! 👋

Terima kasih sudah menitipkan ${booking.cat?.nama} di ${namaUsaha} 🐱

Berikut detail penitipan:
📅 Check-in  : ${formatTanggal(booking.tanggal_masuk)}
📅 Check-out : ${formatTanggal(booking.tanggal_keluar_estimasi)}
📦 Paket     : ${booking.paket} (Rp ${formatRupiah(booking.harga_per_hari)}/malam)
💰 Total Est.: Rp ${formatRupiah(total)}
💳 DP Dibayar: Rp ${formatRupiah(dp)}
💳 Sisa      : Rp ${formatRupiah(sisa)}

${booking.cat?.nama} akan mendapatkan daily report setiap hari ya!
Jika ada pertanyaan, langsung balas pesan ini 😊`
}
```

---

### Template: Daily Report

```typescript
const CHECKBOX = { checked: '✅', unchecked: '☐' }

const check = (value: string, option: string) =>
  value === option ? CHECKBOX.checked : CHECKBOX.unchecked

const generateDailyReportTemplate = (booking: Booking, report: DailyReport): string => {
  const tanggal = formatTanggal(report.tanggal)

  return `📋 DAILY REPORT ${booking.cat?.nama}
🗓️ Tanggal: ${tanggal}
⸻
🍽️ Nafsu Makan
${check(report.nafsu_makan, 'Sangat baik (habis semua)')} Sangat baik (habis semua)
${check(report.nafsu_makan, 'Baik (hampir habis)')} Baik (hampir habis)
${check(report.nafsu_makan, 'Cukup (setengah)')} Cukup (setengah)
${check(report.nafsu_makan, 'Kurang')} Kurang
${check(report.nafsu_makan, 'Tidak nafsu makan')} Tidak nafsu makan
Keterangan:
⸻
💧 Minum
${check(report.minum, 'Sangat Banyak')} Sangat Banyak
${check(report.minum, 'Banyak')} Banyak
${check(report.minum, 'Normal')} Normal
${check(report.minum, 'Sedikit')} Sedikit
${check(report.minum, 'Tidak minum')} Tidak minum
Keterangan:
⸻
💩 Feses (BAB)
${check(report.feses, 'Tidak BAB')} Tidak BAB
${check(report.feses, 'Normal (padat, coklat)')} Normal (padat, coklat)
${check(report.feses, 'Lembek')} Lembek
${check(report.feses, 'Cair (diare)')} Cair (diare)
${check(report.feses, 'Ada lendir')} Ada lendir
${check(report.feses, 'Ada darah')} Ada darah
Keterangan:
⸻
🚽 Urinasi (BAK)
${check(report.urinasi, 'Tidak BAK')} Tidak BAK
${check(report.urinasi, 'Normal')} Normal
${check(report.urinasi, 'Sedikit')} Sedikit
${check(report.urinasi, 'Banyak / Sering')} Banyak / Sering
${check(report.urinasi, 'Warna tidak normal')} Warna tidak normal
${check(report.urinasi, 'Mengejan')} Mengejan
⸻
📝 Kondisi Umum:
${report.kondisi_umum || '-'}

${report.keterangan ? `📌 Keterangan:\n${report.keterangan}` : ''}`
}
```
> ⚠️ `check()` matches by exact string equality against the option labels (`'Sangat baik (habis semua)'`, etc). Define these option strings **once** as shared constants and import them into both the report form and this template generator — if the form's option text ever drifts from the template's hardcoded strings (a typo, a reworded label), the wrong box silently gets checked with no error.
>
> Also note: the three static "Keterangan:" labels under Nafsu Makan / Minum / Feses mirror Fara's original template exactly, but `daily_reports` only stores one overall `keterangan` field — so those three labels will always render blank in the copy-paste text. If Fara actually wants to write a note specific to, say, the Feses section, that needs its own column (e.g. `feses_keterangan`) and its own form field. Worth confirming with her before building the form — it's a few extra input fields either way, just want to flag the choice rather than assume.

---

### Template: Check-out

```typescript
// namaUsaha comes from the pengaturan table (Part 5.6) — fetch once, pass in here
const generateCheckoutTemplate = (booking: Booking, billing: BillingCalculation, namaUsaha: string): string => {
  return `Halo ${booking.owner?.nama}! 👋

${booking.cat?.nama} sudah siap untuk dijemput hari ini 🐱

📋 STRUK CHECKOUT
⸻
Nama Kucing  : ${booking.cat?.nama}
Check-in     : ${formatTanggal(booking.tanggal_masuk)}
Check-out    : ${formatTanggal(booking.tanggal_keluar_aktual!)}
Lama Menginap: ${billing.jumlah_malam} malam
⸻
Paket        : ${booking.paket}
Harga/malam  : Rp ${formatRupiah(booking.harga_per_hari)}
Subtotal     : Rp ${formatRupiah(billing.subtotal)}
Biaya Tambahan: Rp ${formatRupiah(billing.total_biaya_tambahan)}
Total        : Rp ${formatRupiah(billing.total)}
⸻
DP Dibayar   : Rp ${formatRupiah(billing.total_dp)}
Sisa Bayar   : Rp ${formatRupiah(billing.sisa_bayar)}
⸻
Terima kasih sudah menitipkan ${booking.cat?.nama} di ${namaUsaha}!
Sampai jumpa lagi 🐾`
}
```

---

## Part 7 — Utility Functions

Add to your existing utils file or create `src/utils/pos.utils.ts`:

```typescript
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

// Format date to Indonesian: "27 Maret 2026"
export const formatTanggal = (dateStr: string): string =>
  format(new Date(dateStr), 'd MMMM yyyy', { locale: id })

// Format number to Rupiah: "50.000"
export const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat('id-ID').format(amount)

// Calculate days between two dates
export const hitungMalam = (masuk: string, keluar: string): number =>
  Math.ceil(
    (new Date(keluar).getTime() - new Date(masuk).getTime()) / (1000 * 60 * 60 * 24)
  )

// Copy text to clipboard + callback
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
```

---

## Part 8 — PDF Struk (Optional, add last)

Install:
```bash
npm install @react-pdf/renderer
```

Create `src/components/pos/StrukPdf.tsx` with two exports:
- `<StrukCheckin />` — for check-in receipt
- `<StrukCheckout />` — for check-out receipt

Both generated client-side. Trigger with a "Cetak / Download Struk" button that calls `pdf(<StrukCheckout .../>).download('struk-checkout.pdf')`.

**Contents of checkout struk:**
- Header: nama tempat, tanggal cetak
- Detail: nama kucing, owner, paket, tgl masuk–keluar, total malam
- Billing table: subtotal, biaya tambahan, total, DP, sisa bayar
- Footer: no WA tempat, terima kasih

---

## Part 9 — Feature Checklist

Use this to track build progress:

### Supabase
- [ ] All 7 tables created (owners, cats, bookings, transactions, daily_reports, paket_harga, pengaturan)
- [ ] `owners.no_wa` has a unique constraint (required for check-in upsert)
- [ ] RLS policies applied, including `pengaturan`
- [ ] `cat-photos` storage bucket created with policies
- [ ] Default paket_harga seeded
- [ ] Default pengaturan row (id=1) seeded

### Sidebar
- [ ] POS section added with divider
- [ ] All 5 POS routes registered in router

### POS Dashboard
- [ ] Stat cards (aktif, belum laporan, checkout hari ini)
- [ ] Active booking cards with report status badge
- [ ] Checkout-soon alert (hari ini / besok)

### Check-In
- [ ] Owner search (by nama or WA)
- [ ] New owner form
- [ ] Cat selection or new cat form
- [ ] Booking form with paket dropdown
- [ ] DP input
- [ ] Saves all data to DB correctly
- [ ] Opens WA template modal on success

### Laporan Harian
- [ ] Grid of active cats with report status
- [ ] Filter: semua / belum / sudah
- [ ] Report form with styled radio groups
- [ ] Photo upload with compression
- [ ] Upsert (can edit today's report)
- [ ] Opens WA template modal on success

### Check-Out
- [ ] Searchable active bookings list
- [ ] Billing calculation display
- [ ] Biaya tambahan (add multiple)
- [ ] Pelunasan input
- [ ] Updates booking status to 'selesai'
- [ ] Opens WA template modal + PDF button on success

### Kucing Detail
- [ ] Cat + owner info card
- [ ] Booking + billing summary
- [ ] Daily report timeline with photos
- [ ] Transaction history

### Pengaturan
- [ ] Info usaha form (nama, no WA, alamat) saved to `pengaturan` table
- [ ] Template generator functions take `namaUsaha` as a param, no hardcoded placeholder left in code
- [ ] Paket harga CRUD (add, edit harga, toggle aktif — soft delete only)

### WA Template Modal
- [ ] Check-in template generates correctly
- [ ] Daily report template with ✅ / ☐ checkboxes
- [ ] Checkout template with billing breakdown
- [ ] Copy button works + toast confirmation
- [ ] Photo reminder note on daily report

### PDF Struk
- [ ] Check-in struk downloads correctly
- [ ] Check-out struk downloads correctly

---

## Out of Scope

The following are NOT part of this build:
- WhatsApp API integration
- Owner portal / owner login
- Employee attendance / payroll (already built)
- Geofencing / GPS
- Multi-branch support
