import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AttendanceTable } from '../AttendanceTable'
import type { AttendanceRecord } from '@/types/attendance'

describe('AttendanceTable.tsx - Component Tests', () => {
  const mockAttendance: AttendanceRecord[] = [
    {
      id: 'att-1',
      user_id: 'usr-1',
      date: '2026-03-24',
      clock_in_time: '2026-03-24T08:00:00Z',
      clock_out_time: '2026-03-24T17:00:00Z',
      status: 'ontime',
      is_flagged: false,
      clock_in_photo_url: 'https://example.com/photo.jpg',
      users: {
        name: 'Dr. Meow Specialist',
        emp_id: 'DM-001',
        dept: 'Dokter Hewan',
      },
    },
    {
      id: 'att-2',
      user_id: 'usr-2',
      date: '2026-03-24',
      clock_in_time: '2026-03-24T08:45:00Z',
      clock_out_time: null,
      status: 'late',
      is_flagged: true,
      clock_in_photo_url: null,
      users: {
        name: 'Doni Groomer',
        emp_id: 'DM-002',
        dept: 'Pet Groomer',
      },
    },
  ]

  const defaultProps = {
    filteredData: mockAttendance,
    searchQ: '',
    setSearchQ: vi.fn(),
    deptFilter: 'all',
    setDeptFilter: vi.fn(),
    activeTab: 'today',
    setActiveTab: vi.fn(),
    toggleFlag: vi.fn(),
    onExportClick: vi.fn(),
  }

  it('renders attendance table with entries and status elements', () => {
    render(<AttendanceTable {...defaultProps} />)

    expect(screen.getByText('Rekap kehadiran hari ini')).toBeInTheDocument()
    expect(screen.getByText('Dr. Meow Specialist')).toBeInTheDocument()
    expect(screen.getByText('DM-001')).toBeInTheDocument()
    expect(screen.getByText('Doni Groomer')).toBeInTheDocument()
    expect(screen.getByText('DM-002')).toBeInTheDocument()
    expect(screen.getByText('⚑ Flagged')).toBeInTheDocument()
  })

  it('handles search input and tab switching', () => {
    const handleSearch = vi.fn()
    const handleTabChange = vi.fn()

    render(
      <AttendanceTable
        {...defaultProps}
        setSearchQ={handleSearch}
        setActiveTab={handleTabChange}
      />
    )

    const searchInput = screen.getByPlaceholderText('Cari karyawan...')
    fireEvent.change(searchInput, { target: { value: 'Doni' } })
    expect(handleSearch).toHaveBeenCalledWith('Doni')

    const weekTabBtn = screen.getByRole('button', { name: /Minggu ini/i })
    fireEvent.click(weekTabBtn)
    expect(handleTabChange).toHaveBeenCalledWith('week')
  })

  it('toggles flag on attendance record when flag button clicked', () => {
    const handleToggleFlag = vi.fn()

    render(
      <AttendanceTable
        {...defaultProps}
        toggleFlag={handleToggleFlag}
      />
    )

    const flaggedBtn = screen.getByText('⚑ Flagged')
    fireEvent.click(flaggedBtn)
    expect(handleToggleFlag).toHaveBeenCalledWith('att-2', true)
  })

  it('shows empty table state when filtered data is empty', () => {
    render(<AttendanceTable {...defaultProps} filteredData={[]} />)
    expect(screen.getByText('Tidak ada data absensi yang sesuai.')).toBeInTheDocument()
  })
})
