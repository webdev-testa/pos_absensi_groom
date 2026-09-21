import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import GroomingPengaturan from '../GroomingPengaturan'
import * as useAuthModule from '@/hooks/useAuth'
import { groomingService } from '@/services/groomingService'
import type { PaketGrooming } from '@/types/pos'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/groomingService')

describe('src/pages/grooming/GroomingPengaturan.tsx - Layout & Component Tests', () => {
  const mockPackages: PaketGrooming[] = [
    {
      id: 'pkg-1',
      nama: 'Mandi Sehat Standard',
      harga: 65000,
      deskripsi: 'Mandi sampo anti kutu & potong kuku',
      durasi_estimasi: 60,
      aktif: true,
    },
    {
      id: 'pkg-2',
      nama: 'Grooming Kutu & Jamur',
      harga: 95000,
      deskripsi: 'Perawatan kulit intensif dengan sampo medikasi',
      durasi_estimasi: 90,
      aktif: true,
    },
  ]

  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { name: 'Admin Grooming', role: 'superadmin' } as any,
      loading: false,
    } as any)

    vi.mocked(groomingService.fetchPaketGrooming).mockResolvedValue(mockPackages)
  })

  it('renders full-width header with back link and action button', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GroomingPengaturan />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Heading & eyebrow
    expect(screen.getByText('Pengaturan Grooming')).toBeDefined()
    expect(screen.getByText(/Kelola Paket & Layanan Grooming/i)).toBeDefined()

    // Back button
    const backBtn = screen.getByTitle('Kembali ke Dashboard Grooming')
    expect(backBtn).toBeDefined()
    expect(backBtn.closest('a')?.getAttribute('href')).toBe('/admin/grooming')

    // Action button
    const addBtn = screen.getByRole('button', { name: /Tambah Paket Baru/i })
    expect(addBtn).toBeDefined()
  })

  it('renders active packages list in centered content container', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GroomingPengaturan />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Mandi Sehat Standard')).toBeDefined()
    expect(screen.getByText('Grooming Kutu & Jamur')).toBeDefined()
    expect(screen.getByText('Rp 65.000')).toBeDefined()
    expect(screen.getByText('Rp 95.000')).toBeDefined()
  })

  it('opens add package dialog when button clicked', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GroomingPengaturan />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const addBtn = screen.getByRole('button', { name: /Tambah Paket Baru/i })
    fireEvent.click(addBtn)

    expect(await screen.findByText('Paket Layanan Baru')).toBeDefined()
    expect(screen.getByPlaceholderText('Cth: Full Grooming + Anti Kutu')).toBeDefined()
  })

  it('enforces min="1" and numeric constraints on package form inputs', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GroomingPengaturan />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const addBtn = screen.getByRole('button', { name: /Tambah Paket Baru/i })
    fireEvent.click(addBtn)

    const priceInput = screen.getByPlaceholderText('Cth: 120000') as HTMLInputElement
    const durationInput = screen.getByPlaceholderText('Cth: 60') as HTMLInputElement

    expect(priceInput.getAttribute('min')).toBe('1')
    expect(durationInput.getAttribute('min')).toBe('1')
  })
})
