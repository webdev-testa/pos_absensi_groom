import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LaporanHarian from '../LaporanHarian'
import * as useDailyReportModule from '@/hooks/pos/useDailyReport'
import * as useAuthModule from '@/hooks/useAuth'
import type { Booking } from '@/types/pos'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/pos/useDailyReport')

describe('src/pages/pos/LaporanHarian.tsx - Component Tests', () => {
  const mockOpenReportForm = vi.fn()
  const mockSetFilter = vi.fn()

  const mockActiveBookings: (Booking & { sudah_laporan: boolean })[] = [
    {
      id: 'book-lap-1',
      cat_id: 'cat-1',
      owner_id: 'own-1',
      tanggal_masuk: '2026-03-25',
      tanggal_keluar_estimasi: '2026-03-29',
      paket: 'Standard Room',
      harga_per_hari: 50000,
      status: 'aktif',
      sudah_laporan: true,
      created_at: '2026-03-25T08:00:00.000Z',
      owner: {
        id: 'own-1',
        nama: 'Rina',
        no_wa: '0812345678',
        created_at: '2026-03-25T08:00:00.000Z',
      },
      cat: {
        id: 'cat-1',
        owner_id: 'own-1',
        nama: 'Mochi',
        ras: 'Persian',
        created_at: '2026-03-25T08:00:00.000Z',
      },
      transactions: [],
    },
    {
      id: 'book-lap-2',
      cat_id: 'cat-2',
      owner_id: 'own-2',
      tanggal_masuk: '2026-03-26',
      tanggal_keluar_estimasi: '2026-03-28',
      paket: 'VIP Room',
      harga_per_hari: 90000,
      status: 'aktif',
      sudah_laporan: false,
      created_at: '2026-03-26T08:00:00.000Z',
      owner: {
        id: 'own-2',
        nama: 'Dimas',
        no_wa: '0899887766',
        created_at: '2026-03-26T08:00:00.000Z',
      },
      cat: {
        id: 'cat-2',
        owner_id: 'own-2',
        nama: 'Bella',
        ras: 'Anggora',
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

    vi.spyOn(useDailyReportModule, 'useDailyReport').mockReturnValue({
      today: '2026-03-27',
      filter: 'all',
      setFilter: mockSetFilter,
      activeBookings: mockActiveBookings,
      filteredBookings: mockActiveBookings,
      selectedBooking: null,
      isFormOpen: false,
      openReportForm: mockOpenReportForm,
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

  it('renders page title and report counts', () => {
    render(
      <MemoryRouter>
        <LaporanHarian />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Laporan Harian Kucing/i })).toBeInTheDocument()
    expect(screen.getByText(/1 Sudah Lapor/i)).toBeInTheDocument()
    expect(screen.getByText(/1 Belum Lapor/i)).toBeInTheDocument()
  })

  it('renders booking cards and action buttons for filling daily report', () => {
    render(
      <MemoryRouter>
        <LaporanHarian />
      </MemoryRouter>
    )

    expect(screen.getByText(/Mochi/i)).toBeInTheDocument()
    expect(screen.getByText(/Bella/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Edit Laporan/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tulis Laporan/i })).toBeInTheDocument()
  })

  it('calls openReportForm when clicking Tulis Laporan', () => {
    render(
      <MemoryRouter>
        <LaporanHarian />
      </MemoryRouter>
    )

    const tulisLaporanBtn = screen.getByRole('button', { name: /Tulis Laporan/i })
    fireEvent.click(tulisLaporanBtn)

    expect(mockOpenReportForm).toHaveBeenCalledWith(mockActiveBookings[1])
  })
})
