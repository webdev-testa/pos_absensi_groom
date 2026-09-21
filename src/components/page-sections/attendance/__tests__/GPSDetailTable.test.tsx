import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GPSDetailTable } from '../GPSDetailTable'
import type { AttendanceGPSItem } from '@/hooks/useGeolocation'

const mockRecords: AttendanceGPSItem[] = [
  {
    id: 'att-1',
    user_id: 'u-1',
    date: '2026-09-21',
    clock_in_time: '2026-09-21T08:00:00.000Z',
    clock_out_time: null,
    status: 'ontime',
    is_flagged: false,
    clock_in_photo_url: 'https://example.com/photo.jpg',
    clock_in_lat: -6.1902,
    clock_in_lng: 106.8239,
    clock_out_lat: null,
    clock_out_lng: null,
    users: { name: 'Ahmad Vet', emp_id: 'EMP-01', dept: 'dokter' },
    distanceMeters: 45,
    isInsideGeofence: true,
    distanceFormatted: '45 m',
  },
  {
    id: 'att-2',
    user_id: 'u-2',
    date: '2026-09-21',
    clock_in_time: '2026-09-21T08:30:00.000Z',
    clock_out_time: null,
    status: 'late',
    is_flagged: false,
    clock_in_photo_url: null,
    clock_in_lat: -6.1950,
    clock_in_lng: 106.8239,
    users: { name: 'Citra Kasir', emp_id: 'EMP-02', dept: 'kasir' },
    distanceMeters: 520,
    isInsideGeofence: false,
    distanceFormatted: '520 m',
  },
]

describe('GPSDetailTable.tsx - Component Tests', () => {
  const defaultProps = {
    records: mockRecords,
    selectedRecordId: null,
    onSelectRecord: vi.fn(),
    searchQ: '',
    setSearchQ: vi.fn(),
    deptFilter: 'all',
    setDeptFilter: vi.fn(),
    areaFilter: 'all' as const,
    setAreaFilter: vi.fn(),
    dateFilter: 'today' as const,
    setDateFilter: vi.fn(),
  }

  it('renders employee rows with name, status, distance, and geofence badges', () => {
    render(<GPSDetailTable {...defaultProps} />)

    expect(screen.getByText('Ahmad Vet')).toBeInTheDocument()
    expect(screen.getByText('Citra Kasir')).toBeInTheDocument()
    expect(screen.getByText(/Dalam Radius \(45 m\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Di Luar Radius \(520 m\)/i)).toBeInTheDocument()
  })

  it('handles search input changes', () => {
    render(<GPSDetailTable {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Cari staf klinik...')
    fireEvent.change(searchInput, { target: { value: 'Ahmad' } })
    expect(defaultProps.setSearchQ).toHaveBeenCalledWith('Ahmad')
  })

  it('handles department filter changes', () => {
    render(<GPSDetailTable {...defaultProps} />)

    const select = screen.getByDisplayValue('Semua Posisi')
    fireEvent.change(select, { target: { value: 'dokter' } })
    expect(defaultProps.setDeptFilter).toHaveBeenCalledWith('dokter')
  })

  it('handles area compliance filter changes', () => {
    render(<GPSDetailTable {...defaultProps} />)

    const select = screen.getByDisplayValue('Semua Kategori Area')
    fireEvent.change(select, { target: { value: 'inside' } })
    expect(defaultProps.setAreaFilter).toHaveBeenCalledWith('inside')
  })

  it('opens photo preview modal when photo button is clicked', () => {
    render(<GPSDetailTable {...defaultProps} />)

    const photoBtn = screen.getByTitle('Lihat Foto Selfie Clock-In')
    fireEvent.click(photoBtn)

    expect(screen.getByText('Foto Selfie Kehadiran')).toBeInTheDocument()
    expect(screen.getByAltText('Ahmad Vet')).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders empty message when records list is empty', () => {
    render(<GPSDetailTable {...defaultProps} records={[]} />)

    expect(screen.getByText(/Tidak ada data absensi GPS yang cocok/i)).toBeInTheDocument()
  })
})
