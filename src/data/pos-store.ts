import { useState, useEffect } from 'react'
import type {
  Owner,
  Cat,
  Booking,
  Transaction,
  DailyReport,
  PaketHarga,
  Pengaturan,
} from '@/types/pos'
import {
  initialPengaturan,
  initialPaketHarga,
  initialOwners,
  initialCats,
  initialBookings,
  initialTransactions,
  initialDailyReports,
} from './pos-mock'

const STORAGE_KEYS = {
  PENGATURAN: 'drmeow_pos_pengaturan',
  PAKET: 'drmeow_pos_paket',
  OWNERS: 'drmeow_pos_owners',
  CATS: 'drmeow_pos_cats',
  BOOKINGS: 'drmeow_pos_bookings',
  TRANSACTIONS: 'drmeow_pos_transactions',
  REPORTS: 'drmeow_pos_reports',
}

// In-memory memory singleton state with localStorage sync
class PosStore {
  pengaturan: Pengaturan = initialPengaturan
  paketHarga: PaketHarga[] = initialPaketHarga
  owners: Owner[] = initialOwners
  cats: Cat[] = initialCats
  bookings: Booking[] = initialBookings
  transactions: Transaction[] = initialTransactions
  dailyReports: DailyReport[] = initialDailyReports
  listeners: Set<() => void> = new Set()

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return
    try {
      const p = localStorage.getItem(STORAGE_KEYS.PENGATURAN)
      if (p) this.pengaturan = JSON.parse(p)

      const pk = localStorage.getItem(STORAGE_KEYS.PAKET)
      if (pk) this.paketHarga = JSON.parse(pk)

      const o = localStorage.getItem(STORAGE_KEYS.OWNERS)
      if (o) this.owners = JSON.parse(o)

      const c = localStorage.getItem(STORAGE_KEYS.CATS)
      if (c) this.cats = JSON.parse(c)

      const b = localStorage.getItem(STORAGE_KEYS.BOOKINGS)
      if (b) this.bookings = JSON.parse(b)

      const t = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
      if (t) this.transactions = JSON.parse(t)

      const r = localStorage.getItem(STORAGE_KEYS.REPORTS)
      if (r) this.dailyReports = JSON.parse(r)
    } catch (e) {
      console.warn('Failed to load POS state from storage, using initial mock data', e)
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.PENGATURAN, JSON.stringify(this.pengaturan))
      localStorage.setItem(STORAGE_KEYS.PAKET, JSON.stringify(this.paketHarga))
      localStorage.setItem(STORAGE_KEYS.OWNERS, JSON.stringify(this.owners))
      localStorage.setItem(STORAGE_KEYS.CATS, JSON.stringify(this.cats))
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings))
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions))
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.dailyReports))
    } catch (e) {
      console.warn('Failed to save POS state to storage', e)
    }
  }

  notify() {
    this.saveToStorage()
    this.listeners.forEach(fn => fn())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Action methods
  addOwner(owner: Owner) {
    this.owners = [owner, ...this.owners]
    this.notify()
    return owner
  }

  addCat(cat: Cat) {
    this.cats = [cat, ...this.cats]
    this.notify()
    return cat
  }

  addBooking(booking: Booking) {
    this.bookings = [booking, ...this.bookings]
    this.notify()
    return booking
  }

  updateBooking(id: string, partial: Partial<Booking>) {
    this.bookings = this.bookings.map(b => (b.id === id ? { ...b, ...partial } : b))
    this.notify()
  }

  addTransaction(tx: Transaction) {
    this.transactions = [tx, ...this.transactions]
    this.notify()
    return tx
  }

  upsertDailyReport(report: DailyReport) {
    const existingIndex = this.dailyReports.findIndex(
      r => r.booking_id === report.booking_id && r.tanggal === report.tanggal
    )
    if (existingIndex >= 0) {
      this.dailyReports = this.dailyReports.map((r, i) =>
        i === existingIndex ? { ...r, ...report } : r
      )
    } else {
      this.dailyReports = [report, ...this.dailyReports]
    }
    this.notify()
    return report
  }

  addPaket(paket: PaketHarga) {
    this.paketHarga = [...this.paketHarga, paket]
    this.notify()
  }

  updatePaket(id: string, partial: Partial<PaketHarga>) {
    this.paketHarga = this.paketHarga.map(p => (p.id === id ? { ...p, ...partial } : p))
    this.notify()
  }

  updatePengaturan(partial: Partial<Pengaturan>) {
    this.pengaturan = { ...this.pengaturan, ...partial }
    this.notify()
  }

  resetAll() {
    this.pengaturan = initialPengaturan
    this.paketHarga = initialPaketHarga
    this.owners = initialOwners
    this.cats = initialCats
    this.bookings = initialBookings
    this.transactions = initialTransactions
    this.dailyReports = initialDailyReports
    this.notify()
  }

  // Data Selectors with Joins
  getFullBookings(): Booking[] {
    const today = new Date().toISOString().split('T')[0]
    return this.bookings.map(b => {
      const cat = this.cats.find(c => c.id === b.cat_id)
      const owner = this.owners.find(o => o.id === b.owner_id)
      const transactions = this.transactions.filter(t => t.booking_id === b.id)
      const reports = this.dailyReports.filter(r => r.booking_id === b.id)
      const sudah_laporan = reports.some(r => r.tanggal === today)

      return {
        ...b,
        cat: cat ? { ...cat, owner } : undefined,
        owner,
        transactions,
        daily_reports: reports,
        sudah_laporan,
      }
    })
  }

  getBookingById(id: string): Booking | undefined {
    const full = this.getFullBookings()
    return full.find(b => b.id === id)
  }
}

export const posStore = new PosStore()

// React hook to subscribe to store updates
export function usePosStore() {
  const [, setTick] = useState(0)

  useEffect(() => {
    return posStore.subscribe(() => {
      setTick(t => t + 1)
    })
  }, [])

  return posStore
}
