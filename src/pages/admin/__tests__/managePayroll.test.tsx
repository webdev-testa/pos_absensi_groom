import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Payroll from '../managePayroll'
import type { PayrollItem } from '@/types/payroll'

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

const mockPayrollItem: PayrollItem = {
  user: {
    id: 'usr-1',
    name: 'Dr. John Doe',
    emp_id: 'DM-001',
    dept: 'Dokter',
    role: 'employee',
    status: 'active',
    salary: 5000000,
    kasbon_limit: 2000000,
    shift: 'Pagi',
    address: 'Jl. Melati No. 1',
  },
  payrollId: 'pr-1',
  basicSalary: 5000000,
  incentives: 0,
  kasbonDeduction: 0,
  netSalary: 5000000,
  status: 'draft',
  presentDays: 20,
  created_at: '2026-03-01T00:00:00Z',
}

const mockUsePayroll = {
  selectedPeriod: '2026-03',
  setSelectedPeriod: vi.fn(),
  searchQ: '',
  setSearchQ: vi.fn(),
  deptFilter: 'all',
  setDeptFilter: vi.fn(),
  statusFilter: 'all',
  setStatusFilter: vi.fn(),
  selectedUserId: 'usr-1',
  setSelectedUserId: vi.fn(),
  showIncentiveModal: false,
  setShowIncentiveModal: vi.fn(),
  incentiveAmount: 0,
  setIncentiveAmount: vi.fn(),
  monthsList: [{ val: '2026-03', label: 'Maret 2026' }],
  selectedPeriodLabel: 'Maret 2026',
  isInitialLoading: false,
  mappedPayrollData: [mockPayrollItem],
  filteredData: [mockPayrollItem],
  departments: ['Dokter'],
  selectedItem: mockPayrollItem,
  stats: {
    totalEstimatedGaji: 5000000,
    totalPaidGaji: 0,
    totalRemainingGaji: 5000000,
    totalEmployees: 1,
    paidSlips: 0,
    progressPercentage: 0,
  },
  printItem: null,
  exportExcel: vi.fn(),
  handlePrint: vi.fn(),
  openIncentiveModal: vi.fn(),
  handleSaveIncentive: vi.fn(),
  generateMutation: { mutate: vi.fn(), isPending: false },
  markPaidMutation: { mutate: vi.fn(), isPending: false },
  markAllPaidMutation: { mutate: vi.fn(), isPending: false },
  updateIncentiveMutation: { mutate: vi.fn(), isPending: false },
}

vi.mock('@/hooks/usePayroll', () => ({
  usePayroll: () => mockUsePayroll,
}))

describe('managePayroll.tsx - Admin Page Tests', () => {
  it('renders payroll management page with stats, filters, and payroll table', () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    )

    expect(screen.getByText('Kelola Payroll & Gaji')).toBeInTheDocument()
    expect(screen.getByText(/Perhitungan gaji bersih, insentif performa, dan pemotongan kasbon staf/i)).toBeInTheDocument()
    expect(screen.getAllByText('Dr. John Doe').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('DM-001').length).toBeGreaterThanOrEqual(1)
  })

  it('triggers generate payroll mutation when Generate button is clicked', () => {
    render(
      <MemoryRouter>
        <Payroll />
      </MemoryRouter>
    )

    const genBtn = screen.getByRole('button', { name: /Generate Payroll/i })
    fireEvent.click(genBtn)
    expect(mockUsePayroll.generateMutation.mutate).toHaveBeenCalled()
  })
})
