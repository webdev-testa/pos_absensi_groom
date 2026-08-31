import type {
  Owner,
  Cat,
  Booking,
  Transaction,
  DailyReport,
  PaketHarga,
  Pengaturan,
} from '@/types/pos'

export const initialPengaturan: Pengaturan = {
  id: 1,
  nama_usaha: 'Dr. Meow Cat Hotel & Care',
  no_wa_usaha: '081234567890',
  alamat_usaha: 'Jl. Ahmad Yani No. 45, Jakarta Selatan',
  nama_bank: 'BCA (Bank Central Asia)',
  no_rekening: '8735091234',
  atas_nama_rekening: 'Dr. Meow Cat Clinic',
  qris_nmid: 'ID1020304050607',
}

export const initialPaketHarga: PaketHarga[] = [
  {
    id: 'p-1',
    nama: 'Basic',
    harga_per_hari: 50000,
    deskripsi: 'Kandang standar, makan 2x sehari, air minum steril',
    aktif: true,
  },
  {
    id: 'p-2',
    nama: 'Standard',
    harga_per_hari: 75000,
    deskripsi: 'Kandang standar, makan 3x sehari, playtime 30 menit',
    aktif: true,
  },
  {
    id: 'p-3',
    nama: 'Premium',
    harga_per_hari: 100000,
    deskripsi: 'Kandang besar, makan 3x sehari, grooming ringan, playtime 45 menit',
    aktif: true,
  },
  {
    id: 'p-4',
    nama: 'VIP Suite',
    harga_per_hari: 150000,
    deskripsi: 'Ruangan ber-AC privat, webcam live, wet food premium, daily grooming',
    aktif: true,
  },
]

export const initialOwners: Owner[] = [
  {
    id: 'own-1',
    nama: 'Fara Anindya',
    no_wa: '081298765432',
    email: 'fara.anindya@gmail.com',
    alamat: 'Jl. Kemang Raya No. 18, Jakarta Selatan',
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'own-2',
    nama: 'Budi Santoso',
    no_wa: '081311223344',
    email: 'budi.santoso@yahoo.com',
    alamat: 'Jl. Tebet Barat Dalam No. 12, Jakarta Selatan',
    created_at: '2026-02-10T14:30:00Z',
  },
  {
    id: 'own-3',
    nama: 'Siti Rahmawati',
    no_wa: '085788990011',
    email: 'siti.rahma@outlook.com',
    alamat: 'Apartemen Kalibata City Tower Kemuning, Jakarta Selatan',
    created_at: '2026-02-15T09:15:00Z',
  },
  {
    id: 'own-4',
    nama: 'Reza Pratama',
    no_wa: '087855667788',
    email: 'reza.p@gmail.com',
    alamat: 'Jl. Senopati No. 88, Kebayoran Baru',
    created_at: '2026-02-20T11:45:00Z',
  },
  {
    id: 'own-5',
    nama: 'Amanda Olivia',
    no_wa: '081122334455',
    email: 'amanda.olivia@me.com',
    alamat: 'Jl. Cilandak Tengah No. 24, Jakarta Selatan',
    created_at: '2026-02-25T16:20:00Z',
  },
]

export const initialCats: Cat[] = [
  {
    id: 'cat-1',
    owner_id: 'own-1',
    nama: 'Mochi',
    ras: 'British Shorthair',
    jenis_kelamin: 'Jantan',
    warna: 'Abu-abu (Blue)',
    umur_estimasi: '1.5 tahun',
    catatan_kesehatan: 'Vaksin lengkap, riwayat alergi ayam broiler',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60',
    created_at: '2026-02-01T10:05:00Z',
  },
  {
    id: 'cat-2',
    owner_id: 'own-1',
    nama: 'Matcha',
    ras: 'Scottish Fold',
    jenis_kelamin: 'Betina',
    warna: 'Putih Tabby',
    umur_estimasi: '8 bulan',
    catatan_kesehatan: 'Sehat, aktif, suka treats salmon',
    foto_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&auto=format&fit=crop&q=60',
    created_at: '2026-02-01T10:10:00Z',
  },
  {
    id: 'cat-3',
    owner_id: 'own-2',
    nama: 'Oreo',
    ras: 'Domestik / Tuxedo',
    jenis_kelamin: 'Jantan',
    warna: 'Hitam Putih',
    umur_estimasi: '2 tahun',
    catatan_kesehatan: 'Steril, riwayat flu sembuh',
    foto_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&auto=format&fit=crop&q=60',
    created_at: '2026-02-10T14:35:00Z',
  },
  {
    id: 'cat-4',
    owner_id: 'own-3',
    nama: 'Milo',
    ras: 'Persia Medium',
    jenis_kelamin: 'Jantan',
    warna: 'Orange / Ginger',
    umur_estimasi: '3 tahun',
    catatan_kesehatan: 'Mata sering berair, perlu lap mata harian',
    foto_url: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&auto=format&fit=crop&q=60',
    created_at: '2026-02-15T09:20:00Z',
  },
  {
    id: 'cat-5',
    owner_id: 'own-4',
    nama: 'Luna',
    ras: 'Ragdoll',
    jenis_kelamin: 'Betina',
    warna: 'Seal Point Bicolor',
    umur_estimasi: '1 tahun',
    catatan_kesehatan: 'Sehat, pemalu di tempat baru',
    foto_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&auto=format&fit=crop&q=60',
    created_at: '2026-02-20T11:50:00Z',
  },
  {
    id: 'cat-6',
    owner_id: 'own-5',
    nama: 'Simba',
    ras: 'Maine Coon',
    jenis_kelamin: 'Jantan',
    warna: 'Brown Classic Tabby',
    umur_estimasi: '2.5 tahun',
    catatan_kesehatan: 'Bobot 7.8kg, porsi makan 1.5x kandang VIP',
    foto_url: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=500&auto=format&fit=crop&q=60',
    created_at: '2026-02-25T16:25:00Z',
  },
]

// Helper dates relative to today
const todayObj = new Date()
const formatDateIso = (d: Date) => d.toISOString().split('T')[0]

const getRelativeDateStr = (offsetDays: number) => {
  const d = new Date()
  d.setDate(todayObj.getDate() + offsetDays)
  return formatDateIso(d)
}

const todayStr = getRelativeDateStr(0)
const yesterdayStr = getRelativeDateStr(-1)
const twoDaysAgoStr = getRelativeDateStr(-2)
const threeDaysAgoStr = getRelativeDateStr(-3)
const tomorrowStr = getRelativeDateStr(1)
const inThreeDaysStr = getRelativeDateStr(3)
const inFiveDaysStr = getRelativeDateStr(5)

export const initialBookings: Booking[] = [
  {
    id: 'bk-1',
    cat_id: 'cat-1',
    owner_id: 'own-1',
    tanggal_masuk: threeDaysAgoStr,
    tanggal_keluar_estimasi: tomorrowStr,
    paket: 'Premium',
    harga_per_hari: 100000,
    catatan: 'Tolong sisir bulu setiap sore ya dok',
    status: 'aktif',
    created_at: `${threeDaysAgoStr}T09:00:00Z`,
  },
  {
    id: 'bk-2',
    cat_id: 'cat-2',
    owner_id: 'own-1',
    tanggal_masuk: threeDaysAgoStr,
    tanggal_keluar_estimasi: tomorrowStr,
    paket: 'Premium',
    harga_per_hari: 100000,
    catatan: 'Disatukan di kandang sebelahan sama Mochi',
    status: 'aktif',
    created_at: `${threeDaysAgoStr}T09:00:00Z`,
  },
  {
    id: 'bk-3',
    cat_id: 'cat-3',
    owner_id: 'own-2',
    tanggal_masuk: twoDaysAgoStr,
    tanggal_keluar_estimasi: todayStr, // Checkout today!
    paket: 'Standard',
    harga_per_hari: 75000,
    catatan: 'Jangan dikasih dry food tuna, bikin gatal',
    status: 'aktif',
    created_at: `${twoDaysAgoStr}T11:00:00Z`,
  },
  {
    id: 'bk-4',
    cat_id: 'cat-4',
    owner_id: 'own-3',
    tanggal_masuk: yesterdayStr,
    tanggal_keluar_estimasi: inThreeDaysStr,
    paket: 'Basic',
    harga_per_hari: 50000,
    catatan: 'Pemberian obat tetes mata 2x sehari',
    status: 'aktif',
    created_at: `${yesterdayStr}T14:30:00Z`,
  },
  {
    id: 'bk-5',
    cat_id: 'cat-5',
    owner_id: 'own-4',
    tanggal_masuk: todayStr,
    tanggal_keluar_estimasi: inFiveDaysStr,
    paket: 'VIP Suite',
    harga_per_hari: 150000,
    catatan: 'Bawa selimut kesukaan sendiri di kandang',
    status: 'aktif',
    created_at: `${todayStr}T08:30:00Z`,
  },
  {
    id: 'bk-6',
    cat_id: 'cat-6',
    owner_id: 'own-5',
    tanggal_masuk: getRelativeDateStr(-7),
    tanggal_keluar_estimasi: getRelativeDateStr(-2),
    tanggal_keluar_aktual: getRelativeDateStr(-2),
    paket: 'VIP Suite',
    harga_per_hari: 150000,
    catatan: 'Titip selama dinas luar kota',
    status: 'selesai',
    created_at: `${getRelativeDateStr(-7)}T10:00:00Z`,
  },
]

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    booking_id: 'bk-1',
    tipe: 'dp',
    jumlah: 200000,
    keterangan: 'DP Transfer BCA',
    created_at: `${threeDaysAgoStr}T09:05:00Z`,
  },
  {
    id: 'tx-2',
    booking_id: 'bk-2',
    tipe: 'dp',
    jumlah: 200000,
    keterangan: 'DP Transfer BCA',
    created_at: `${threeDaysAgoStr}T09:05:00Z`,
  },
  {
    id: 'tx-3',
    booking_id: 'bk-3',
    tipe: 'dp',
    jumlah: 50000,
    keterangan: 'DP Tunai',
    created_at: `${twoDaysAgoStr}T11:05:00Z`,
  },
  {
    id: 'tx-4',
    booking_id: 'bk-3',
    tipe: 'biaya_tambahan',
    jumlah: 25000,
    keterangan: 'Snack Creamy Treats Salmon x2',
    created_at: `${yesterdayStr}T15:00:00Z`,
  },
  {
    id: 'tx-5',
    booking_id: 'bk-4',
    tipe: 'dp',
    jumlah: 100000,
    keterangan: 'DP QRIS',
    created_at: `${yesterdayStr}T14:35:00Z`,
  },
  {
    id: 'tx-6',
    booking_id: 'bk-5',
    tipe: 'dp',
    jumlah: 300000,
    keterangan: 'DP Transfer Mandiri',
    created_at: `${todayStr}T08:35:00Z`,
  },
  {
    id: 'tx-7',
    booking_id: 'bk-6',
    tipe: 'dp',
    jumlah: 350000,
    keterangan: 'DP Transfer BCA',
    created_at: `${getRelativeDateStr(-7)}T10:05:00Z`,
  },
  {
    id: 'tx-8',
    booking_id: 'bk-6',
    tipe: 'pelunasan',
    jumlah: 400000,
    keterangan: 'Pelunasan QRIS saat checkout',
    created_at: `${getRelativeDateStr(-2)}T16:00:00Z`,
  },
]

export const initialDailyReports: DailyReport[] = [
  // Mochi (bk-1) reports: 3 days ago, 2 days ago, yesterday, today
  {
    id: 'rep-1',
    booking_id: 'bk-1',
    cat_id: 'cat-1',
    tanggal: twoDaysAgoStr,
    nafsu_makan: 'Sangat baik (habis semua)',
    minum: 'Normal',
    feses: 'Normal (padat, coklat)',
    urinasi: 'Normal',
    kondisi_umum: 'Mochi adaptasi dengan sangat baik, ramah dan suka diajak main.',
    keterangan: 'Makan dry food habis bersih.',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    created_at: `${twoDaysAgoStr}T16:30:00Z`,
  },
  {
    id: 'rep-2',
    booking_id: 'bk-1',
    cat_id: 'cat-1',
    tanggal: yesterdayStr,
    nafsu_makan: 'Baik (hampir habis)',
    minum: 'Banyak',
    feses: 'Normal (padat, coklat)',
    urinasi: 'Normal',
    kondisi_umum: 'Sangat lincah, bermain laser dan feather toy sore hari.',
    keterangan: 'Bulu sudah disisir rapi.',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    created_at: `${yesterdayStr}T17:00:00Z`,
  },
  {
    id: 'rep-3',
    booking_id: 'bk-1',
    cat_id: 'cat-1',
    tanggal: todayStr, // Reported today!
    nafsu_makan: 'Sangat baik (habis semua)',
    minum: 'Normal',
    feses: 'Normal (padat, coklat)',
    urinasi: 'Normal',
    kondisi_umum: 'Sehat prima, nafsu makan tinggi, aktif bermain.',
    keterangan: 'Siap untuk penjemputan besok siang.',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    created_at: `${todayStr}T11:00:00Z`,
  },

  // Matcha (bk-2) reports: yesterday and today
  {
    id: 'rep-4',
    booking_id: 'bk-2',
    cat_id: 'cat-2',
    tanggal: yesterdayStr,
    nafsu_makan: 'Baik (hampir habis)',
    minum: 'Normal',
    feses: 'Normal (padat, coklat)',
    urinasi: 'Normal',
    kondisi_umum: 'Matcha manja sekali, suka dielus di dagu.',
    keterangan: 'Tidur nyenyak di tempat tidur gantung.',
    foto_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80',
    created_at: `${yesterdayStr}T17:15:00Z`,
  },
  {
    id: 'rep-5',
    booking_id: 'bk-2',
    cat_id: 'cat-2',
    tanggal: todayStr, // Reported today!
    nafsu_makan: 'Sangat baik (habis semua)',
    minum: 'Normal',
    feses: 'Normal (padat, coklat)',
    urinasi: 'Normal',
    kondisi_umum: 'Ceria, nafsu makan bagus, treat salmon habis dinikmati.',
    keterangan: 'Kandang bersih dan wangi.',
    foto_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80',
    created_at: `${todayStr}T11:20:00Z`,
  },

  // Oreo (bk-3): reported yesterday, NOT yet reported today (checkout today)
  {
    id: 'rep-6',
    booking_id: 'bk-3',
    cat_id: 'cat-3',
    tanggal: yesterdayStr,
    nafsu_makan: 'Cukup (setengah)',
    minum: 'Normal',
    feses: 'Lembek',
    urinasi: 'Normal',
    kondisi_umum: 'Sedikit grogi di pagi hari tapi sore sudah mau main.',
    keterangan: 'Diberikan wet food gastro prebiotic.',
    foto_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80',
    created_at: `${yesterdayStr}T16:00:00Z`,
  },

  // Milo (bk-4): NOT yet reported today
  // Luna (bk-5): Check-in today, NOT yet reported today
]
