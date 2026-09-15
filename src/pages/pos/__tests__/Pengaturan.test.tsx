import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Pengaturan from '../Pengaturan'
import * as usePengaturanModule from '@/hooks/pos/usePengaturan'
import * as useAuthModule from '@/hooks/useAuth'
import type { PaketHarga, Pengaturan as PengaturanType } from '@/types/pos'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/pos/usePengaturan')

describe('src/pages/pos/Pengaturan.tsx - Component Tests', () => {
  const mockHandleSaveSettings = vi.fn()
  const mockHandleAddPaket = vi.fn()
  const mockHandleUpdatePaket = vi.fn()
  const mockHandleToggleAktif = vi.fn()
  const mockSetSettingsForm = vi.fn()

  const mockSettings: PengaturanType = {
    id: 1,
    nama_usaha: 'Dr. Meow Cat Hotel & Salon',
    no_wa_usaha: '081234567890',
    alamat_usaha: 'Jl. Ahmad Yani No. 45',
    nama_bank: 'BCA (Bank Central Asia)',
    no_rekening: '8735091234',
    atas_nama_rekening: 'Dr. Meow Cat Clinic',
    qris_nmid: 'ID1020304050607',
  }

  const mockPaketList: PaketHarga[] = [
    {
      id: 'pkg-1',
      nama: 'Standard Cat Room',
      harga_per_hari: 55000,
      deskripsi: 'Kandang stainless ber-AC',
      aktif: true,
    },
    {
      id: 'pkg-2',
      nama: 'VIP Cat Suite',
      harga_per_hari: 95000,
      deskripsi: 'Kamar privat luas dengan CCTV',
      aktif: false,
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

    vi.spyOn(usePengaturanModule, 'usePengaturan').mockReturnValue({
      pengaturan: mockSettings,
      settingsForm: mockSettings,
      setSettingsForm: mockSetSettingsForm,
      handleSaveSettings: mockHandleSaveSettings,
      isSavingSettings: false,
      paketList: mockPaketList,
      handleAddPaket: mockHandleAddPaket,
      handleUpdatePaket: mockHandleUpdatePaket,
      handleToggleAktif: mockHandleToggleAktif,
      isLoading: false,
    })
  })

  it('renders settings page title and form inputs for business profile', () => {
    render(
      <MemoryRouter>
        <Pengaturan />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Pengaturan Penitipan/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue(/Dr. Meow Cat Hotel & Salon/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/081234567890/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/8735091234/i)).toBeInTheDocument()
  })

  it('renders list of pricing packages and their active state', () => {
    render(
      <MemoryRouter>
        <Pengaturan />
      </MemoryRouter>
    )

    expect(screen.getByText(/Standard Cat Room/i)).toBeInTheDocument()
    expect(screen.getByText(/VIP Cat Suite/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp 55.000/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp 95.000/i)).toBeInTheDocument()
  })

  it('opens add package dialog when clicking Tambah Paket button', () => {
    render(
      <MemoryRouter>
        <Pengaturan />
      </MemoryRouter>
    )

    const tambahBtn = screen.getByRole('button', { name: /Tambah Paket/i })
    fireEvent.click(tambahBtn)

    expect(screen.getByRole('heading', { name: /Tambah Paket Baru/i })).toBeInTheDocument()
  })
})
