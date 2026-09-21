import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BillingSummary } from '../BillingSummary'
import type { Booking, BillingCalculation } from '@/types/pos'

describe('src/components/pos/BillingSummary.tsx - Component Tests', () => {
  const mockBooking: Booking = {
    id: 'book-bill-1',
    cat_id: 'cat-1',
    owner_id: 'own-1',
    tanggal_masuk: '2026-03-20',
    tanggal_keluar_estimasi: '2026-03-24',
    paket: 'Deluxe Cat Room',
    harga_per_hari: 80000,
    status: 'aktif',
    created_at: '2026-03-20T08:00:00.000Z',
    transactions: [
      {
        id: 'tx-extra-1',
        booking_id: 'book-bill-1',
        tipe: 'biaya_tambahan',
        jumlah: 25000,
        metode_bayar: 'Tunai',
        keterangan: 'Dry Food Tambahan',
        created_at: '2026-03-21T08:00:00.000Z',
      },
    ],
  }

  const mockBilling: BillingCalculation = {
    jumlah_malam: 4,
    subtotal: 320000,
    total_dp: 100000,
    total_biaya_tambahan: 25000,
    total: 345000,
    sisa_bayar: 245000,
  }

  it('renders billing header, room rate breakdown, and existing extra fees', () => {
    render(<BillingSummary booking={mockBooking} billing={mockBilling} />)

    expect(screen.getByRole('heading', { level: 3, name: /Rincian Tagihan & Biaya/i })).toBeInTheDocument()
    expect(screen.getByText(/4 malam × Rp 80.000/i)).toBeInTheDocument()
    expect(screen.getByText(/Biaya Tambahan: Dry Food Tambahan/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Tagihan/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp 345.000/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp 245.000/i)).toBeInTheDocument()
  })

  it('displays new unsaved extra charges in the preview', () => {
    const newExtraCharges = [
      { keterangan: 'Gunting Kuku', jumlah: 15000 },
      { keterangan: 'Pembersihan Telinga', jumlah: 20000 },
    ]

    render(
      <BillingSummary
        booking={mockBooking}
        billing={mockBilling}
        extraCharges={newExtraCharges}
      />
    )

    expect(screen.getByText(/Gunting Kuku/i)).toBeInTheDocument()
    expect(screen.getByText(/Pembersihan Telinga/i)).toBeInTheDocument()
  })

  it('indicates Sudah Lunas status when remaining balance is 0 or less', () => {
    const paidOffBilling: BillingCalculation = {
      ...mockBilling,
      total_dp: 345000,
      sisa_bayar: 0,
    }

    render(<BillingSummary booking={mockBooking} billing={paidOffBilling} />)

    expect(screen.getByText(/Sudah Lunas/i)).toBeInTheDocument()
  })
})
