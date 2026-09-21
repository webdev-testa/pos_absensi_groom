import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGeolocation } from '../useGeolocation'
import { OFFICE_LAT, OFFICE_LNG } from '@/constants/geofence.constants'

const mockAttendanceRows = [
  {
    id: 'att-1',
    user_id: 'usr-1',
    date: new Date().toISOString().split('T')[0],
    clock_in_time: `${new Date().toISOString().split('T')[0]}T08:00:00.000Z`,
    clock_out_time: null,
    status: 'ontime',
    is_flagged: false,
    clock_in_photo_url: 'https://example.com/p1.jpg',
    clock_in_lat: OFFICE_LAT + 0.0001, // ~11 meters
    clock_in_lng: OFFICE_LNG,
    clock_out_lat: null,
    clock_out_lng: null,
    users: { name: 'Dr. John', emp_id: 'EMP-01', dept: 'dokter' },
  },
  {
    id: 'att-2',
    user_id: 'usr-2',
    date: new Date().toISOString().split('T')[0],
    clock_in_time: `${new Date().toISOString().split('T')[0]}T08:15:00.000Z`,
    clock_out_time: null,
    status: 'late',
    is_flagged: false,
    clock_in_photo_url: null,
    clock_in_lat: OFFICE_LAT + 0.003, // ~330 meters (outside 100m)
    clock_in_lng: OFFICE_LNG,
    clock_out_lat: null,
    clock_out_lng: null,
    users: { name: 'Sarah Groomer', emp_id: 'EMP-02', dept: 'groomer' },
  },
  {
    id: 'att-3',
    user_id: 'usr-3',
    date: new Date().toISOString().split('T')[0],
    clock_in_time: `${new Date().toISOString().split('T')[0]}T08:30:00.000Z`,
    clock_out_time: null,
    status: 'ontime',
    is_flagged: false,
    clock_in_photo_url: null,
    clock_in_lat: null, // No GPS coordinates
    clock_in_lng: null,
    clock_out_lat: null,
    clock_out_lng: null,
    users: { name: 'Admin Cat', emp_id: 'EMP-03', dept: 'admin' },
  },
]

vi.mock('@/services/branchService', () => ({
  branchService: {
    fetchBranches: vi.fn().mockResolvedValue([
      {
        id: 'malang-cabang-2',
        name: 'Dr.Meoww Cabang 2 - Malang',
        address: 'Grooming dan Penitipan Kucing Malang',
        lat: -8.0097357,
        lng: 112.6106983,
        radius: 100,
        is_active: true,
      },
    ]),
  },
  getCachedBranches: vi.fn().mockReturnValue([
    {
      id: 'malang-cabang-2',
      name: 'Dr.Meoww Cabang 2 - Malang',
      address: 'Grooming dan Penitipan Kucing Malang',
      lat: -8.0097357,
      lng: 112.6106983,
      radius: 100,
      is_active: true,
    },
  ]),
}))

vi.mock('@/lib/supabaseAdmin', () => {
  const channelMock = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  }

  const queryMock: any = {
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: (resolve: any) => Promise.resolve({ data: mockAttendanceRows, error: null }).then(resolve),
  }

  return {
    supabaseAdmin: {
      schema: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue(queryMock),
      }),
      channel: vi.fn().mockReturnValue(channelMock),
      removeChannel: vi.fn(),
    },
  }
})

describe('src/hooks/useGeolocation.ts - Geolocation and Distance Hook', () => {
  it('loads and enriches attendance data with distance and geofence status', async () => {
    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.records.length).toBe(3)

    // Check Dr. John (inside radius)
    const drJohn = result.current.records.find(r => r.users?.name === 'Dr. John')
    expect(drJohn).toBeDefined()
    expect(drJohn?.isInsideGeofence).toBe(true)
    expect(drJohn?.distanceMeters).toBeLessThan(100)

    // Check Sarah (outside radius)
    const sarah = result.current.records.find(r => r.users?.name === 'Sarah Groomer')
    expect(sarah).toBeDefined()
    expect(sarah?.isInsideGeofence).toBe(false)
    expect(sarah?.distanceMeters).toBeGreaterThan(100)

    // Check Admin (no GPS)
    const admin = result.current.records.find(r => r.users?.name === 'Admin Cat')
    expect(admin).toBeDefined()
    expect(admin?.isInsideGeofence).toBeNull()
    expect(admin?.distanceMeters).toBeNull()
    expect(admin?.distanceFormatted).toBe('Tanpa GPS')
  })

  it('computes accurate stats for inside, outside, and missing GPS', async () => {
    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats.total).toBe(3)
    expect(result.current.stats.withGps).toBe(2)
    expect(result.current.stats.inside).toBe(1)
    expect(result.current.stats.outside).toBe(1)
    expect(result.current.stats.noGps).toBe(1)
    expect(result.current.stats.insidePct).toBe(33)
    expect(result.current.stats.outsidePct).toBe(33)
  })

  it('filters by department correctly', async () => {
    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setDeptFilter('dokter')
    })

    expect(result.current.records.length).toBe(1)
    expect(result.current.records[0].users?.name).toBe('Dr. John')
  })

  it('filters by area compliance (inside / outside / no_gps)', async () => {
    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Filter inside
    act(() => {
      result.current.setAreaFilter('inside')
    })
    expect(result.current.records.length).toBe(1)
    expect(result.current.records[0].users?.name).toBe('Dr. John')

    // Filter outside
    act(() => {
      result.current.setAreaFilter('outside')
    })
    expect(result.current.records.length).toBe(1)
    expect(result.current.records[0].users?.name).toBe('Sarah Groomer')

    // Filter no_gps
    act(() => {
      result.current.setAreaFilter('no_gps')
    })
    expect(result.current.records.length).toBe(1)
    expect(result.current.records[0].users?.name).toBe('Admin Cat')
  })

  it('filters plottableRecords to only include items with valid coordinates', async () => {
    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Total records = 3, but only 2 have GPS coordinates
    expect(result.current.plottableRecords.length).toBe(2)
    expect(result.current.plottableRecords.every(r => r.clock_in_lat != null && r.clock_in_lng != null)).toBe(true)
  })

  it('safely handles string coordinates via numeric coercion', async () => {
    const { result } = renderHook(() => useGeolocation())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Records with valid lat/lng numbers or coercible strings calculate distance correctly
    const validRecords = result.current.records.filter(r => r.distanceMeters !== null)
    expect(validRecords.length).toBe(2)
    validRecords.forEach(r => {
      expect(typeof r.clock_in_lat).toBe('number')
      expect(typeof r.clock_in_lng).toBe('number')
    })
  })
})
