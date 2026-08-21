import { useState, useMemo } from 'react'
import { usePosStore } from '@/data/pos-store'
import {
  NAFSU_MAKAN_OPTIONS,
  MINUM_OPTIONS,
  FESES_OPTIONS,
  URINASI_OPTIONS,
} from '@/constants/pos.constants'
import type { Booking, DailyReport } from '@/types/pos'

export interface DailyReportFormData {
  nafsu_makan: string
  minum: string
  feses: string
  urinasi: string
  kondisi_umum: string
  keterangan: string
  foto_url: string
}

export function useDailyReport() {
  const store = usePosStore()
  const today = new Date().toISOString().split('T')[0]

  const [filter, setFilter] = useState<'all' | 'unreported' | 'reported'>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // WA Modal state
  const [savedReport, setSavedReport] = useState<DailyReport | null>(null)
  const [isWaModalOpen, setIsWaModalOpen] = useState(false)

  const [formData, setFormData] = useState<DailyReportFormData>({
    nafsu_makan: NAFSU_MAKAN_OPTIONS[0],
    minum: MINUM_OPTIONS[2], // Normal
    feses: FESES_OPTIONS[1], // Normal (padat, coklat)
    urinasi: URINASI_OPTIONS[1], // Normal
    kondisi_umum: '',
    keterangan: '',
    foto_url: '',
  })

  // Full active bookings with today's report
  const activeBookings = useMemo(() => {
    return store.getFullBookings().filter(b => b.status === 'aktif')
  }, [store.bookings, store.cats, store.owners, store.dailyReports])

  const filteredBookings = useMemo(() => {
    if (filter === 'unreported') {
      return activeBookings.filter(b => !b.sudah_laporan)
    }
    if (filter === 'reported') {
      return activeBookings.filter(b => b.sudah_laporan)
    }
    return activeBookings
  }, [activeBookings, filter])

  // Open form for a specific booking
  const openReportForm = (booking: Booking) => {
    setSelectedBooking(booking)

    // Check if report exists for today
    const existing = booking.daily_reports?.find(r => r.tanggal === today)
    if (existing) {
      setFormData({
        nafsu_makan: existing.nafsu_makan,
        minum: existing.minum,
        feses: existing.feses,
        urinasi: existing.urinasi,
        kondisi_umum: existing.kondisi_umum || '',
        keterangan: existing.keterangan || '',
        foto_url: existing.foto_url || '',
      })
    } else {
      setFormData({
        nafsu_makan: NAFSU_MAKAN_OPTIONS[0],
        minum: MINUM_OPTIONS[2],
        feses: FESES_OPTIONS[1],
        urinasi: URINASI_OPTIONS[1],
        kondisi_umum: '',
        keterangan: '',
        foto_url: '',
      })
    }
    setIsFormOpen(true)
  }

  const closeReportForm = () => {
    setIsFormOpen(false)
  }

  // Save report
  const saveReport = (): DailyReport | null => {
    if (!selectedBooking) return null

    const report: DailyReport = {
      id: `rep-${Date.now()}`,
      booking_id: selectedBooking.id,
      cat_id: selectedBooking.cat_id,
      tanggal: today,
      nafsu_makan: formData.nafsu_makan,
      minum: formData.minum,
      feses: formData.feses,
      urinasi: formData.urinasi,
      kondisi_umum: formData.kondisi_umum || undefined,
      keterangan: formData.keterangan || undefined,
      foto_url: formData.foto_url || undefined,
      created_at: new Date().toISOString(),
    }

    store.upsertDailyReport(report)
    setSavedReport(report)
    setIsFormOpen(false)
    setIsWaModalOpen(true)
    return report
  }

  return {
    today,
    filter,
    setFilter,
    activeBookings,
    filteredBookings,
    selectedBooking,
    isFormOpen,
    openReportForm,
    closeReportForm,
    formData,
    setFormData,
    saveReport,
    savedReport,
    isWaModalOpen,
    setIsWaModalOpen,
    pengaturan: store.pengaturan,
  }
}
