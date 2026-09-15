import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CheckIn from '../CheckIn'
import * as useCheckInModule from '@/hooks/pos/useCheckIn'
import * as useAuthModule from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/pos/useCheckIn')

describe('src/pages/pos/CheckIn.tsx - Component Tests', () => {
  const mockResetForm = vi.fn()
  const mockSubmitCheckIn = vi.fn()

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

    vi.spyOn(useCheckInModule, 'useCheckIn').mockReturnValue({
      step: 1,
      setStep: vi.fn(),
      searchOwnerQuery: '',
      setSearchOwnerQuery: vi.fn(),
      searchResults: [],
      selectedOwner: null,
      setSelectedOwner: vi.fn(),
      selectOwner: vi.fn(),
      isNewOwner: false,
      setIsNewOwner: vi.fn(),
      chooseNewOwner: vi.fn(),
      newOwnerData: { nama: '', no_wa: '', email: '', alamat: '' },
      setNewOwnerData: vi.fn(),
      ownerCats: [],
      selectedCat: null,
      setSelectedCat: vi.fn(),
      selectCat: vi.fn(),
      isNewCat: false,
      setIsNewCat: vi.fn(),
      chooseNewCat: vi.fn(),
      newCatData: { nama: '', ras: '', jenis_kelamin: 'Jantan', warna: '', umur_estimasi: '', catatan_kesehatan: '', foto_url: '' },
      setNewCatData: vi.fn(),
      activePakets: [
        { id: '1', nama: 'Standard Room', harga_per_hari: 50000, deskripsi: 'Kandang nyaman', aktif: true },
      ],
      bookingData: {
        tanggal_masuk: '2026-03-27',
        tanggal_keluar_estimasi: '2026-03-30',
        paket: 'Standard Room',
        harga_per_hari: 50000,
        catatan: '',
        dp: 0,
      },
      setBookingData: vi.fn(),
      selectPaket: vi.fn(),
      submitCheckIn: mockSubmitCheckIn,
      createdBooking: null,
      isModalOpen: false,
      setIsModalOpen: vi.fn(),
      resetForm: mockResetForm,
      pengaturan: {
        id: 1,
        nama_usaha: 'Dr. Meow Hotel',
        no_wa_usaha: '08123456789',
        alamat_usaha: 'Jakarta',
        nama_bank: 'BCA',
        no_rekening: '123456',
        atas_nama_rekening: 'Dr. Meow',
        qris_nmid: 'ID123',
      },
      isSubmitting: false,
    } as any)
  })

  it('renders check-in header and reset form button', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /Check-In Kucing Baru/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reset Form/i })).toBeInTheDocument()
  })

  it('triggers resetForm when Reset Form button is clicked', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    const resetBtn = screen.getByRole('button', { name: /Reset Form/i })
    fireEvent.click(resetBtn)

    expect(mockResetForm).toHaveBeenCalledTimes(1)
  })
})
