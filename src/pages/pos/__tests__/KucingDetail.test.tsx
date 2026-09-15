import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import KucingDetail from '../KucingDetail'
import * as useBookingDetailModule from '@/hooks/pos/useBookingDetail'
import * as useAuthModule from '@/hooks/useAuth'
import type { Booking } from '@/types/pos'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/pos/useBookingDetail')

describe('src/pages/pos/KucingDetail.tsx - Component Tests', () => {
  const mockBooking: Booking = {
    id: 'book-det-1',
    cat_id: 'cat-1',
    owner_id: 'own-1',
    tanggal_masuk: '2026-03-20',
    tanggal_keluar_estimasi: '2026-03-25',
    paket: 'VIP Penthouse Suite',
    harga_per_hari: 120000,
    status: 'aktif',
    catatan: 'Alergi makanan seafood',
    created_at: '2026-03-20T08:00:00.000Z',
    owner: {
      id: 'own-1',
      nama: 'Hendra Gunawan',
      no_wa: '081234567890',
      created_at: '2026-03-20T08:00:00.000Z',
    },
    cat: {
      id: 'cat-1',
      owner_id: 'own-1',
      nama: 'Garfield',
      ras: 'Persian Exotic',
      catatan_kesehatan: 'Alergi makanan seafood',
      created_at: '2026-03-20T08:00:00.000Z',
    },
    transactions: [
      {
        id: 'tx-1',
        booking_id: 'book-det-1',
        tipe: 'dp',
        jumlah: 200000,
        metode_bayar: 'QRIS',
        created_at: '2026-03-20T08:00:00.000Z',
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Dr. Meow Admin',
        emp_id: 'ADM-01',
        role: 'admin',
        email: 'admin@drmeow.com',
        phone: null,
        address: null,
        dept: 'Clinic',
        jabatan: 'Admin',
        salary: null,
        shift: null,
        kasbon_limit: null,
        status: 'active',
        joined: null,
        created_at: '2026-01-01T00:00:00.000Z',
      },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })
  })

  it('renders loading state when fetching booking detail', () => {
    vi.spyOn(useBookingDetailModule, 'useBookingDetail').mockReturnValue({
      booking: undefined,
      billing: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/admin/pos/kucing/book-det-1']}>
        <Routes>
          <Route path="/admin/pos/kucing/:bookingId" element={<KucingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Memuat detail anabul/i)).toBeInTheDocument()
  })

  it('renders not found empty state when booking does not exist', () => {
    vi.spyOn(useBookingDetailModule, 'useBookingDetail').mockReturnValue({
      booking: undefined,
      billing: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/admin/pos/kucing/nonexistent']}>
        <Routes>
          <Route path="/admin/pos/kucing/:bookingId" element={<KucingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Data Tamu Tidak Ditemukan/i)).toBeInTheDocument()
    expect(screen.getByText(/Kembali ke Dashboard/i)).toBeInTheDocument()
  })

  it('renders full cat details and billing summary when booking is loaded', () => {
    vi.spyOn(useBookingDetailModule, 'useBookingDetail').mockReturnValue({
      booking: mockBooking,
      billing: {
        jumlah_malam: 5,
        subtotal: 600000,
        total_dp: 200000,
        total_biaya_tambahan: 0,
        total: 600000,
        sisa_bayar: 400000,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/admin/pos/kucing/book-det-1']}>
        <Routes>
          <Route path="/admin/pos/kucing/:bookingId" element={<KucingDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 2, name: /Garfield/i })).toBeInTheDocument()
    expect(screen.getByText(/Hendra Gunawan/i)).toBeInTheDocument()
    expect(screen.getByText(/VIP Penthouse Suite/i)).toBeInTheDocument()
    expect(screen.getByText(/Alergi makanan seafood/i)).toBeInTheDocument()
  })
})
