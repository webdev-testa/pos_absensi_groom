import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { KasbonTable } from '../KasbonTable'
import type { KasbonMapped } from '@/types/kasbon'

describe('KasbonTable.tsx - Component Tests', () => {
  const mockKasbonList: KasbonMapped[] = [
    {
      id: 'kasbon-1',
      name: 'Rudi Kasir',
      empId: 'DM-003',
      date: '2026-03-10',
      amount: 500000,
      note: 'Keperluan mendadak keluarga',
      status: 'pending',
      balance: 500000,
      user_id: 'user-3',
      requested_at: '2026-03-10T10:00:00Z',
      category: 'Darurat',
    },
    {
      id: 'kasbon-2',
      name: 'Siti Paramedis',
      empId: 'DM-004',
      date: '2026-03-01',
      amount: 300000,
      note: 'Beli obat',
      status: 'approved',
      balance: 300000,
      user_id: 'user-4',
      requested_at: '2026-03-01T09:00:00Z',
      category: 'Medis',
    },
  ]

  it('renders kasbon table with entries and status badges', () => {
    render(
      <KasbonTable
        filteredKasbon={mockKasbonList}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onMarkDeducted={vi.fn()}
        approvePending={false}
        rejectPending={false}
        deductPending={false}
        loadingKasbon={false}
        onRefetch={vi.fn()}
        onExportClick={vi.fn()}
        onAddClick={vi.fn()}
      />
    )

    expect(screen.getByText('Daftar Kasbon Staf')).toBeInTheDocument()
    expect(screen.getByText('Rudi Kasir')).toBeInTheDocument()
    expect(screen.getByText('DM-003')).toBeInTheDocument()
    expect(screen.getByText(/Keperluan mendadak keluarga/i)).toBeInTheDocument()
    expect(screen.getByText('Siti Paramedis')).toBeInTheDocument()
  })

  it('triggers onApprove and onReject when respective buttons are clicked on pending kasbon', () => {
    const handleApprove = vi.fn()
    const handleReject = vi.fn()

    render(
      <KasbonTable
        filteredKasbon={mockKasbonList}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkDeducted={vi.fn()}
        approvePending={false}
        rejectPending={false}
        deductPending={false}
        loadingKasbon={false}
        onRefetch={vi.fn()}
        onExportClick={vi.fn()}
        onAddClick={vi.fn()}
      />
    )

    const approveBtn = screen.getByRole('button', { name: /Approve/i })
    const rejectBtn = screen.getByRole('button', { name: /Tolak/i })

    fireEvent.click(approveBtn)
    expect(handleApprove).toHaveBeenCalledWith('kasbon-1')

    fireEvent.click(rejectBtn)
    expect(handleReject).toHaveBeenCalledWith('kasbon-1')
  })

  it('disables approve and reject buttons while operation is pending', () => {
    render(
      <KasbonTable
        filteredKasbon={mockKasbonList}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onMarkDeducted={vi.fn()}
        approvePending={true}
        rejectPending={false}
        deductPending={false}
        loadingKasbon={false}
        onRefetch={vi.fn()}
        onExportClick={vi.fn()}
        onAddClick={vi.fn()}
      />
    )

    const approveBtn = screen.getByRole('button', { name: /Approve/i })
    const rejectBtn = screen.getByRole('button', { name: /Tolak/i })

    expect(approveBtn).toBeDisabled()
    expect(rejectBtn).toBeDisabled()
  })
})
