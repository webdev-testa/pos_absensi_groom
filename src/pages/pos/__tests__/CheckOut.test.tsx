import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CheckOut from '../CheckOut'
import { posService } from '@/services/posService'
import * as useAuthModule from '@/hooks/useAuth'
import type { Booking } from '@/types/pos'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/posService')

describe('src/pages/pos/CheckOut.tsx - Component Tests', () => {
  const mockBookings: Booking[] = [
    {
      id: 'book-co-1',
      cat_id: 'cat-1',
      owner_id: 'own-1',
      tanggal_masuk: '2026-03-24',
      tanggal_keluar_estimasi: '2026-03-27',
      paket: 'VIP Cat Suite',
      harga_per_hari: 100000,
      status: 'aktif',
      created_at: '2026-03-24T08:00:00.000Z',
      owner: {
        id: 'own-1',
        nama: 'Aulia Rahma',
        no_wa: '0811223344',
        created_at: '2026-03-24T08:00:00.000Z',
      },
      cat: {
        id: 'cat-1',
        owner_id: 'own-1',
        nama: 'Kiko',
        ras: 'Persian',
        created_at: '2026-03-24T08:00:00.000Z',
      },
      transactions: [
        {
          id: 'tx-1',
          booking_id: 'book-co-1',
          tipe: 'dp',
          jumlah: 50000,
          metode_bayar: 'QRIS',
          created_at: '2026-03-24T08:00:00.000Z',
        },
      ],
    },
    {
      id: 'book-co-2',
      cat_id: 'cat-2',
      owner_id: 'own-2',
      tanggal_masuk: '2026-03-25',
      tanggal_keluar_estimasi: '2026-03-27',
      paket: 'Standard Room',
      harga_per_hari: 50000,
      status: 'aktif',
      created_at: '2026-03-25T08:00:00.000Z',
      owner: {
        id: 'own-2',
        nama: 'Doni',
        no_wa: '0855667788',
        created_at: '2026-03-25T08:00:00.000Z',
      },
      cat: {
        id: 'cat-2',
        owner_id: 'own-2',
        nama: 'Brownie',
        ras: 'Domestic',
        created_at: '2026-03-25T08:00:00.000Z',
      },
      transactions: [],
    },
  ]

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

    vi.spyOn(posService, 'fetchBookings').mockResolvedValue(mockBookings)
    vi.spyOn(posService, 'fetchPengaturan').mockResolvedValue({
      id: 1,
      nama_usaha: 'Dr. Meow Cat Hotel',
      no_wa_usaha: '08123456789',
      alamat_usaha: 'Jakarta',
      nama_bank: 'BCA',
      no_rekening: '123456789',
      atas_nama_rekening: 'Dr. Meow',
      qris_nmid: 'ID123456',
    })
  })

  const renderCheckOut = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CheckOut />
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  it('renders check-out page title and list of active bookings ready for checkout', async () => {
    renderCheckOut()

    expect(screen.getByRole('heading', { level: 1, name: /Check-Out Penitipan/i })).toBeInTheDocument()
    expect(await screen.findByText(/Kiko/i)).toBeInTheDocument()
    expect(await screen.findByText(/Brownie/i)).toBeInTheDocument()
    expect(screen.getByText(/Aulia Rahma/i)).toBeInTheDocument()
  })

  it('filters active bookings list based on search input query', async () => {
    renderCheckOut()

    expect(await screen.findByText(/Kiko/i)).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/Cari anabul atau nama owner/i)
    fireEvent.change(searchInput, { target: { value: 'Kiko' } })

    expect(screen.getByText(/Kiko/i)).toBeInTheDocument()
    expect(screen.queryByText(/Brownie/i)).not.toBeInTheDocument()
  })

  it('selects an active booking and loads checkout calculation details', async () => {
    renderCheckOut()

    const kikoCard = await screen.findByText(/Kiko/i)
    fireEvent.click(kikoCard)

    // Check that checkout form is loaded for Kiko
    expect(await screen.findByRole('heading', { level: 2, name: /Check-Out: Kiko/i })).toBeInTheDocument()
    expect(screen.getByText(/Pilih Kucing Lain/i)).toBeInTheDocument()
    expect(screen.getByText(/Rincian Tagihan & Biaya/i)).toBeInTheDocument()
  })
})
