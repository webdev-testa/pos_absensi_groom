import { supabase } from '@/lib/supabase'
import type {
  Owner,
  Cat,
  Booking,
  Transaction,
  DailyReport,
  PaketHarga,
  Pengaturan,
} from '@/types/pos'

// Target the 'pos' schema explicitly
const posDb = () => supabase.schema('pos')

export interface CreateCheckInPayload {
  owner: {
    id?: string
    nama: string
    no_wa: string
    email?: string
    alamat?: string
  }
  cat: {
    id?: string
    nama: string
    ras?: string
    jenis_kelamin?: 'Jantan' | 'Betina'
    warna?: string
    umur_estimasi?: string
    catatan_kesehatan?: string
    foto_url?: string
  }
  booking: {
    tanggal_masuk: string
    tanggal_keluar_estimasi: string
    paket: string
    harga_per_hari: number
    catatan?: string
    dp?: number
    paymentDetails?: {
      method?: 'QRIS' | 'Tunai' | 'Transfer' | string
      cashTendered?: number
      change?: number
      referenceNote?: string
    }
  }
}

export interface ExecuteCheckoutPayload {
  bookingId: string
  checkoutDate: string
  extraCharges: { keterangan: string; jumlah: number }[]
  pelunasanAmount: number
  paymentDetails?: {
    method?: 'QRIS' | 'Tunai' | 'Transfer' | string
    cashTendered?: number
    change?: number
    referenceNote?: string
  }
}

export const posService = {
  /**
   * Fetch all bookings with nested relationships.
   */
  async fetchBookings(): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await posDb()
      .from('bookings')
      .select(`
        *,
        cat:cats(*, owner:owners(*)),
        owner:owners(*),
        transactions(*),
        daily_reports(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching POS bookings:', error)
      throw error
    }

    return (data || []).map((b: any) => ({
      ...b,
      harga_per_hari: Number(b.harga_per_hari),
      transactions: (b.transactions || []).map((t: any) => ({
        ...t,
        jumlah: Number(t.jumlah),
        uang_diterima: t.uang_diterima != null ? Number(t.uang_diterima) : undefined,
        kembalian: t.kembalian != null ? Number(t.kembalian) : undefined,
      })),
      sudah_laporan: (b.daily_reports || []).some((r: any) => r.tanggal === today),
    }))
  },

  /**
   * Fetch a single booking by ID with full nested details.
   */
  async fetchBookingById(id: string): Promise<Booking | null> {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await posDb()
      .from('bookings')
      .select(`
        *,
        cat:cats(*, owner:owners(*)),
        owner:owners(*),
        transactions(*),
        daily_reports(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('Error fetching booking detail:', error)
      throw error
    }

    return {
      ...data,
      harga_per_hari: Number(data.harga_per_hari),
      transactions: (data.transactions || []).map((t: any) => ({
        ...t,
        jumlah: Number(t.jumlah),
        uang_diterima: t.uang_diterima != null ? Number(t.uang_diterima) : undefined,
        kembalian: t.kembalian != null ? Number(t.kembalian) : undefined,
      })),
      sudah_laporan: (data.daily_reports || []).some((r: any) => r.tanggal === today),
    }
  },

  /**
   * Search owners by name or WA number, including their existing cats.
   */
  async searchOwners(query: string): Promise<Owner[]> {
    if (!query.trim()) return []

    const { data, error } = await posDb()
      .from('owners')
      .select('*, cats(*)')
      .or(`no_wa.ilike.%${query}%,nama.ilike.%${query}%`)
      .limit(10)

    if (error) {
      console.error('Error searching owners:', error)
      throw error
    }

    return data || []
  },

  /**
   * Fetch all cats for a specific owner.
   */
  async fetchCatsByOwner(ownerId: string): Promise<Cat[]> {
    const { data, error } = await posDb()
      .from('cats')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cats for owner:', error)
      throw error
    }

    return data || []
  },

  /**
   * Fetch all pricing packages.
   */
  async fetchPaketHarga(): Promise<PaketHarga[]> {
    const { data, error } = await posDb()
      .from('paket_harga')
      .select('*')
      .order('harga_per_hari', { ascending: true })

    if (error) {
      console.error('Error fetching pricing packages:', error)
      throw error
    }

    return (data || []).map((p: any) => ({
      ...p,
      harga_per_hari: Number(p.harga_per_hari),
    }))
  },

  /**
   * Fetch clinic and POS configuration settings.
   */
  async fetchPengaturan(): Promise<Pengaturan> {
    const { data, error } = await posDb()
      .from('pengaturan')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('Error fetching settings:', error)
      throw error
    }

    return data
  },

  /**
   * Complete check-in transaction: resolves owner & cat, creates booking, and records DP.
   */
  async createCheckIn(payload: CreateCheckInPayload): Promise<Booking> {
    // 1. Resolve Owner
    let ownerId = payload.owner.id
    if (!ownerId) {
      // Upsert owner by no_wa or insert
      const { data: newOwner, error: ownerError } = await posDb()
        .from('owners')
        .upsert(
          {
            nama: payload.owner.nama,
            no_wa: payload.owner.no_wa,
            email: payload.owner.email || null,
            alamat: payload.owner.alamat || null,
          },
          { onConflict: 'no_wa' }
        )
        .select()
        .single()

      if (ownerError) {
        console.error('Error creating owner:', ownerError)
        throw new Error(`Gagal menyimpan data pemilik: ${ownerError.message}`)
      }
      ownerId = newOwner.id
    }

    // 2. Resolve Cat
    let catId = payload.cat.id
    if (!catId) {
      const { data: newCat, error: catError } = await posDb()
        .from('cats')
        .insert({
          owner_id: ownerId,
          nama: payload.cat.nama,
          ras: payload.cat.ras || null,
          jenis_kelamin: payload.cat.jenis_kelamin || null,
          warna: payload.cat.warna || null,
          umur_estimasi: payload.cat.umur_estimasi || null,
          catatan_kesehatan: payload.cat.catatan_kesehatan || null,
          foto_url: payload.cat.foto_url || null,
        })
        .select()
        .single()

      if (catError) {
        console.error('Error creating cat:', catError)
        throw new Error(`Gagal menyimpan data kucing: ${catError.message}`)
      }
      catId = newCat.id
    }

    // 3. Create Booking
    const { data: booking, error: bookingError } = await posDb()
      .from('bookings')
      .insert({
        cat_id: catId,
        owner_id: ownerId,
        tanggal_masuk: payload.booking.tanggal_masuk,
        tanggal_keluar_estimasi: payload.booking.tanggal_keluar_estimasi,
        paket: payload.booking.paket,
        harga_per_hari: payload.booking.harga_per_hari,
        catatan: payload.booking.catatan || null,
        status: 'aktif',
      })
      .select(`
        *,
        cat:cats(*, owner:owners(*)),
        owner:owners(*)
      `)
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      throw new Error(`Gagal membuat booking: ${bookingError.message}`)
    }

    // 4. Record DP Transaction if entered
    const dp = Number(payload.booking.dp) || 0
    let recordedTx: Transaction | undefined
    if (dp > 0) {
      const paymentDetails = payload.booking.paymentDetails
      const method = paymentDetails?.method || 'QRIS'
      const { data: tx, error: txError } = await posDb()
        .from('transactions')
        .insert({
          booking_id: booking.id,
          tipe: 'dp',
          jumlah: dp,
          metode_bayar: method,
          uang_diterima: paymentDetails?.cashTendered != null ? Number(paymentDetails.cashTendered) : null,
          kembalian: paymentDetails?.change != null ? Number(paymentDetails.change) : null,
          keterangan: paymentDetails?.referenceNote
            ? `DP Penitipan via ${method} (${paymentDetails.referenceNote})`
            : `DP Penitipan via ${method}`,
        })
        .select()
        .single()

      if (txError) {
        console.error('Error recording DP transaction:', txError)
        // non-fatal for booking, but throw so user is aware
        throw new Error(`Booking tersimpan tapi gagal mencatat DP: ${txError.message}`)
      }
      recordedTx = {
        ...tx,
        jumlah: Number(tx.jumlah),
        uang_diterima: tx.uang_diterima != null ? Number(tx.uang_diterima) : undefined,
        kembalian: tx.kembalian != null ? Number(tx.kembalian) : undefined,
      }
    }

    return {
      ...booking,
      harga_per_hari: Number(booking.harga_per_hari),
      transactions: recordedTx ? [recordedTx] : [],
      daily_reports: [],
      sudah_laporan: false,
    }
  },

  /**
   * Upsert a daily health & care report for a booking on a given date.
   */
  async upsertDailyReport(report: Omit<DailyReport, 'id' | 'created_at'>): Promise<DailyReport> {
    const { data, error } = await posDb()
      .from('daily_reports')
      .upsert(
        {
          booking_id: report.booking_id,
          cat_id: report.cat_id,
          tanggal: report.tanggal,
          nafsu_makan: report.nafsu_makan,
          minum: report.minum,
          feses: report.feses,
          urinasi: report.urinasi,
          kondisi_umum: report.kondisi_umum || null,
          keterangan: report.keterangan || null,
          foto_url: report.foto_url || null,
        },
        { onConflict: 'booking_id,tanggal' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving daily report:', error)
      throw new Error(`Gagal menyimpan laporan harian: ${error.message}`)
    }

    return data
  },

  /**
   * Complete check-out process: records additional charges, settlement payment, and closes booking.
   */
  async executeCheckout(payload: ExecuteCheckoutPayload): Promise<void> {
    const { bookingId, checkoutDate, extraCharges, pelunasanAmount, paymentDetails } = payload

    // 1. Insert Extra Charges Transactions
    if (extraCharges.length > 0) {
      const chargeRows = extraCharges.map(c => ({
        booking_id: bookingId,
        tipe: 'biaya_tambahan' as const,
        jumlah: Number(c.jumlah),
        keterangan: c.keterangan,
      }))

      const { error: chargeError } = await posDb()
        .from('transactions')
        .insert(chargeRows)

      if (chargeError) {
        console.error('Error inserting extra charges:', chargeError)
        throw new Error(`Gagal mencatat biaya tambahan: ${chargeError.message}`)
      }
    }

    // 2. Insert Pelunasan Transaction if > 0
    if (pelunasanAmount > 0) {
      const method = paymentDetails?.method || 'QRIS'
      const { error: pelunasanError } = await posDb()
        .from('transactions')
        .insert({
          booking_id: bookingId,
          tipe: 'pelunasan',
          jumlah: Number(pelunasanAmount),
          metode_bayar: method,
          uang_diterima: paymentDetails?.cashTendered != null ? Number(paymentDetails.cashTendered) : null,
          kembalian: paymentDetails?.change != null ? Number(paymentDetails.change) : null,
          keterangan: paymentDetails?.referenceNote
            ? `Pelunasan Checkout via ${method} (${paymentDetails.referenceNote})`
            : `Pelunasan Checkout via ${method}`,
        })

      if (pelunasanError) {
        console.error('Error inserting pelunasan transaction:', pelunasanError)
        throw new Error(`Gagal mencatat pembayaran pelunasan: ${pelunasanError.message}`)
      }
    }

    // 3. Update Booking to 'selesai'
    const { error: updateError } = await posDb()
      .from('bookings')
      .update({
        status: 'selesai',
        tanggal_keluar_aktual: checkoutDate,
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Error closing booking:', updateError)
      throw new Error(`Gagal mengupdate status checkout booking: ${updateError.message}`)
    }
  },

  /**
   * Update clinic and POS configuration settings.
   */
  async updatePengaturan(settings: Partial<Pengaturan>): Promise<Pengaturan> {
    const { data, error } = await posDb()
      .from('pengaturan')
      .update({
        nama_usaha: settings.nama_usaha,
        no_wa_usaha: settings.no_wa_usaha || null,
        alamat_usaha: settings.alamat_usaha || null,
        nama_bank: settings.nama_bank || null,
        no_rekening: settings.no_rekening || null,
        atas_nama_rekening: settings.atas_nama_rekening || null,
        qris_nmid: settings.qris_nmid || null,
        qris_image_url: settings.qris_image_url || null,
      })
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      throw new Error(`Gagal menyimpan pengaturan: ${error.message}`)
    }

    return data
  },

  /**
   * Add a new pricing package.
   */
  async addPaket(paket: Omit<PaketHarga, 'id'>): Promise<PaketHarga> {
    const { data, error } = await posDb()
      .from('paket_harga')
      .insert({
        nama: paket.nama,
        harga_per_hari: Number(paket.harga_per_hari),
        deskripsi: paket.deskripsi || null,
        aktif: paket.aktif ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding package:', error)
      throw new Error(`Gagal menambah paket: ${error.message}`)
    }

    return {
      ...data,
      harga_per_hari: Number(data.harga_per_hari),
    }
  },

  /**
   * Update an existing pricing package.
   */
  async updatePaket(id: string, partial: Partial<PaketHarga>): Promise<PaketHarga> {
    const updateData: any = {}
    if (partial.nama !== undefined) updateData.nama = partial.nama
    if (partial.harga_per_hari !== undefined) updateData.harga_per_hari = Number(partial.harga_per_hari)
    if (partial.deskripsi !== undefined) updateData.deskripsi = partial.deskripsi
    if (partial.aktif !== undefined) updateData.aktif = partial.aktif

    const { data, error } = await posDb()
      .from('paket_harga')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating package:', error)
      throw new Error(`Gagal memperbarui paket: ${error.message}`)
    }

    return {
      ...data,
      harga_per_hari: Number(data.harga_per_hari),
    }
  },

  /**
   * Upload an image to Supabase Storage bucket 'cat-photos'.
   */
  async uploadPhoto(file: File, folder: 'cats' | 'reports' | 'qris' = 'cats'): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('cat-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading photo:', uploadError)
      throw new Error(`Gagal mengunggah foto: ${uploadError.message}`)
    }

    const { data } = supabase.storage
      .from('cat-photos')
      .getPublicUrl(fileName)

    return data.publicUrl
  },
}
