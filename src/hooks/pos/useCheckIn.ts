import { useState, useMemo } from 'react'
import { usePosStore } from '@/data/pos-store'
import type { Owner, Cat, Booking, Transaction } from '@/types/pos'

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

export function useCheckIn() {
  const store = usePosStore()

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

  // Step 3: Booking state
  const activePakets = useMemo(
    () => store.paketHarga.filter(p => p.aktif),
    [store.paketHarga]
  )

  const defaultPaket = activePakets[1] || activePakets[0] || {
    nama: 'Standard',
    harga_per_hari: 75000,
  }

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

  // Owner search filter
  const searchResults = useMemo(() => {
    if (!searchOwnerQuery.trim()) return []
    const q = searchOwnerQuery.toLowerCase()
    return store.owners
      .filter(o => o.nama.toLowerCase().includes(q) || o.no_wa.includes(q))
      .map(o => ({
        ...o,
        cats: store.cats.filter(c => c.owner_id === o.id),
      }))
  }, [searchOwnerQuery, store.owners, store.cats])

  // Cats for selected owner
  const ownerCats = useMemo(() => {
    if (!selectedOwner) return []
    return store.cats.filter(c => c.owner_id === selectedOwner.id)
  }, [selectedOwner, store.cats])

  // Select existing owner
  const selectOwner = (owner: Owner) => {
    setSelectedOwner(owner)
    setIsNewOwner(false)
    setSelectedCat(null)
    const existingCats = store.cats.filter(c => c.owner_id === owner.id)
    if (existingCats.length === 0) {
      setIsNewCat(true)
    } else {
      setIsNewCat(false)
    }
    setStep(2)
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

  // Submit Check-In
  const submitCheckIn = (paymentDetails?: {
    method: 'QRIS' | 'Tunai' | 'Transfer'
    cashTendered?: number
    change?: number
    referenceNote?: string
  }): Booking => {
    const nowIso = new Date().toISOString()

    // 1. Resolve Owner
    let ownerId: string
    let finalOwner: Owner
    if (selectedOwner) {
      ownerId = selectedOwner.id
      finalOwner = selectedOwner
    } else {
      ownerId = `own-${Date.now()}`
      finalOwner = {
        id: ownerId,
        nama: newOwnerData.nama,
        no_wa: newOwnerData.no_wa,
        email: newOwnerData.email || undefined,
        alamat: newOwnerData.alamat || undefined,
        created_at: nowIso,
      }
      store.addOwner(finalOwner)
    }

    // 2. Resolve Cat
    let catId: string
    let finalCat: Cat
    if (selectedCat) {
      catId = selectedCat.id
      finalCat = selectedCat
    } else {
      catId = `cat-${Date.now()}`
      finalCat = {
        id: catId,
        owner_id: ownerId,
        nama: newCatData.nama,
        ras: newCatData.ras || undefined,
        jenis_kelamin: newCatData.jenis_kelamin,
        warna: newCatData.warna || undefined,
        umur_estimasi: newCatData.umur_estimasi || undefined,
        catatan_kesehatan: newCatData.catatan_kesehatan || undefined,
        foto_url:
          newCatData.foto_url ||
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60',
        created_at: nowIso,
        owner: finalOwner,
      }
      store.addCat(finalCat)
    }

    // 3. Create Booking
    const bookingId = `bk-${Date.now()}`
    const newBooking: Booking = {
      id: bookingId,
      cat_id: catId,
      owner_id: ownerId,
      tanggal_masuk: bookingData.tanggal_masuk,
      tanggal_keluar_estimasi: bookingData.tanggal_keluar_estimasi,
      paket: bookingData.paket,
      harga_per_hari: bookingData.harga_per_hari,
      catatan: bookingData.catatan || undefined,
      status: 'aktif',
      created_at: nowIso,
      cat: finalCat,
      owner: finalOwner,
      transactions: [],
      daily_reports: [],
      sudah_laporan: false,
    }
    store.addBooking(newBooking)

    // 4. Create DP Transaction if entered
    if (bookingData.dp > 0) {
      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        booking_id: bookingId,
        tipe: 'dp',
        jumlah: Number(bookingData.dp),
        metode_bayar: paymentDetails?.method || 'QRIS',
        uang_diterima: paymentDetails?.cashTendered,
        kembalian: paymentDetails?.change,
        keterangan: paymentDetails?.referenceNote
          ? `DP Penitipan via ${paymentDetails.method} (${paymentDetails.referenceNote})`
          : `DP Penitipan via ${paymentDetails?.method || 'QRIS'}`,
        created_at: nowIso,
      }
      store.addTransaction(tx)
      newBooking.transactions = [tx]
    }

    setCreatedBooking(newBooking)
    return newBooking
  }

  return {
    step,
    setStep,
    // Step 1
    searchOwnerQuery,
    setSearchOwnerQuery,
    searchResults,
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
    pengaturan: store.pengaturan,
  }
}
