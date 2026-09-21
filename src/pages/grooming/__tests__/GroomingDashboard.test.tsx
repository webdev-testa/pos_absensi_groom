import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GroomingDashboard from '../GroomingDashboard'
import * as useGroomingSessionsModule from '@/hooks/grooming/useGroomingSessions'
import * as useAuthModule from '@/hooks/useAuth'
import type { GroomingSession } from '@/types/pos'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/grooming/useGroomingSessions')

describe('src/pages/grooming/GroomingDashboard.tsx - Component Tests', () => {
  const mockSessions: GroomingSession[] = [
    {
      id: 'grm-test-1',
      owner_id: 'own-1',
      cat_id: 'cat-1',
      paket: 'Mandi Sehat / Biasa',
      harga: 65000,
      tanggal: '2026-09-17',
      waktu_masuk: '2026-09-17T09:00:00.000Z',
      status: 'antrian',
      current_step: 'check_in',
      public_token: 'token-1',
      groomer_name: 'Budi (Groomer)',
      sudah_bayar: false,
      created_at: '2026-09-17T09:00:00.000Z',
      cat: {
        id: 'cat-1',
        owner_id: 'own-1',
        nama: 'Milo',
        ras: 'British Shorthair',
        created_at: '2026-09-17T09:00:00.000Z',
      },
      owner: {
        id: 'own-1',
        nama: 'Fara Nabila',
        no_wa: '081234567890',
        created_at: '2026-09-17T09:00:00.000Z',
      },
    },
    {
      id: 'grm-test-2',
      owner_id: 'own-2',
      cat_id: 'cat-2',
      paket: 'Mandi Kutu / Jamur',
      harga: 85000,
      tanggal: '2026-09-14', // 3 days ago (historical)
      waktu_masuk: '2026-09-14T10:00:00.000Z',
      status: 'dijemput',
      current_step: 'done',
      public_token: 'token-2',
      groomer_name: 'Dewi (Groomer)',
      sudah_bayar: true,
      created_at: '2026-09-14T10:00:00.000Z',
      cat: {
        id: 'cat-2',
        owner_id: 'own-2',
        nama: 'Chiko',
        ras: 'Persia Medium',
        created_at: '2026-09-14T10:00:00.000Z',
      },
      owner: {
        id: 'own-2',
        nama: 'Dina Mariana',
        no_wa: '081398765432',
        created_at: '2026-09-14T10:00:00.000Z',
      },
    },
  ]

  const defaultMockHook = {
    today: '2026-09-17',
    selectedDate: '2026-09-17',
    setSelectedDate: vi.fn(),
    periodPreset: 'today' as const,
    setPeriodPreset: vi.fn(),
    startDate: '2026-09-17',
    endDate: '2026-09-17',
    customStartDate: '2026-09-17',
    setCustomStartDate: vi.fn(),
    customEndDate: '2026-09-17',
    setCustomEndDate: vi.fn(),
    periodLabel: 'Hari Ini',
    isLiveToday: true,
    statusFilter: 'all',
    setStatusFilter: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    sessions: mockSessions,
    filteredSessions: mockSessions,
    stats: {
      total: 2,
      antrian: 1,
      dikerjakan: 0,
      selesai: 0,
      dijemput: 1,
      totalOmset: 150000,
    },
    isLoading: false,
    isRefetching: false,
    refetch: vi.fn(),
    updateStep: vi.fn(),
    markPickedUp: vi.fn(),
    isUpdating: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { name: 'Admin Cat', role: 'superadmin' } as any,
      loading: false,
    } as any)
    vi.spyOn(useGroomingSessionsModule, 'useGroomingSessions').mockReturnValue(defaultMockHook as any)
  })

  it('renders period preset buttons: Hari Ini, 7 Hari (1 Minggu), 30 Hari (1 Bulan), and Kustom Tanggal', () => {
    render(
      <MemoryRouter>
        <GroomingDashboard />
      </MemoryRouter>
    )

    expect(screen.getByText(/Live Grooming Station/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hari Ini/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /7 Hari \(1 Minggu\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /30 Hari \(1 Bulan\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Kustom Tanggal/i })).toBeInTheDocument()
  })

  it('calls setPeriodPreset when user clicks 7 Hari or 30 Hari buttons', () => {
    const setPeriodPresetMock = vi.fn()
    vi.spyOn(useGroomingSessionsModule, 'useGroomingSessions').mockReturnValue({
      ...defaultMockHook,
      setPeriodPreset: setPeriodPresetMock,
    } as any)

    render(
      <MemoryRouter>
        <GroomingDashboard />
      </MemoryRouter>
    )

    const sevenDaysBtn = screen.getByRole('button', { name: /7 Hari \(1 Minggu\)/i })
    fireEvent.click(sevenDaysBtn)
    expect(setPeriodPresetMock).toHaveBeenCalledWith('7days')

    const thirtyDaysBtn = screen.getByRole('button', { name: /30 Hari \(1 Bulan\)/i })
    fireEvent.click(thirtyDaysBtn)
    expect(setPeriodPresetMock).toHaveBeenCalledWith('30days')
  })

  it('displays contextual history banner when not viewing today', () => {
    const setPeriodPresetMock = vi.fn()
    vi.spyOn(useGroomingSessionsModule, 'useGroomingSessions').mockReturnValue({
      ...defaultMockHook,
      periodPreset: '7days',
      periodLabel: '7 Hari Terakhir',
      isLiveToday: false,
      startDate: '2026-09-11',
      endDate: '2026-09-17',
      setPeriodPreset: setPeriodPresetMock,
    } as any)

    render(
      <MemoryRouter>
        <GroomingDashboard />
      </MemoryRouter>
    )

    expect(screen.getByText(/Menampilkan riwayat grooming periode/i)).toBeInTheDocument()
    expect(screen.getAllByText(/7 Hari Terakhir/i).length).toBeGreaterThanOrEqual(1)

    const backToTodayBtn = screen.getByRole('button', { name: /Kembali ke Hari Ini/i })
    fireEvent.click(backToTodayBtn)
    expect(setPeriodPresetMock).toHaveBeenCalledWith('today')
  })

  it('toggles between Grid View and Table View smoothly', () => {
    render(
      <MemoryRouter>
        <GroomingDashboard />
      </MemoryRouter>
    )

    // Initially in grid view, cards are rendered
    expect(screen.getByText('Milo')).toBeInTheDocument()
    expect(screen.getByText('Chiko')).toBeInTheDocument()

    // Click table view button
    const tableToggleBtn = screen.getByRole('button', { name: /Tampilan Tabel Ringkas/i })
    fireEvent.click(tableToggleBtn)

    // Table headers should now be in the document
    expect(screen.getByText('Paket Layanan')).toBeInTheDocument()
    expect(screen.getByText('Biaya')).toBeInTheDocument()
    expect(screen.getByText('Status & Step')).toBeInTheDocument()

    // Sessions are rendered inside table cells
    expect(screen.getByText('Fara Nabila')).toBeInTheDocument()
    expect(screen.getByText('Dina Mariana')).toBeInTheDocument()
  })

  it('displays date chips on cards when viewing multi-day history', () => {
    vi.spyOn(useGroomingSessionsModule, 'useGroomingSessions').mockReturnValue({
      ...defaultMockHook,
      periodPreset: '7days',
      periodLabel: '7 Hari Terakhir',
      isLiveToday: false,
      startDate: '2026-09-11',
      endDate: '2026-09-17',
    } as any)

    render(
      <MemoryRouter>
        <GroomingDashboard />
      </MemoryRouter>
    )

    // For Chiko (dated 2026-09-14), date chip should be visible
    expect(screen.getByText('14 Sep 2026')).toBeInTheDocument()
  })

  it('includes rel="noopener noreferrer" on all external report links for tabnabbing protection', () => {
    render(
      <MemoryRouter>
        <GroomingDashboard />
      </MemoryRouter>
    )

    const reportLinks = screen.getAllByTitle(/Buka Live Report Customer/i)
    expect(reportLinks.length).toBeGreaterThan(0)
    reportLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
      expect(link.getAttribute('rel')).toContain('noreferrer')
    })
  })

  it('opens done notification template for completed/dijemput cat in history', () => {
    render(
      <MemoryRouter>
        <GroomingDashboard />
      </MemoryRouter>
    )

    // Chiko has status: 'dijemput'
    const waButtons = screen.getAllByRole('button', { name: /WA Info Selesai/i })
    expect(waButtons.length).toBeGreaterThan(0)
    fireEvent.click(waButtons[0])

    // Should show completion modal title
    expect(screen.getByText('Kirim Notifikasi Siap Dijemput')).toBeInTheDocument()
  })
})
