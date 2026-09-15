import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PrintPayslip } from '../PrintPayslip'
import type { PayrollItem } from '@/types/payroll'

describe('PrintPayslip.tsx - Component Tests', () => {
  const mockPrintItem: PayrollItem = {
    user: {
      id: 'usr-10',
      name: 'Ahmad Paramedis',
      emp_id: 'DM-010',
      dept: 'Paramedis',
      role: 'employee',
      status: 'active',
      salary: 4500000,
      kasbon_limit: 1500000,
      shift: 'Pagi',
      address: 'Jl. Melati No. 10',
    },
    payrollId: 'pr-10',
    basicSalary: 4500000,
    incentives: 250000,
    kasbonDeduction: 500000,
    netSalary: 4250000,
    status: 'paid',
    presentDays: 22,
    created_at: '2026-03-01T00:00:00Z',
  }

  it('renders payslip with employee credentials and exact Rupiah figures', () => {
    render(
      <PrintPayslip
        printItem={mockPrintItem}
        selectedPeriodLabel="Maret 2026"
      />
    )

    // Heading and Period
    expect(screen.getByText(/SLIP GAJI KARYAWAN/i)).toBeInTheDocument()
    expect(screen.getByText(/Periode: Maret 2026/i)).toBeInTheDocument()

    // Employee info
    expect(screen.getAllByText('Ahmad Paramedis').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('ID: DM-010')).toBeInTheDocument()
    expect(screen.getByText('Paramedis')).toBeInTheDocument()

    // Earnings and Deductions (must be exact Rupiah strings, not abbreviated like 4,5 jt)
    expect(screen.getByText(/4\.500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/\+.*250\.000/)).toBeInTheDocument()
    expect(screen.getByText(/-.*500\.000/)).toBeInTheDocument()
    expect(screen.getByText(/4\.250\.000/)).toBeInTheDocument()
  })
})
