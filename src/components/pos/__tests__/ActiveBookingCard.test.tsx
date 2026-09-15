import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ActiveBookingCard } from '../ActiveBookingCard'
import type { Booking } from '@/types/pos'

describe('src/components/pos/ActiveBookingCard.tsx - Component Tests', () => {
  const mockBooking: Booking = {
    id: 'book-abc-1',
    cat_id: 'cat-1',
    owner_id: 'own-1',
    tanggal_masuk: '2026-03-20',
    tanggal_keluar_estimasi: '2026-03-27',
    paket: 'VIP Penthouse',
    harga_per_hari: 120000,
    status: 'aktif',
    sudah_laporan: false,
    created_at: '2026-03-20T08:00:00.000Z',
    owner: {
      id: 'own-1',
      nama: 'Siti Aminah',
      no_wa: '08123456789',
      created_at: '2026-03-20T08:00:00.000Z',
    },
    cat: {
      id: 'cat-1',
      owner_id: 'own-1',
      nama: 'Milo',
      ras: 'Persian Longhair',
      jenis_kelamin: 'Jantan',
      catatan_kesehatan: 'Alergi ayam',
      created_at: '2026-03-20T08:00:00.000Z',
    },
    transactions: [],
  }

  it('renders cat and owner details with package rate badge', () => {
    render(
      <MemoryRouter>
        <ActiveBookingCard
          booking={mockBooking}
          today="2026-03-25"
          tomorrow="2026-03-26"
        />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: /Milo/i })).toBeInTheDocument()
    expect(screen.getByText(/Persian Longhair/i)).toBeInTheDocument()
    expect(screen.getByText(/Siti Aminah/i)).toBeInTheDocument()
    expect(screen.getByText(/VIP Penthouse/i)).toBeInTheDocument()
    expect(screen.getByText(/Belum Laporan Hari Ini/i)).toBeInTheDocument()
  })

  it('displays checkout today badge when booking ends on today date', () => {
    const checkoutTodayBooking: Booking = {
      ...mockBooking,
      tanggal_keluar_estimasi: '2026-03-25',
      sudah_laporan: true,
    }

    render(
      <MemoryRouter>
        <ActiveBookingCard
          booking={checkoutTodayBooking}
          today="2026-03-25"
          tomorrow="2026-03-26"
        />
      </MemoryRouter>
    )

    expect(screen.getByText(/Keluar Hari Ini/i)).toBeInTheDocument()
    expect(screen.getByText(/Sudah Laporan Hari Ini/i)).toBeInTheDocument()
  })

  it('triggers onQuickReport callback when Lapor button is clicked', () => {
    const handleReport = vi.fn()

    render(
      <MemoryRouter>
        <ActiveBookingCard
          booking={mockBooking}
          today="2026-03-25"
          tomorrow="2026-03-26"
          onQuickReport={handleReport}
        />
      </MemoryRouter>
    )

    const laporBtn = screen.getByRole('button', { name: /Buat Laporan/i })
    fireEvent.click(laporBtn)

    expect(handleReport).toHaveBeenCalledWith(mockBooking)
  })
})
