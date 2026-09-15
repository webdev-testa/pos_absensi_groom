import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { StatCards } from '../StatCards'

describe('StatCards.tsx - Component Tests', () => {
  const mockProps = {
    attendanceTodayStats: {
      countPresent: 12,
      countOntime: 10,
      countLate: 2,
      countOut: 5,
      countAbsent: 3,
    },
    activeEmployeesCount: 15,
    kasbonStats: {
      totalKasbonAmt: 1500000,
      countTransactions: 4,
      unpaidKasbonAmt: 500000,
      deductedKasbonAmt: 1000000,
    },
    payrollStats: {
      totalPayrollPaid: 25000000,
      countPaidSlips: 10,
      estimatedSalary: 25000000,
      isGenerated: true,
      allPaid: false,
    },
  }

  it('renders all four stat cards with accurate values and links', () => {
    render(
      <MemoryRouter>
        <StatCards {...mockProps} />
      </MemoryRouter>
    )

    // Hadir hari ini
    expect(screen.getByText(/Hadir hari ini/i)).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText(/dari 15 staf klinik/i)).toBeInTheDocument()
    expect(screen.getByText(/3 belum absen/i)).toBeInTheDocument()

    // Kasbon bulan ini
    expect(screen.getByText(/Kasbon bulan ini/i)).toBeInTheDocument()
    expect(screen.getByText(/4 pengajuan/i)).toBeInTheDocument()

    // Gaji dibayarkan
    expect(screen.getByText(/Gaji dibayarkan/i)).toBeInTheDocument()
    expect(screen.getByText(/Payroll Draft/i)).toBeInTheDocument()

    // Total karyawan
    expect(screen.getByText(/Total karyawan/i)).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('displays success badges when all present and all kasbon deducted', () => {
    const perfectProps = {
      ...mockProps,
      attendanceTodayStats: {
        ...mockProps.attendanceTodayStats,
        countAbsent: 0,
      },
      kasbonStats: {
        ...mockProps.kasbonStats,
        unpaidKasbonAmt: 0,
      },
      payrollStats: {
        ...mockProps.payrollStats,
        isGenerated: true,
        allPaid: true,
      },
    }

    render(
      <MemoryRouter>
        <StatCards {...perfectProps} />
      </MemoryRouter>
    )

    expect(screen.getByText(/Semua hadir/i)).toBeInTheDocument()
    expect(screen.getByText(/Semua terpotong/i)).toBeInTheDocument()
    expect(screen.getByText(/Payroll selesai \(Paid\)/i)).toBeInTheDocument()
  })

  it('shows ungenerated badge when payroll is not yet generated', () => {
    const ungeneratedProps = {
      ...mockProps,
      payrollStats: {
        ...mockProps.payrollStats,
        isGenerated: false,
        allPaid: false,
      },
    }

    render(
      <MemoryRouter>
        <StatCards {...ungeneratedProps} />
      </MemoryRouter>
    )

    expect(screen.getByText(/Payroll belum dibuat/i)).toBeInTheDocument()
  })
})
