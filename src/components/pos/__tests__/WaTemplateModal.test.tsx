import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WaTemplateModal } from '../WaTemplateModal'
import type { Booking } from '@/types/pos'

describe('src/components/pos/WaTemplateModal.tsx - Component Tests', () => {
  const mockBooking: Booking = {
    id: 'book-wa-1',
    cat_id: 'cat-1',
    owner_id: 'own-1',
    tanggal_masuk: '2026-03-24',
    tanggal_keluar_estimasi: '2026-03-27',
    paket: 'Standard Room',
    harga_per_hari: 50000,
    status: 'aktif',
    created_at: '2026-03-24T08:00:00.000Z',
    owner: {
      id: 'own-1',
      nama: 'Alya',
      no_wa: '08123456789',
      created_at: '2026-03-24T08:00:00.000Z',
    },
    cat: {
      id: 'cat-1',
      owner_id: 'own-1',
      nama: 'Luna',
      ras: 'Siam',
      created_at: '2026-03-24T08:00:00.000Z',
    },
    transactions: [],
  }

  it('renders check-in template modal with owner and cat details', () => {
    render(
      <WaTemplateModal
        isOpen={true}
        onClose={vi.fn()}
        type="checkin"
        data={mockBooking}
        dp={50000}
        namaUsaha="Dr. Meow Clinic & Hotel"
      />
    )

    expect(screen.getByRole('heading', { name: /Pesan Konfirmasi Check-In/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Alya/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Luna/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /Salin Pesan/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Buka WhatsApp/i })).toBeInTheDocument()
  })

  it('opens WhatsApp with encoded message url when Buka WhatsApp is clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(
      <WaTemplateModal
        isOpen={true}
        onClose={vi.fn()}
        type="checkin"
        data={mockBooking}
        dp={50000}
        namaUsaha="Dr. Meow Clinic & Hotel"
      />
    )

    const waBtn = screen.getByRole('button', { name: /Buka WhatsApp/i })
    fireEvent.click(waBtn)

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/628123456789?text='),
      '_blank',
      'noopener,noreferrer'
    )

    openSpy.mockRestore()
  })

  it('renders nothing when data is null', () => {
    const { container } = render(
      <WaTemplateModal
        isOpen={true}
        onClose={vi.fn()}
        type="checkin"
        data={null}
      />
    )

    expect(container.firstChild).toBeNull()
  })
})
