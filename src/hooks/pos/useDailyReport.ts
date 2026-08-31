import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { posService } from '@/services/posService'
import {
  NAFSU_MAKAN_OPTIONS,
  MINUM_OPTIONS,
  FESES_OPTIONS,
  URINASI_OPTIONS,
} from '@/constants/pos.constants'
import type { Booking, DailyReport, Pengaturan } from '@/types/pos'
import { toast } from 'sonner'

export interface DailyReportFormData {
  nafsu_makan: string
  minum: string
  feses: string
  urinasi: string
  kondisi_umum: string
  keterangan: string
  foto_url: string
}

const DEFAULT_PENGATURAN: Pengaturan = {
  id: 1,
  nama_usaha: 'Dr. Meow Cat Hotel & Care',
  no_wa_usaha: '081234567890',
  alamat_usaha: 'Jl. Ahmad Yani No. 45, Jakarta Selatan',
  nama_bank: 'BCA (Bank Central Asia)',
  no_rekening: '8735091234',
  atas_nama_rekening: 'Dr. Meow Cat Clinic',
  qris_nmid: 'ID1020304050607',
}

export function useDailyReport() {
  const queryClient = useQueryClient()
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

  // Fetch active bookings from Supabase
  const { data: allBookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['pos_bookings'],
    queryFn: () => posService.fetchBookings(),
    staleTime: 1000 * 30,
  })

  // Fetch settings from Supabase
  const { data: pengaturan = DEFAULT_PENGATURAN } = useQuery<Pengaturan>({
    queryKey: ['pos_pengaturan'],
    queryFn: () => posService.fetchPengaturan(),
    staleTime: 1000 * 60 * 5,
  })

  const activeBookings = useMemo(() => {
    return allBookings.filter(b => b.status === 'aktif')
  }, [allBookings])

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

  // Mutation for saving daily report
  const saveReportMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBooking) throw new Error('Tidak ada booking yang dipilih')

      const reportPayload = {
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
      }

      return posService.upsertDailyReport(reportPayload)
    },
    onSuccess: (saved) => {
      setSavedReport(saved)
      queryClient.invalidateQueries({ queryKey: ['pos_bookings'] })
      if (selectedBooking) {
        queryClient.invalidateQueries({ queryKey: ['pos_booking', selectedBooking.id] })
      }
      setIsFormOpen(false)
      setIsWaModalOpen(true)
      toast.success(`Laporan harian untuk ${selectedBooking?.cat?.nama || 'kucing'} berhasil disimpan!`)
    },
    onError: (err: any) => {
      console.error('Error saving daily report:', err)
      toast.error(err.message || 'Gagal menyimpan laporan harian')
    },
  })

  const saveReport = async () => {
    return saveReportMutation.mutateAsync()
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
    pengaturan,
    isLoading,
    isSaving: saveReportMutation.isPending,
  }
}
