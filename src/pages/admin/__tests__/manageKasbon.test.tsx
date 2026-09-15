import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ManageKasbon from '../manageKasbon'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'usr-admin', name: 'Dr. Meow Admin', role: 'superadmin' },
  }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

const mockKasbonItem = {
  id: 'kasbon-1',
  name: 'Rudi Kasir',
  empId: 'DM-003',
  date: '2026-03-10',
  amount: 500000,
  note: 'Keperluan darurat keluarga',
  status: 'pending' as const,
  balance: 500000,
  user_id: 'usr-3',
  requested_at: '2026-03-10T10:00:00Z',
  category: 'Darurat',
}

const mockUseKasbon = {
  searchQ: '',
  setSearchQ: vi.fn(),
  statusFilter: 'all',
  setStatusFilter: vi.fn(),
  tabFilter: 'all',
  setTabFilter: vi.fn(),
  monthFilter: '2026-03',
  setMonthFilter: vi.fn(),
  showModal: false,
  setShowModal: vi.fn(),
  selectedUserId: '',
  setSelectedUserId: vi.fn(),
  amountInput: '',
  setAmountInput: vi.fn(),
  dateInput: '2026-03-24',
  setDateInput: vi.fn(),
  reasonInput: '',
  setReasonInput: vi.fn(),
  categoryInput: 'Darurat',
  setCategoryInput: vi.fn(),
  monthsList: [{ val: '2026-03', label: 'Maret 2026' }],
  employees: [],
  loadingKasbon: false,
  refetchKasbon: vi.fn(),
  monthlyStats: {
    totalRequested: 1000000,
    totalApproved: 500000,
    totalRemaining: 500000,
    totalDeducted: 0,
    countPending: 1,
  },
  filteredKasbon: [mockKasbonItem],
  handleApprove: vi.fn(),
  handleReject: vi.fn(),
  handleMarkDeducted: vi.fn(),
  handleCreateKasbon: vi.fn(),
  approveMutation: { isPending: false },
  rejectMutation: { isPending: false },
  markDeductedMutation: { isPending: false },
  addKasbonMutation: { isPending: false },
  selectedEmpLimitInfo: null,
}

vi.mock('@/hooks/useKasbon', () => ({
  useKasbon: () => mockUseKasbon,
}))

describe('manageKasbon.tsx - Admin Page Tests', () => {
  it('renders kasbon page with title, stats, filters, and records', () => {
    render(
      <MemoryRouter>
        <ManageKasbon />
      </MemoryRouter>
    )

    expect(screen.getByText('Log Kasbon Staf')).toBeInTheDocument()
    expect(screen.getByText('Rudi Kasir')).toBeInTheDocument()
    expect(screen.getByText('DM-003')).toBeInTheDocument()
    expect(screen.getByText('Keperluan darurat keluarga')).toBeInTheDocument()
  })

  it('triggers approve action when Approve button is clicked', () => {
    render(
      <MemoryRouter>
        <ManageKasbon />
      </MemoryRouter>
    )

    const approveBtn = screen.getByRole('button', { name: /Approve/i })
    fireEvent.click(approveBtn)
    expect(mockUseKasbon.handleApprove).toHaveBeenCalledWith('kasbon-1')
  })
})
