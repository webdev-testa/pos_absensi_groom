import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import GroomingCheckIn from '../GroomingCheckIn'
import * as useGroomingFormModule from '@/hooks/grooming/useGroomingForm'
import * as useAuthModule from '@/hooks/useAuth'
import type { Owner } from '@/types/pos'

vi.mock('@/hooks/useAuth')
vi.mock('@/hooks/grooming/useGroomingForm')

describe('src/pages/grooming/GroomingCheckIn.tsx - Component Tests', () => {
  const mockOwners: Owner[] = [
    {
      id: 'own-1',
      nama: 'Fara Nabila',
      no_wa: '081234567890',
      created_at: '2026-09-01T00:00:00.000Z',
      cats: [
        {
          id: 'cat-1',
          owner_id: 'own-1',
          nama: 'Milo',
          ras: 'British Shorthair',
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ],
    },
  ]

  const handleSelectOwner = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { name: 'Admin Cat', role: 'superadmin' } as any,
      loading: false,
    } as any)

    vi.spyOn(useGroomingFormModule, 'useGroomingForm').mockReturnValue({
      step: 1,
      setStep: vi.fn(),
      searchOwnerQuery: '',
      setSearchOwnerQuery: vi.fn(),
      selectedOwner: null,
      isNewOwner: false,
      setIsNewOwner: vi.fn(),
      newOwnerData: { nama: '', no_wa: '', email: '', alamat: '' },
      setNewOwnerData: vi.fn(),
      ownerSearchResults: mockOwners,
      isSearchingOwners: false,
      handleSelectOwner,
      handleClearOwner: vi.fn(),
      handleChooseNewOwner: vi.fn(),
      selectedCat: null,
      isNewCat: false,
      setIsNewCat: vi.fn(),
      newCatData: {
        nama: '',
        ras: 'Domestic',
        jenis_kelamin: 'Jantan',
        warna: '',
        umur_estimasi: '',
        catatan_kesehatan: '',
        foto_url: '',
      },
      setNewCatData: vi.fn(),
      ownerCats: [],
      isLoadingCats: false,
      handleSelectCat: vi.fn(),
      handleChooseNewCat: vi.fn(),
      formData: {
        paketId: 'pkg-1',
        paketNama: 'Mandi Sehat',
        harga: 65000,
        kondisiAwal: '',
        catatan: '',
        groomerName: 'Budi',
        estimasiMenit: 60,
        sudahBayar: false,
        metodeBayar: 'QRIS',
      },
      setFormData: vi.fn(),
      packages: [],
      handleSelectPackage: vi.fn(),
      submitCheckIn: vi.fn(),
      isSubmitting: false,
      createdSession: null,
      isSuccessModalOpen: false,
      setIsSuccessModalOpen: vi.fn(),
      resetForm: vi.fn(),
    } as any)
  })

  it('renders Step 1 with owner contacts list ready for direct selection', () => {
    render(
      <MemoryRouter>
        <GroomingCheckIn />
      </MemoryRouter>
    )

    // Heading & directory is visible
    expect(screen.getByText(/Pendaftaran Kucing Masuk/i)).toBeDefined()
    expect(screen.getByText('Fara Nabila')).toBeDefined()
    expect(screen.getByText(/0812-3456-7890/i)).toBeDefined()

    // Clicking owner card triggers selection
    const faraCard = screen.getByText('Fara Nabila').closest('[role="button"]')
    expect(faraCard).toBeDefined()
    if (faraCard) {
      fireEvent.click(faraCard)
      expect(handleSelectOwner).toHaveBeenCalledWith(mockOwners[0])
    }
  })

  it('sets isNewCat to true when proceeding with a new owner', () => {
    const setStep = vi.fn()
    const setIsNewCat = vi.fn()

    vi.spyOn(useGroomingFormModule, 'useGroomingForm').mockReturnValue({
      step: 1,
      setStep,
      searchOwnerQuery: '',
      setSearchOwnerQuery: vi.fn(),
      selectedOwner: null,
      isNewOwner: true,
      setIsNewOwner: vi.fn(),
      newOwnerData: { nama: 'Rian Hidayat', no_wa: '081299998888', email: '', alamat: '' },
      setNewOwnerData: vi.fn(),
      ownerSearchResults: mockOwners,
      isSearchingOwners: false,
      handleSelectOwner,
      handleClearOwner: vi.fn(),
      handleChooseNewOwner: vi.fn(),
      selectedCat: null,
      isNewCat: false,
      setIsNewCat,
      newCatData: {
        nama: '',
        ras: 'Domestic',
        jenis_kelamin: 'Jantan',
        warna: '',
        umur_estimasi: '',
        catatan_kesehatan: '',
        foto_url: '',
      },
      setNewCatData: vi.fn(),
      ownerCats: [],
      isLoadingCats: false,
      handleSelectCat: vi.fn(),
      handleChooseNewCat: vi.fn(),
      formData: {
        paketId: 'pkg-1',
        paketNama: 'Mandi Sehat',
        harga: 65000,
        kondisiAwal: '',
        catatan: '',
        groomerName: 'Budi',
        estimasiMenit: 60,
        sudahBayar: false,
        metodeBayar: 'QRIS',
      },
      setFormData: vi.fn(),
      packages: [],
      handleSelectPackage: vi.fn(),
      submitCheckIn: vi.fn(),
      isSubmitting: false,
      createdSession: null,
      isSuccessModalOpen: false,
      setIsSuccessModalOpen: vi.fn(),
      resetForm: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <GroomingCheckIn />
      </MemoryRouter>
    )

    const nextBtn = screen.getByRole('button', { name: /Simpan & Lanjut ke Data Kucing/i })
    fireEvent.click(nextBtn)

    expect(setIsNewCat).toHaveBeenCalledWith(true)
    expect(setStep).toHaveBeenCalledWith(2)
  })
})
