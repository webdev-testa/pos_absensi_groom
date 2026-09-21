import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PayrollTable } from '../PayrollTable'
import type { PayrollItem } from '@/types/payroll'

describe('PayrollTable.tsx - Component Tests', () => {
  const mockPayrollData: PayrollItem[] = [
    {
      user: {
        id: 'usr-1',
        name: 'Dr. John Doe',
        emp_id: 'DM-001',
        dept: 'Dokter',
        role: 'employee',
        status: 'active',
        salary: 6000000,
        kasbon_limit: 2000000,
        shift: 'Pagi',
        address: 'Jl. Melati',
      },
      payrollId: 'pr-1',
      basicSalary: 6000000,
      incentives: 500000,
      kasbonDeduction: 200000,
      netSalary: 6300000,
      status: 'draft',
      presentDays: 22,
      created_at: '2026-03-01T00:00:00Z',
    },
    {
      user: {
        id: 'usr-2',
        name: 'Jane Groomer',
        emp_id: 'DM-002',
        dept: 'Grooming',
        role: 'employee',
        status: 'active',
        salary: 4000000,
        kasbon_limit: 1500000,
        shift: 'Siang',
        address: 'Jl. Mawar',
      },
      payrollId: 'pr-2',
      basicSalary: 4000000,
      incentives: 0,
      kasbonDeduction: 0,
      netSalary: 4000000,
      status: 'paid',
      presentDays: 20,
      created_at: '2026-03-01T00:00:00Z',
    },
  ]

  const defaultProps = {
    filteredData: mockPayrollData,
    selectedUserId: null,
    setSelectedUserId: vi.fn(),
    openIncentiveModal: vi.fn(),
    markPaidMutation: {
      mutate: vi.fn(),
      isPending: false,
    },
    handlePrint: vi.fn(),
    selectedPeriod: '2026-03',
    setSelectedPeriod: vi.fn(),
    monthsList: [{ val: '2026-03', label: 'Maret 2026' }],
    exportExcel: vi.fn(),
    generateMutation: {
      mutate: vi.fn(),
      isPending: false,
    },
  }

  it('renders payroll table headers, employee entries, and status badges', () => {
    render(<PayrollTable {...defaultProps} />)

    expect(screen.getByText('Daftar Gaji Staf')).toBeInTheDocument()
    expect(screen.getByText(/2 data staf klinik/i)).toBeInTheDocument()
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument()
    expect(screen.getByText('DM-001')).toBeInTheDocument()
    expect(screen.getByText('● Draft')).toBeInTheDocument()
    expect(screen.getByText('Jane Groomer')).toBeInTheDocument()
    expect(screen.getByText('● Terbayar')).toBeInTheDocument()
  })

  it('handles row selection, incentive modal opening, and mark paid mutation', () => {
    const handleSelectUser = vi.fn()
    const handleIncentive = vi.fn()
    const handleMarkPaid = vi.fn()

    render(
      <PayrollTable
        {...defaultProps}
        setSelectedUserId={handleSelectUser}
        openIncentiveModal={handleIncentive}
        markPaidMutation={{
          mutate: handleMarkPaid,
          isPending: false,
        }}
      />
    )

    // Click row
    fireEvent.click(screen.getByText('Dr. John Doe'))
    expect(handleSelectUser).toHaveBeenCalledWith('usr-1')

    // Click Insentif button
    const incentiveBtns = screen.getAllByRole('button', { name: /Insentif/i })
    fireEvent.click(incentiveBtns[0])
    expect(handleIncentive).toHaveBeenCalledWith(mockPayrollData[0])

    // Click Bayar button for draft item
    const bayarBtn = screen.getByRole('button', { name: /^Bayar$/i })
    fireEvent.click(bayarBtn)
    expect(handleMarkPaid).toHaveBeenCalledWith(mockPayrollData[0])
  })

  it('triggers generateMutation when Generate Payroll button is clicked', () => {
    const handleGenerate = vi.fn()

    render(
      <PayrollTable
        {...defaultProps}
        generateMutation={{
          mutate: handleGenerate,
          isPending: false,
        }}
      />
    )

    const genBtn = screen.getByRole('button', { name: /Generate Payroll/i })
    fireEvent.click(genBtn)
    expect(handleGenerate).toHaveBeenCalled()
  })

  it('shows empty table state when filtered data is empty', () => {
    render(<PayrollTable {...defaultProps} filteredData={[]} />)
    expect(screen.getByText('Tidak ada data payroll yang cocok.')).toBeInTheDocument()
  })
})
