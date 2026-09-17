import type { GroomingStep, GroomingStatus, PaketGrooming} from '@/types/pos'

export const GROOMING_STEPS: GroomingStep[] = [
  'check_in',
  'bathing',
  'drying',
  'styling',
  'finishing',
  'done',
]

export const GROOMING_STEP_LABELS: Record<GroomingStep, string> = {
  check_in: 'Check-in & Kondisi Awal',
  bathing: 'Mandi / Bathing',
  drying: 'Pengeringan / Blow Dry',
  styling: 'Styling / Cukur Bulu',
  finishing: 'Finishing Touch & Parfum',
  done: 'Selesai & Siap Dijemput ✨',
}

export const GROOMING_STEP_SHORT_LABELS: Record<GroomingStep, string> = {
  check_in: 'Check-In',
  bathing: 'Mandi',
  drying: 'Kering',
  styling: 'Styling',
  finishing: 'Finishing',
  done: 'Selesai',
}

export const GROOMING_STEP_EMOJI: Record<GroomingStep, string> = {
  check_in: '📋',
  bathing: '🛁',
  drying: '💨',
  styling: '✂️',
  finishing: '✨',
  done: '🎉',
}

export const GROOMING_STATUS_LABELS: Record<GroomingStatus, string> = {
  antrian: 'Dalam Antrian',
  dikerjakan: 'Sedang Dikerjakan',
  selesai: 'Selesai Pengerjaan',
  dijemput: 'Sudah Dijemput',
  dibatalkan: 'Dibatalkan',
}

export const DEFAULT_PAKET_GROOMING: PaketGrooming[] = [
  {
    id: 'pkg-1',
    nama: 'Mandi Sehat / Biasa',
    harga: 65000,
    deskripsi: 'Shampoo premium, conditioner, bersihkan telinga, potong kuku, blow dry',
    durasi_estimasi: 45,
    aktif: true,
  },
  {
    id: 'pkg-2',
    nama: 'Mandi Kutu / Jamur',
    harga: 85000,
    deskripsi: 'Shampoo obat treatment, bilas bersih, potong kuku, blow dry',
    durasi_estimasi: 60,
    aktif: true,
  },
  {
    id: 'pkg-3',
    nama: 'Full Grooming',
    harga: 120000,
    deskripsi: 'Mandi lengkap, potong kuku, styling/cukur rapi, parfum cat-safe',
    durasi_estimasi: 90,
    aktif: true,
  },
  {
    id: 'pkg-4',
    nama: 'Cukur Gundul / Lion Cut',
    harga: 100000,
    deskripsi: 'Shaving bulu gimbal/lion cut + mandi antiseptic',
    durasi_estimasi: 75,
    aktif: true,
  },
]