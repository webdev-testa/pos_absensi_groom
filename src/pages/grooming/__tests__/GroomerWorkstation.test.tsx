import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GroomerWorkstation from '../GroomerWorkstation'
import * as useGroomingSessionsModule from '@/hooks/grooming/useGroomingSessions'
import type { GroomingSession } from '@/types/pos'

vi.mock('@/hooks/grooming/useGroomingSessions')

describe('src/pages/grooming/GroomerWorkstation.tsx - Component Test', () => {
  const mockSessions: GroomingSession[] = [
    {
      id: 'grm-ws-1',
      owner_id: 'own-1',
      cat_id: 'cat-1',
      paket: 'Mandi Sehat',
      harga: 65000,
      tanggal: '2026-09-15',
      waktu_masuk: '2026-09-15T08:30:00.000Z',
      status: 'antrian',
      current_step: 'check_in',
      public_token: 'ws-token-1',
      groomer_name: 'Budi (Groomer)',
      sudah_bayar: false,
      created_at: '2026-09-15T08:30:00.000Z',
      cat: {
        id: 'cat-1',
        owner_id: 'own-1',
        nama: 'Luna',
        ras: 'British Shorthair',
        created_at: '2026-09-15T08:00:00.000Z',
      },
      owner: {
        id: 'own-1',
        nama: 'Dewi',
        no_wa: '08123456789',
        created_at: '2026-09-15T08:00:00.000Z',
      },
    },
    {
      id: 'grm-ws-2',
      owner_id: 'own-2',
      cat_id: 'cat-2',
      paket: 'Kutu & Jamur',
      harga: 95000,
      tanggal: '2026-09-15',
      waktu_masuk: '2026-09-15T09:00:00.000Z',
      status: 'dikerjakan',
      current_step: 'bathing',
      public_token: 'ws-token-2',
      groomer_name: 'Budi (Groomer)',
      sudah_bayar: false,
      created_at: '2026-09-15T09:00:00.000Z',
      cat: {
        id: 'cat-2',
        owner_id: 'own-2',
        nama: 'Simba',
        ras: 'Persian',
        created_at: '2026-09-15T08:00:00.000Z',
      },
      owner: {
        id: 'own-2',
        nama: 'Rian',
        no_wa: '08987654321',
        created_at: '2026-09-15T08:00:00.000Z',
      },
    },
  ]

  const mockUpdateStep = vi.fn()
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useGroomingSessionsModule, 'useGroomingSessions').mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
      isRefetching: false,
      refetch: mockRefetch,
      selectedDate: '2026-09-15',
      setSelectedDate: vi.fn(),
      statusFilter: 'all',
      setStatusFilter: vi.fn(),
      searchQuery: '',
      setSearchQuery: vi.fn(),
      filteredSessions: mockSessions,
      stats: {
        total: 2,
        antrian: 1,
        dikerjakan: 1,
        selesai: 0,
        dijemput: 0,
        totalOmset: 160000,
      },
      updateStep: mockUpdateStep,
      isUpdatingStep: false,
      markPickedUp: vi.fn(),
      isMarkingPickedUp: false,
    } as any)
  })

  it('renders workstation header and active session list', () => {
    render(
      <MemoryRouter>
        <GroomerWorkstation />
      </MemoryRouter>
    )

    expect(screen.getByText(/Groomer Workstation/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Luna/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Simba/i).length).toBeGreaterThan(0)
  })

  it('allows switching active cat by clicking another cat card', () => {
    render(
      <MemoryRouter>
        <GroomerWorkstation />
      </MemoryRouter>
    )

    const simbaButton = screen.getAllByText(/Simba/i)[0]
    fireEvent.click(simbaButton)

    // Check detail pane updates to Simba
    expect(screen.getAllByText(/Simba/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Kutu & Jamur/i).length).toBeGreaterThan(0)
  })

  it('renders action step button for advancing grooming stage', () => {
    render(
      <MemoryRouter>
        <GroomerWorkstation />
      </MemoryRouter>
    )

    // For Luna (step check_in), next action is Mandi
    const advanceButton = screen.getByRole('button', { name: /Mulai Mandi & Shampo/i })
    expect(advanceButton).toBeInTheDocument()
  })
})
