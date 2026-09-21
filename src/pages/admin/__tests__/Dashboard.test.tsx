import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'usr-admin',
      name: 'Dr. Meow Admin',
      role: 'superadmin',
      email: 'admin@drmeow.com',
    },
  }),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}))

const mockDashboardData = {
  liveTime: '09:41',
  todayLabel: 'Selasa, 24 Maret 2026',
  currentMonth: { period: '2026-03', monthStart: '2026-03-01', monthEnd: '2026-04-01' },
  isInitialLoading: false,
  activeEmployeesCount: 12,
  attendanceTodayStats: {
    countPresent: 10,
    countOntime: 8,
    countLate: 2,
    countOut: 4,
    countAbsent: 2,
  },
  kasbonStats: {
    totalKasbonAmt: 1200000,
    countTransactions: 3,
    unpaidKasbonAmt: 400000,
    deductedKasbonAmt: 800000,
  },
  payrollStats: {
    totalPayrollPaid: 36000000,
    countPaidSlips: 10,
    estimatedSalary: 40000000,
    isGenerated: true,
    allPaid: false,
  },
  pastKasbonAlert: null,
  monthlyMetrics: {
    totalHours: 160,
    onTimeRate: 88,
  },
  attentionItems: [],
  activities: [],
}

vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: () => mockDashboardData,
}))

describe('Dashboard.tsx - Admin Page Tests', () => {
  it('renders dashboard with header, metric stat cards, and main sections', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    // Header info
    expect(screen.getByText('Selasa, 24 Maret 2026')).toBeInTheDocument()
    expect(screen.getByText('09:41')).toBeInTheDocument()

    // Stat cards
    expect(screen.getByText('Hadir hari ini')).toBeInTheDocument()
    expect(screen.getByText('Kasbon bulan ini')).toBeInTheDocument()
    expect(screen.getByText('Gaji dibayarkan')).toBeInTheDocument()
    expect(screen.getByText('Total karyawan')).toBeInTheDocument()
  })
})
