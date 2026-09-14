import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { posService } from '@/services/posService'
import { groomingService } from '@/services/groomingService'
import type { Owner, Cat, PaketGrooming, GroomingSession } from '@/types/pos'
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

export interface GroomingBookingForm {
  paketId: string
  paketNama: string
  harga: number
  kondisiAwal: string
  catatan: string
  groomerName: string
  estimasiMenit: number
  sudahBayar: boolean
  metodeBayar: string
}

export function useGroomingForm() {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Owner
  const [searchOwnerQuery, setSearchOwnerQuery] = useState('')
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null)
  const [isNewOwner, setIsNewOwner] = useState(false)
  const [newOwnerData, setNewOwnerData] = useState<NewOwnerForm>({
    nama: '',
    no_wa: '',
    email: '',
    alamat: '',
  })

  // Step 2: Cat
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null)
  const [isNewCat, setIsNewCat] = useState(false)
  const [newCatData, setNewCatData] = useState<NewCatForm>({
    nama: '',
    ras: 'Domestic',
    jenis_kelamin: 'Jantan',
    warna: '',
    umur_estimasi: '',
    catatan_kesehatan: '',
    foto_url: '',
  })

  // Step 3: Grooming Details
  const [formData, setFormData] = useState<GroomingBookingForm>({
    paketId: '',
    paketNama: 'Mandi Sehat / Biasa',
    harga: 65000,
    kondisiAwal: '',
    catatan: '',
    groomerName: 'Budi (Groomer)',
    estimasiMenit: 60,
    sudahBayar: false,
    metodeBayar: 'QRIS',
  })

  // Result state after success
  const [createdSession, setCreatedSession] = useState<GroomingSession | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  // Query: Owners search
  const { data: ownerSearchResults = [], isLoading: isSearchingOwners } = useQuery<Owner[]>({
    queryKey: ['pos_search_owners', searchOwnerQuery],
    queryFn: () => posService.searchOwners(searchOwnerQuery),
    enabled: searchOwnerQuery.length >= 2,
    staleTime: 1000 * 15,
  })

  // Query: Cats for selected owner
  const { data: ownerCats = [], isLoading: isLoadingCats } = useQuery<Cat[]>({
    queryKey: ['pos_owner_cats', selectedOwner?.id],
    queryFn: () => (selectedOwner?.id ? posService.fetchCatsByOwner(selectedOwner.id) : []),
    enabled: !!selectedOwner?.id,
  })

  // Query: Packages
  const { data: packages = [] } = useQuery<PaketGrooming[]>({
    queryKey: ['paket_grooming'],
    queryFn: () => groomingService.fetchPaketGrooming(),
    staleTime: 1000 * 60 * 5,
  })

  // Handlers for Step 1: Owner
  const handleSelectOwner = (owner: Owner) => {
    setSelectedOwner(owner)
    setIsNewOwner(false)
    setSelectedCat(null)
    setIsNewCat(false)
  }

  const handleChooseNewOwner = () => {
    setSelectedOwner(null)
    setIsNewOwner(true)
    setSelectedCat(null)
    setIsNewCat(true)
  }

  // Handlers for Step 2: Cat
  const handleSelectCat = (cat: Cat) => {
    setSelectedCat(cat)
    setIsNewCat(false)
  }

  const handleChooseNewCat = () => {
    setSelectedCat(null)
    setIsNewCat(true)
  }

  // Handlers for Step 3: Package selection
  const handleSelectPackage = (pkg: PaketGrooming) => {
    setFormData(prev => ({
      ...prev,
      paketId: pkg.id,
      paketNama: pkg.nama,
      harga: pkg.harga,
      estimasiMenit: pkg.durasi_estimasi || 60,
    }))
  }

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      // 1. Resolve or create Owner
      let ownerId = selectedOwner?.id
      if (!ownerId) {
        if (!newOwnerData.nama.trim() || !newOwnerData.no_wa.trim()) {
          throw new Error('Nama pemilik dan Nomor WhatsApp wajib diisi!')
        }
        try {
          const owner = await posService.searchOwners(newOwnerData.no_wa)
          if (owner.length > 0) {
            ownerId = owner[0].id
          }
        } catch {
          // ignore
        }
      }

      // 2. Resolve or create Cat
      let catId = selectedCat?.id

      // Calculate estimated finish time
      const estTime = new Date(Date.now() + (formData.estimasiMenit || 60) * 60 * 1000).toISOString()

      // Create session payload
      const session = await groomingService.createSession({
        owner_id: ownerId || 'own-new-' + Date.now(),
        cat_id: catId || 'cat-new-' + Date.now(),
        paket: formData.paketNama,
        harga: formData.harga,
        kondisi_awal: formData.kondisiAwal || undefined,
        catatan: formData.catatan || undefined,
        groomer_name: formData.groomerName || undefined,
        estimasi_selesai: estTime,
        sudah_bayar: formData.sudahBayar,
        metode_bayar: formData.metodeBayar,
      })

      // Attach temporary owner/cat info if created freshly in cache
      if (!session.owner && (selectedOwner || newOwnerData.nama)) {
        session.owner = selectedOwner || {
          id: session.owner_id,
          nama: newOwnerData.nama,
          no_wa: newOwnerData.no_wa,
          created_at: new Date().toISOString(),
        }
      }

      if (!session.cat && (selectedCat || newCatData.nama)) {
        session.cat = selectedCat || {
          id: session.cat_id,
          owner_id: session.owner_id,
          nama: newCatData.nama,
          ras: newCatData.ras,
          jenis_kelamin: newCatData.jenis_kelamin,
          warna: newCatData.warna,
          foto_url: newCatData.foto_url,
          created_at: new Date().toISOString(),
        }
      }

      return session
    },
    onSuccess: (session) => {
      setCreatedSession(session)
      setIsSuccessModalOpen(true)
      queryClient.invalidateQueries({ queryKey: ['grooming_sessions'] })
      toast.success('Check-in Grooming berhasil disimpan!')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Gagal menyimpan check-in grooming.')
    },
  })

  const resetForm = () => {
    setStep(1)
    setSelectedOwner(null)
    setIsNewOwner(false)
    setNewOwnerData({ nama: '', no_wa: '', email: '', alamat: '' })
    setSelectedCat(null)
    setIsNewCat(false)
    setNewCatData({
      nama: '',
      ras: 'Domestic',
      jenis_kelamin: 'Jantan',
      warna: '',
      umur_estimasi: '',
      catatan_kesehatan: '',
      foto_url: '',
    })
    setFormData({
      paketId: '',
      paketNama: 'Mandi Sehat / Biasa',
      harga: 65000,
      kondisiAwal: '',
      catatan: '',
      groomerName: 'Budi (Groomer)',
      estimasiMenit: 60,
      sudahBayar: false,
      metodeBayar: 'QRIS',
    })
    setCreatedSession(null)
    setIsSuccessModalOpen(false)
  }

  return {
    step,
    setStep,
    // Owner
    searchOwnerQuery,
    setSearchOwnerQuery,
    selectedOwner,
    isNewOwner,
    setIsNewOwner,
    newOwnerData,
    setNewOwnerData,
    ownerSearchResults,
    isSearchingOwners,
    handleSelectOwner,
    handleChooseNewOwner,
    // Cat
    selectedCat,
    isNewCat,
    setIsNewCat,
    newCatData,
    setNewCatData,
    ownerCats,
    isLoadingCats,
    handleSelectCat,
    handleChooseNewCat,
    // Details
    formData,
    setFormData,
    packages,
    handleSelectPackage,
    // Submission
    submitCheckIn: createMutation.mutateAsync,
    isSubmitting: createMutation.isPending,
    createdSession,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    resetForm,
  }
}
