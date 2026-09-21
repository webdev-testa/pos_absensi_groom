import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { posService, type CreateCheckInPayload } from '@/services/posService'
import type { Owner, Cat, Booking, PaketHarga, Pengaturan } from '@/types/pos'
import { toast } from 'sonner'

export interface NewOwnerForm {
  nama: string
  no_wa: string
  email: string
  alamat: string
}

export interface NewCatForm {
  nama: string
  ras: string
  jenis_kelamin: 'Jantan' | 'Betina'
  warna: string
  umur_estimasi: string
  catatan_kesehatan: string
  foto_url: string
}

export interface BookingForm {
  paket: string
  harga_per_hari: number
  tanggal_masuk: string
  tanggal_keluar_estimasi: string
  catatan: string
  dp: number
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

export function useCheckIn() {
  const queryClient = useQueryClient()
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split('T')[0]
  }, [])

  // Step 1 -> 2 -> 3
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Owner state
  const [searchOwnerQuery, setSearchOwnerQuery] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [isNewOwner, setIsNewOwner] = useState(false)
  const [newOwnerData, setNewOwnerData] = useState<NewOwnerForm>({
    nama: '',
    no_wa: '',
    email: '',
    alamat: '',
  })

  // Step 2: Cat state
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null)
  const [isNewCat, setIsNewCat] = useState(false)
  const [newCatData, setNewCatData] = useState<NewCatForm>({
    nama: '',
    ras: '',
    jenis_kelamin: 'Jantan',
    warna: '',
    umur_estimasi: '',
    catatan_kesehatan: '',
    foto_url: '',
  })

  // Queries
  const { data: searchResults = [], isLoading: isSearchingOwners } = useQuery<Owner[]>({
    queryKey: ['pos_owners_search', searchOwnerQuery],
    queryFn: () => posService.searchOwners(searchOwnerQuery),
    staleTime: 1000 * 10,
  })

  const { data: allPakets = [] } = useQuery<PaketHarga[]>({
    queryKey: ['pos_pakets'],
    queryFn: () => posService.fetchPaketHarga(),
    staleTime: 1000 * 60 * 5,
  })

  const { data: pengaturan = DEFAULT_PENGATURAN } = useQuery<Pengaturan>({
    queryKey: ['pos_pengaturan'],
    queryFn: () => posService.fetchPengaturan(),
    staleTime: 1000 * 60 * 5,
  })

  const activePakets = useMemo(
    () => allPakets.filter(p => p.aktif),
    [allPakets]
  )

  const defaultPaket = activePakets[1] || activePakets[0] || {
    nama: 'Standard',
    harga_per_hari: 75000,
  }

  // Step 3: Booking state
  const [bookingData, setBookingData] = useState<BookingForm>({
    paket: defaultPaket.nama,
    harga_per_hari: defaultPaket.harga_per_hari,
    tanggal_masuk: today,
    tanggal_keluar_estimasi: tomorrow,
    catatan: '',
    dp: 0,
  })

  // Modal result state
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Cats for selected owner
  const ownerCats = useMemo(() => {
    if (!selectedOwner) return []
    return selectedOwner.cats || []
  }, [selectedOwner])

  // Select existing owner
  const selectOwner = (owner: Owner) => {
    setSelectedOwner(owner)
    setIsNewOwner(false)
    setSelectedCat(null)
    const existingCats = owner.cats || []
    if (existingCats.length === 0) {
      setIsNewCat(true)
    } else {
      setIsNewCat(false)
    }
  }

  // Choose to create new owner
  const chooseNewOwner = () => {
    setSelectedOwner(null)
    setIsNewOwner(true)
    setSelectedCat(null)
    setIsNewCat(true)
  }

  // Select existing cat
  const selectCat = (cat: Cat) => {
    setSelectedCat(cat)
    setIsNewCat(false)
    setStep(3)
  }

  // Choose to create new cat for current owner
  const chooseNewCat = () => {
    setSelectedCat(null)
    setIsNewCat(true)
  }

  // Select paket
  const selectPaket = (namaPaket: string) => {
    const pkg = activePakets.find(p => p.nama === namaPaket)
    if (pkg) {
      setBookingData(prev => ({
        ...prev,
        paket: pkg.nama,
        harga_per_hari: pkg.harga_per_hari,
      }))
    }
  }

  // Reset form
  const resetForm = () => {
    setStep(1)
    setSearchOwnerQuery('')
    setSelectedOwner(null)
    setIsNewOwner(false)
    setNewOwnerData({ nama: '', no_wa: '', email: '', alamat: '' })
    setSelectedCat(null)
    setIsNewCat(false)
    setNewCatData({
      nama: '',
      ras: '',
      jenis_kelamin: 'Jantan',
      warna: '',
      umur_estimasi: '',
      catatan_kesehatan: '',
      foto_url: '',
    })
    setBookingData({
      paket: defaultPaket.nama,
      harga_per_hari: defaultPaket.harga_per_hari,
      tanggal_masuk: today,
      tanggal_keluar_estimasi: tomorrow,
      catatan: '',
      dp: 0,
    })
    setCreatedBooking(null)
    setIsModalOpen(false)
  }

  // CheckIn Mutation
  const checkInMutation = useMutation({
    mutationFn: async (paymentDetails?: {
      method?: 'QRIS' | 'Tunai' | 'Transfer' | string
      cashTendered?: number
      change?: number
      referenceNote?: string
    }) => {
      const payload: CreateCheckInPayload = {
        owner: selectedOwner
          ? {
              id: selectedOwner.id,
              nama: selectedOwner.nama,
              no_wa: selectedOwner.no_wa,
              email: selectedOwner.email,
              alamat: selectedOwner.alamat,
            }
          : {
              nama: newOwnerData.nama,
              no_wa: newOwnerData.no_wa,
              email: newOwnerData.email || undefined,
              alamat: newOwnerData.alamat || undefined,
            },
        cat: selectedCat
          ? {
              id: selectedCat.id,
              nama: selectedCat.nama,
              ras: selectedCat.ras,
              jenis_kelamin: selectedCat.jenis_kelamin,
              warna: selectedCat.warna,
              umur_estimasi: selectedCat.umur_estimasi,
              catatan_kesehatan: selectedCat.catatan_kesehatan,
              foto_url: selectedCat.foto_url,
            }
          : {
              nama: newCatData.nama,
              ras: newCatData.ras || undefined,
              jenis_kelamin: newCatData.jenis_kelamin,
              warna: newCatData.warna || undefined,
              umur_estimasi: newCatData.umur_estimasi || undefined,
              catatan_kesehatan: newCatData.catatan_kesehatan || undefined,
              foto_url: newCatData.foto_url || undefined,
            },
        booking: {
          tanggal_masuk: bookingData.tanggal_masuk,
          tanggal_keluar_estimasi: bookingData.tanggal_keluar_estimasi,
          paket: bookingData.paket,
          harga_per_hari: bookingData.harga_per_hari,
          catatan: bookingData.catatan || undefined,
          dp: bookingData.dp,
          paymentDetails,
        },
      }

      return posService.createCheckIn(payload)
    },
    onSuccess: (booking) => {
      setCreatedBooking(booking)
      queryClient.invalidateQueries({ queryKey: ['pos_bookings'] })
      queryClient.invalidateQueries({ queryKey: ['pos_owners_search'] })
      queryClient.invalidateQueries({ queryKey: ['pos_search_owners'] })
      toast.success(`Check-In untuk ${booking.cat?.nama || 'Kucing'} berhasil!`, {
        description: 'Data tamu anabul berhasil disimpan ke database.',
      })
    },
    onError: (err: any) => {
      console.error('Check-In error:', err)
      toast.error(err.message || 'Gagal memproses check-in')
    },
  })

  const isSubmittingRef = useRef(false)

  // Submit Check-In
  const submitCheckIn = async (paymentDetails?: {
    method: 'QRIS' | 'Tunai' | 'Transfer'
    cashTendered?: number
    change?: number
    referenceNote?: string
  }) => {
    if (isSubmittingRef.current) {
      throw new Error('Check-in sedang diproses, mohon tunggu.')
    }
    isSubmittingRef.current = true
    try {
      return await checkInMutation.mutateAsync(paymentDetails)
    } finally {
      isSubmittingRef.current = false
    }
  }

  return {
    step,
    setStep,
    // Step 1
    searchOwnerQuery,
    setSearchOwnerQuery,
    searchResults,
    isSearchingOwners,
    selectedOwner,
    setSelectedOwner,
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
    createdBooking,
    isModalOpen,
    setIsModalOpen,
    resetForm,
    pengaturan,
    isSubmitting: checkInMutation.isPending,
  }
}
