import { describe, it, expect, vi } from 'vitest'
import {
  formatTanggal,
  formatTanggalPendek,
  formatRupiah,
  hitungMalam,
  calculateBilling,
  generateCheckinTemplate,
  generateDailyReportTemplate,
  generateCheckoutTemplate,
  copyToClipboard,
} from '../pos.utils'
import type { Booking, DailyReport } from '@/types/pos'

describe('src/utils/pos.utils.ts - Pure POS utilities', () => {
  const mockBooking: Booking = {
    id: 'book-1',
    cat_id: 'cat-1',
    owner_id: 'own-1',
    tanggal_masuk: '2026-03-20',
    tanggal_keluar_estimasi: '2026-03-23',
    paket: 'VIP Room',
    harga_per_hari: 100000,
    status: 'aktif',
    created_at: '2026-03-20T08:00:00.000Z',
    owner: {
      id: 'own-1',
      nama: 'Nabila',
      no_wa: '081298765432',
      created_at: '2026-03-20T08:00:00.000Z',
    },
    cat: {
      id: 'cat-1',
      owner_id: 'own-1',
      nama: 'Simba',
      ras: 'British Shorthair',
      created_at: '2026-03-20T08:00:00.000Z',
    },
    transactions: [
      {
        id: 'tx-1',
        booking_id: 'book-1',
        tipe: 'dp',
        jumlah: 100000,
        metode_bayar: 'QRIS',
        created_at: '2026-03-20T08:00:00.000Z',
      },
    ],
  }

  describe('Date & Currency Formatting', () => {
    it('formats date to long Indonesian format', () => {
      const res = formatTanggal('2026-03-27')
      expect(res).toContain('2026')
      expect(res).toContain('Maret')
      expect(res).toContain('27')
    })

    it('handles empty date string safely', () => {
      expect(formatTanggal('')).toBe('-')
    })

    it('formats date to short Indonesian format', () => {
      const res = formatTanggalPendek('2026-03-27')
      expect(res).toContain('2026')
      expect(res).toContain('Mar')
    })

    it('formats number to Indonesian Rupiah thousands format', () => {
      expect(formatRupiah(50000)).toBe('50.000')
      expect(formatRupiah(1250000)).toBe('1.250.000')
      expect(formatRupiah(0)).toBe('0')
    })
  })

  describe('hitungMalam', () => {
    it('calculates nights correctly between dates', () => {
      expect(hitungMalam('2026-03-20', '2026-03-23')).toBe(3)
      expect(hitungMalam('2026-03-20', '2026-03-25')).toBe(5)
    })

    it('guarantees minimum of 1 night for same day', () => {
      expect(hitungMalam('2026-03-20', '2026-03-20')).toBe(1)
    })

    it('returns 1 if missing either date', () => {
      expect(hitungMalam('', '2026-03-20')).toBe(1)
      expect(hitungMalam('2026-03-20', '')).toBe(1)
    })
  })

  describe('calculateBilling', () => {
    it('computes subtotal, deductions, and sisa bayar accurately', () => {
      const billing = calculateBilling(mockBooking, '2026-03-23', [
        { keterangan: 'Dry food refill', jumlah: 25000 },
      ])

      expect(billing.jumlah_malam).toBe(3)
      expect(billing.subtotal).toBe(300000) // 3 * 100.000
      expect(billing.total_biaya_tambahan).toBe(25000)
      expect(billing.total).toBe(325000) // 300.000 + 25.000
      expect(billing.total_dp).toBe(100000)
      expect(billing.sisa_bayar).toBe(225000) // 325.000 - 100.000
    })

    it('does not return negative sisa_bayar if DP exceeds total', () => {
      const overpaidBooking: Booking = {
        ...mockBooking,
        transactions: [
          {
            id: 'tx-dp-high',
            booking_id: 'book-1',
            tipe: 'dp',
            jumlah: 500000,
            metode_bayar: 'Transfer',
            created_at: '2026-03-20T08:00:00.000Z',
          },
        ],
      }

      const billing = calculateBilling(overpaidBooking, '2026-03-21') // 1 night = 100.000
      expect(billing.sisa_bayar).toBe(0)
    })
  })

  describe('WhatsApp Templates', () => {
    it('generates check-in WhatsApp template with booking details', () => {
      const msg = generateCheckinTemplate(mockBooking, 100000, 'Dr. Meow Cat Hotel')
      expect(msg).toContain('Halo Nabila!')
      expect(msg).toContain('Simba')
      expect(msg).toContain('Dr. Meow Cat Hotel')
      expect(msg).toContain('VIP Room')
      expect(msg).toContain('100.000')
    })

    it('generates daily report template with checklist icons', () => {
      const mockReport: DailyReport = {
        id: 'rep-1',
        booking_id: 'book-1',
        cat_id: 'cat-1',
        tanggal: '2026-03-21',
        nafsu_makan: 'Sangat baik (habis semua)',
        minum: 'Banyak',
        feses: 'Normal (padat, coklat)',
        urinasi: 'Normal',
        kondisi_umum: 'Kucing aktif dan suka diajak main bola bulu',
        keterangan: 'Sudah diberi snack kesukaannya',
        created_at: '2026-03-21T18:00:00.000Z',
      }

      const msg = generateDailyReportTemplate(mockBooking, mockReport)
      expect(msg).toContain('DAILY REPORT SIMBA')
      expect(msg).toContain('Kucing aktif dan suka diajak main bola bulu')
      expect(msg).toContain('Sudah diberi snack kesukaannya')
      expect(msg).toContain('✅ Sangat baik (habis semua)')
      expect(msg).toContain('✅ Banyak')
      expect(msg).toContain('✅ Normal (padat, coklat)')
    })

    it('generates checkout WhatsApp template with receipt breakdown', () => {
      const billing = calculateBilling(mockBooking, '2026-03-23')
      const msg = generateCheckoutTemplate(mockBooking, billing, 'Dr. Meow Hotel')
      expect(msg).toContain('Halo Nabila!')
      expect(msg).toContain('STRUK CHECKOUT')
      expect(msg).toContain('Simba')
      expect(msg).toContain('Dr. Meow Hotel')
      expect(msg).toContain('Sisa Bayar')
    })
  })

  describe('copyToClipboard', () => {
    it('uses navigator.clipboard.writeText if available', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      const success = await copyToClipboard('test clipboard text')
      expect(success).toBe(true)
      expect(writeTextMock).toHaveBeenCalledWith('test clipboard text')
    })
  })
})
