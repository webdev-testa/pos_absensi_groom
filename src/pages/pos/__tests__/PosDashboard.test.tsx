import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PosDashboard from '../PosDashboard'
import * as useActiveBookingsModule from '@/hooks/pos/useActiveBookings'
import * as useDailyReportModule from '@/hooks/pos/useDailyReport'
import * as useAuthModule from '@/hooks/useAuth'
import type { Booking } from '@/types/pos'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/pos/useActiveBookings')
vi.mock('@/hooks/pos/useDailyReport')

describe('src/pages/pos/PosDashboard.tsx - Component Tests', () => {
  const mockActiveBookings: (Booking & { sudah_laporan: boolean })[] = [
    {
      id: 'book-1',
      cat_id: 'cat-1',
      owner_id: 'own-1',
      tanggal_masuk: '2026-03-25',
      tanggal_keluar_estimasi: '2026-03-28',
      paket: 'Deluxe Suite',
      harga_per_hari: 80000,
      status: 'aktif',
      sudah_laporan: true,
      created_at: '2026-03-25T08:00:00.000Z',
      owner: {
        id: 'own-1',
        nama: 'Sarah',
        no_wa: '0812345678',
        created_at: '2026-03-25T08:00:00.000Z',
      },
      cat: {
        id: 'cat-1',
        owner_id: 'own-1',
        nama: 'Milo',
        ras: 'Persian',
        created_at: '2026-03-25T08:00:00.000Z',
      },
      transactions: [],
    },
    {
      id: 'book-2',
      cat_id: 'cat-2',
      owner_id: 'own-2',
      tanggal_masuk: '2026-03-26',
      tanggal_keluar_estimasi: '2026-03-27',
      paket: 'Standard Room',
      harga_per_hari: 50000,
      status: 'aktif',
      sudah_laporan: false,
      created_at: '2026-03-26T08:00:00.000Z',
      owner: {
        id: 'own-2',
        nama: 'Budi',
        no_wa: '0898765432',
        created_at: '2026-03-26T08:00:00.000Z',
      },
      cat: {
        id: 'cat-2',
        owner_id: 'own-2',
        nama: 'Oreo',
        ras: 'Domestic',
        created_at: '2026-03-26T08:00:00.000Z',
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

    vi.spyOn(useActiveBookingsModule, 'useActiveBookings').mockReturnValue({
      activeBookings: mockActiveBookings,
      allBookings: mockActiveBookings,
      stats: {
        totalActive: 2,
        notReportedToday: 1,
        checkoutToday: 1,
        checkoutTomorrow: 0,
      },
      today: '2026-03-27',
      tomorrow: '2026-03-28',
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    vi.spyOn(useDailyReportModule, 'useDailyReport').mockReturnValue({
      today: '2026-03-27',
      filter: 'all',
      setFilter: vi.fn(),
      activeBookings: mockActiveBookings,
      filteredBookings: mockActiveBookings,
      selectedBooking: null,
      isFormOpen: false,
      openReportForm: vi.fn(),
      closeReportForm: vi.fn(),
      formData: {} as any,
      setFormData: vi.fn(),
      saveReport: vi.fn(),
      savedReport: null,
      isWaModalOpen: false,
      setIsWaModalOpen: vi.fn(),
      pengaturan: {} as any,
      isLoading: false,
      isSaving: false,
    })
  })

  it('renders dashboard heading, header actions, and statistics metrics', () => {
    render(
      <MemoryRouter>
        <PosDashboard />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Dashboard Penitipan Kucing/i })).toBeInTheDocument()
    expect(screen.getByText(/Check-In Kucing Baru/i)).toBeInTheDocument()
    expect(screen.getByText(/Kucing Menginap/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Total active
  })

  it('renders list of active cat bookings', () => {
    render(
      <MemoryRouter>
        <PosDashboard />
      </MemoryRouter>
    )

    expect(screen.getByText(/Milo/i)).toBeInTheDocument()
    expect(screen.getByText(/Oreo/i)).toBeInTheDocument()
    expect(screen.getByText(/Deluxe Suite/i)).toBeInTheDocument()
    expect(screen.getByText(/Standard Room/i)).toBeInTheDocument()
  })

  it('filters bookings when switching to Belum Lapor tab', () => {
    render(
      <MemoryRouter>
        <PosDashboard />
      </MemoryRouter>
    )

    const unreportedTab = screen.getByRole('button', { name: /Belum Lapor/i })
    fireEvent.click(unreportedTab)

    // Oreo is not reported yet, Milo should be filtered out from displayed bookings
    expect(screen.getByText(/Oreo/i)).toBeInTheDocument()
    expect(screen.queryByText(/Milo/i)).not.toBeInTheDocument()
  })
})
