import type { GroomingStep, GroomingStatus } from '@/types/pos'

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