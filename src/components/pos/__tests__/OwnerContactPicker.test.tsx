import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OwnerContactPicker } from '../OwnerContactPicker'
import type { Owner } from '@/types/pos'

describe('src/components/pos/OwnerContactPicker.tsx - Component & Red-Team Tests', () => {
  const mockOwners: Owner[] = [
    {
      id: 'own-1',
      nama: 'Fara Nabila',
      no_wa: '081234567890',
      alamat: 'Jl. Kemang Selatan No. 12',
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
    {
      id: 'own-2',
      nama: 'Andi Pratama',
      no_wa: '081987654321',
      created_at: '2026-09-01T00:00:00.000Z',
      cats: [],
    },
  ]

  it('renders contact directory list with owner details and cat badges', () => {
    const handleSelectOwner = vi.fn()
    render(
      <OwnerContactPicker
        selectedOwner={null}
        onSelectOwner={handleSelectOwner}
        onClearOwner={vi.fn()}
        isNewOwner={false}
        onToggleNewOwner={vi.fn()}
        newOwnerData={{ nama: '', no_wa: '' }}
        onChangeNewOwnerData={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        owners={mockOwners}
        isLoading={false}
        onProceedNext={vi.fn()}
      />
    )

    expect(screen.getByText('Fara Nabila')).toBeDefined()
    expect(screen.getByText(/0812-3456-7890/)).toBeDefined()
    expect(screen.getByText(/Jl. Kemang Selatan No. 12/)).toBeDefined()
    expect(screen.getByText('Milo')).toBeDefined()
    expect(screen.getByText('Andi Pratama')).toBeDefined()

    // Clicking owner card triggers onSelectOwner
    const faraCard = screen.getByText('Fara Nabila').closest('[role="button"]')
    expect(faraCard).toBeDefined()
    if (faraCard) {
      fireEvent.click(faraCard)
      expect(handleSelectOwner).toHaveBeenCalledWith(mockOwners[0])
    }
  })

  it('filters owners by Punya Kucing tab', () => {
    render(
      <OwnerContactPicker
        selectedOwner={null}
        onSelectOwner={vi.fn()}
        onClearOwner={vi.fn()}
        isNewOwner={false}
        onToggleNewOwner={vi.fn()}
        newOwnerData={{ nama: '', no_wa: '' }}
        onChangeNewOwnerData={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        owners={mockOwners}
        isLoading={false}
        onProceedNext={vi.fn()}
      />
    )

    // Click "Punya Kucing" tab
    const withCatsTab = screen.getByRole('button', { name: /Punya Kucing/i })
    fireEvent.click(withCatsTab)

    // Fara Nabila has cat -> should be present
    expect(screen.getByText('Fara Nabila')).toBeDefined()
    // Andi Pratama has no cat -> should not be present
    expect(screen.queryByText('Andi Pratama')).toBeNull()
  })

  it('renders Selected Owner hero card and triggers onClearOwner', () => {
    const handleClearOwner = vi.fn()
    const handleProceedNext = vi.fn()

    render(
      <OwnerContactPicker
        selectedOwner={mockOwners[0]}
        onSelectOwner={vi.fn()}
        onClearOwner={handleClearOwner}
        isNewOwner={false}
        onToggleNewOwner={vi.fn()}
        newOwnerData={{ nama: '', no_wa: '' }}
        onChangeNewOwnerData={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        owners={mockOwners}
        isLoading={false}
        onProceedNext={handleProceedNext}
      />
    )

    expect(screen.getByText(/Kontak Owner Terpilih/i)).toBeDefined()
    expect(screen.getByText('Fara Nabila')).toBeDefined()

    const changeBtn = screen.getByRole('button', { name: /Ganti \/ Cari Owner Lain/i })
    fireEvent.click(changeBtn)
    expect(handleClearOwner).toHaveBeenCalledTimes(1)

    const nextBtn = screen.getByRole('button', { name: /Lanjut ke Pilih Kucing/i })
    fireEvent.click(nextBtn)
    expect(handleProceedNext).toHaveBeenCalledTimes(1)
  })

  it('enforces >= 8 digits phone validation in new owner form before enabling submit', () => {
    const handleProceed = vi.fn()
    const { rerender } = render(
      <OwnerContactPicker
        selectedOwner={null}
        onSelectOwner={vi.fn()}
        onClearOwner={vi.fn()}
        isNewOwner={true}
        onToggleNewOwner={vi.fn()}
        newOwnerData={{ nama: 'Budi', no_wa: '1234' }} // only 4 digits!
        onChangeNewOwnerData={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        owners={mockOwners}
        isLoading={false}
        onProceedNext={handleProceed}
      />
    )

    expect(screen.getByText(/minimal 8 digit angka/i)).toBeDefined()
    const submitBtn = screen.getByRole('button', { name: /Simpan & Lanjut ke Data Kucing/i })
    expect(submitBtn.hasAttribute('disabled')).toBe(true)

    // Re-render with valid >= 8 digit phone
    rerender(
      <OwnerContactPicker
        selectedOwner={null}
        onSelectOwner={vi.fn()}
        onClearOwner={vi.fn()}
        isNewOwner={true}
        onToggleNewOwner={vi.fn()}
        newOwnerData={{ nama: 'Budi Santoso', no_wa: '08123456789' }}
        onChangeNewOwnerData={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        owners={mockOwners}
        isLoading={false}
        onProceedNext={handleProceed}
      />
    )

    expect(screen.queryByText(/minimal 8 digit angka/i)).toBeNull()
    const enabledSubmitBtn = screen.getByRole('button', { name: /Simpan & Lanjut ke Data Kucing/i })
    expect(enabledSubmitBtn.hasAttribute('disabled')).toBe(false)
    fireEvent.click(enabledSubmitBtn)
    expect(handleProceed).toHaveBeenCalledTimes(1)
  })
})
