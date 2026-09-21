import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import GroomingReport from '../GroomingReport'
import * as useGroomingRealtimeModule from '@/hooks/grooming/useGroomingRealtime'
import type { GroomingSession } from '@/types/pos'

vi.mock('@/hooks/grooming/useGroomingRealtime')

describe('src/pages/grooming/GroomingReport.tsx - Component Test', () => {
  const mockSession: GroomingSession = {
    id: 'grm-report-1',
    owner_id: 'own-1',
    cat_id: 'cat-1',
    paket: 'Full Grooming Sehat',
    harga: 85000,
    kondisi_awal: 'Bulu agak gimbal',
    catatan: 'Kucing takut suara dryer keras',
    tanggal: '2026-09-15',
    waktu_masuk: '2026-09-15T09:00:00.000Z',
    status: 'dikerjakan',
    current_step: 'bathing',
    public_token: 'valid-token-123',
    groomer_name: 'Budi (Groomer)',
    sudah_bayar: false,
    created_at: '2026-09-15T09:00:00.000Z',
    owner: {
      id: 'own-1',
      nama: 'Siti Rahma',
      no_wa: '081234567890',
      created_at: '2026-09-15T08:00:00.000Z',
    },
    cat: {
      id: 'cat-1',
      owner_id: 'own-1',
      nama: 'Mochi',
      ras: 'Persian',
      created_at: '2026-09-15T08:00:00.000Z',
    },
    progress: [
      {
        id: 'prog-1',
        session_id: 'grm-report-1',
        step: 'check_in',
        catatan: 'Check-in grooming.',
        created_at: '2026-09-15T09:00:00.000Z',
      },
      {
        id: 'prog-2',
        session_id: 'grm-report-1',
        step: 'bathing',
        catatan: 'Sedang dimandikan dengan shampoo anti kutu.',
        created_at: '2026-09-15T09:30:00.000Z',
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading indicator when data is loading', () => {
    vi.spyOn(useGroomingRealtimeModule, 'useGroomingRealtime').mockReturnValue({
      session: null,
      cat: null,
      progressList: [],
      isLoading: true,
      lastUpdated: new Date(),
      refresh: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/grooming/report/valid-token-123']}>
        <Routes>
          <Route path="/grooming/report/:token" element={<GroomingReport />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Menghubungkan ke Live Report/i)).toBeInTheDocument()
  })

  it('renders not found empty state if session is null after loading', () => {
    vi.spyOn(useGroomingRealtimeModule, 'useGroomingRealtime').mockReturnValue({
      session: null,
      cat: null,
      progressList: [],
      isLoading: false,
      lastUpdated: new Date(),
      refresh: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/grooming/report/invalid-token']}>
        <Routes>
          <Route path="/grooming/report/:token" element={<GroomingReport />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Sesi Grooming Tidak Ditemukan/i)).toBeInTheDocument()
  })

  it('renders live tracking view with cat info and current progress step', () => {
    vi.spyOn(useGroomingRealtimeModule, 'useGroomingRealtime').mockReturnValue({
      session: mockSession,
      cat: mockSession.cat,
      progressList: mockSession.progress || [],
      isLoading: false,
      lastUpdated: new Date(),
      refresh: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/grooming/report/valid-token-123']}>
        <Routes>
          <Route path="/grooming/report/:token" element={<GroomingReport />} />
        </Routes>
      </MemoryRouter>
    )

    // Role-based / text-based assertions
    expect(screen.getByRole('heading', { level: 1, name: /Mochi/i })).toBeInTheDocument()
    expect(screen.getByText(/Dr. Meow Grooming/i)).toBeInTheDocument()
    expect(screen.getByText(/Budi \(Groomer\)/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Full Grooming Sehat/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Bulu agak gimbal/i)).toBeInTheDocument()
  })

  it('renders completion banner when status is selesai', () => {
    const completedSession: GroomingSession = {
      ...mockSession,
      status: 'selesai',
      current_step: 'done',
    }

    vi.spyOn(useGroomingRealtimeModule, 'useGroomingRealtime').mockReturnValue({
      session: completedSession,
      cat: completedSession.cat,
      progressList: completedSession.progress || [],
      isLoading: false,
      lastUpdated: new Date(),
      refresh: vi.fn(),
    })

    render(
      <MemoryRouter initialEntries={['/grooming/report/valid-token-123']}>
        <Routes>
          <Route path="/grooming/report/:token" element={<GroomingReport />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 2, name: /Sudah Siap Dijemput!/i })).toBeInTheDocument()
    expect(screen.getByText(/Grooming telah selesai dengan sempurna/i)).toBeInTheDocument()
  })
})
