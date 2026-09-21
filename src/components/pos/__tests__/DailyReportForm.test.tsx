import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DailyReportForm } from '../DailyReportForm'
import type { Booking } from '@/types/pos'
import type { DailyReportFormData } from '@/hooks/pos/useDailyReport'

describe('src/components/pos/DailyReportForm.tsx - Component Tests', () => {
  const mockBooking: Booking = {
    id: 'book-rep-form-1',
    cat_id: 'cat-1',
    owner_id: 'own-1',
    tanggal_masuk: '2026-03-22',
    tanggal_keluar_estimasi: '2026-03-28',
    paket: 'Standard Room',
    harga_per_hari: 50000,
    status: 'aktif',
    created_at: '2026-03-22T08:00:00.000Z',
    owner: {
      id: 'own-1',
      nama: 'Bambang',
      no_wa: '0812999888',
      created_at: '2026-03-22T08:00:00.000Z',
    },
    cat: {
      id: 'cat-1',
      owner_id: 'own-1',
      nama: 'Oreo',
      ras: 'Domestic',
      created_at: '2026-03-22T08:00:00.000Z',
    },
    transactions: [],
  }

  const initialFormData: DailyReportFormData = {
    nafsu_makan: 'Baik (hampir habis)',
    minum: 'Normal',
    feses: 'Normal (padat, coklat)',
    urinasi: 'Normal',
    kondisi_umum: 'Kucing tampak ceria dan aktif melompat.',
    keterangan: 'Makan tepat waktu.',
    foto_url: '',
  }

  it('renders report form dialog with cat name and health categories', () => {
    render(
      <DailyReportForm
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
        today="2026-03-25"
        formData={initialFormData}
        setFormData={vi.fn()}
        onSave={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: /Laporan Harian: Oreo/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Nafsu Makan/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Air Minum/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Feses/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Urinasi/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Simpan & Buka WhatsApp Modal/i)).toBeInTheDocument()
  })

  it('calls onSave when form is submitted', () => {
    const handleSave = vi.fn()

    render(
      <DailyReportForm
        isOpen={true}
        onClose={vi.fn()}
        booking={mockBooking}
        today="2026-03-25"
        formData={initialFormData}
        setFormData={vi.fn()}
        onSave={handleSave}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /Simpan & Buka WhatsApp Modal/i })
    fireEvent.click(submitBtn)

    expect(handleSave).toHaveBeenCalled()
  })

  it('renders null when booking is not provided', () => {
    const { container } = render(
      <DailyReportForm
        isOpen={true}
        onClose={vi.fn()}
        booking={null}
        today="2026-03-25"
        formData={initialFormData}
        setFormData={vi.fn()}
        onSave={vi.fn()}
      />
    )

    expect(container.firstChild).toBeNull()
  })
})
