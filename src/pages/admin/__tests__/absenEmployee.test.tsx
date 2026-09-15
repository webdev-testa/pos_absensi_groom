import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AbsenEmployee from '../absenEmployee'

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

const mockUseAttendance = {
  mainTab: 'absensi',
  setMainTab: vi.fn(),
  activeTab: 'today',
  setActiveTab: vi.fn(),
  searchQ: '',
  setSearchQ: vi.fn(),
  deptFilter: 'all',
  setDeptFilter: vi.fn(),
  statusFilter: 'all',
  setStatusFilter: vi.fn(),
  filteredData: [],
  feedEvents: [],
  cutiLoading: false,
  actionLoading: false,
  pendingGroups: [],
  rejectedGroups: [],
  holidays: [],
  holidayLoading: false,
  newHolidayName: '',
  setNewHolidayName: vi.fn(),
  newHolidayDate: '',
  setNewHolidayDate: vi.fn(),
  newHolidayType: 'libur_nasional',
  setNewHolidayType: vi.fn(),
  upcomingHolidays: [],
  pastHolidays: [],
  toggleFlag: vi.fn(),
  handleApproveCuti: vi.fn(),
  handleRejectCuti: vi.fn(),
  handleAddHoliday: vi.fn(),
  handleDeleteHoliday: vi.fn(),
  fetchCutiRequests: vi.fn(),
  totalEmployees: 10,
  statOntime: 7,
  statLate: 2,
  statAbsent: 1,
  statOut: 3,
  statPendingCuti: 0,
  statPendingIzin: 0,
  statPendingSakit: 0,
  statTotalPending: 0,
}

vi.mock('@/hooks/useAttendance', () => ({
  useAttendance: () => mockUseAttendance,
}))

describe('absenEmployee.tsx - Admin Page Tests', () => {
  it('renders attendance dashboard page and handles tab switches', () => {
    render(
      <MemoryRouter>
        <AbsenEmployee />
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard Absensi & Shift')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Absensi/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Kelola Cuti/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hari Libur/i })).toBeInTheDocument()

    const cutiTabBtn = screen.getByRole('button', { name: /Kelola Cuti/i })
    fireEvent.click(cutiTabBtn)
    expect(mockUseAttendance.setMainTab).toHaveBeenCalledWith('cuti')
  })
})
