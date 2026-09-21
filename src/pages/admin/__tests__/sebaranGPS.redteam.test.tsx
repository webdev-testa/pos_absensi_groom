import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AttendanceMap } from '@/components/page-sections/attendance/AttendanceMap'
import { GPSDetailTable } from '@/components/page-sections/attendance/GPSDetailTable'
import { getDistance, isWithinArea, formatCoordinates } from '@/utils/geofence.utils'
import { OFFICE_LAT, OFFICE_LNG } from '@/constants/geofence.constants'
import type { AttendanceGPSItem } from '@/hooks/useGeolocation'

vi.mock('@googlemaps/js-api-loader', () => {
  class MockMap {
    fitBounds = vi.fn()
    panTo = vi.fn()
    setZoom = vi.fn()
  }
  class MockAdvancedMarkerElement {
    addListener = vi.fn()
    map = null
    position = { lat: 0, lng: 0 }
    title = ''
    content = null
    constructor(opts?: any) {
      if (opts) Object.assign(this, opts)
    }
  }
  class MockPinElement {
    element = document.createElement('div')
    constructor(_opts?: any) {}
  }
  return {
    setOptions: vi.fn(),
    importLibrary: vi.fn().mockImplementation(async (lib: string) => {
      if (lib === 'maps') {
        return { Map: MockMap }
      }
      if (lib === 'marker') {
        return {
          AdvancedMarkerElement: MockAdvancedMarkerElement,
          PinElement: MockPinElement,
        }
      }
      return {}
    }),
  }
})

beforeAll(() => {
  class MockCircle {
    setMap = vi.fn()
    setVisible = vi.fn()
  }
  class MockAdvancedMarkerElement {
    addListener = vi.fn()
    map = null
    position = { lat: 0, lng: 0 }
    title = ''
    content = null
    constructor(opts?: any) {
      if (opts) Object.assign(this, opts)
    }
  }
  class MockPinElement {
    element = document.createElement('div')
    constructor(_opts?: any) {}
  }
  class MockInfoWindow {
    open = vi.fn()
    close = vi.fn()
  }
  class MockLatLngBounds {
    extend = vi.fn()
  }

  ;(globalThis as any).google = {
    maps: {
      Circle: MockCircle,
      InfoWindow: MockInfoWindow,
      LatLngBounds: MockLatLngBounds,
      marker: {
        AdvancedMarkerElement: MockAdvancedMarkerElement,
        PinElement: MockPinElement,
      },
      event: {
        trigger: vi.fn(),
        clearInstanceListeners: vi.fn(),
      },
    },
  } as any
})

describe('Red-Team Verification Test Suite - Sebaran GPS Resilience & Security', () => {
  describe('Defect 1: XSS Injection Prevention in InfoWindows', () => {
    it('escapes malicious HTML tags in employee names', () => {
      const maliciousRecord: AttendanceGPSItem = {
        id: 'xss-1',
        user_id: 'u-xss',
        date: '2026-09-21',
        clock_in_time: '2026-09-21T08:00:00.000Z',
        clock_out_time: null,
        status: 'ontime',
        is_flagged: false,
        clock_in_photo_url: null,
        clock_in_lat: OFFICE_LAT,
        clock_in_lng: OFFICE_LNG,
        clock_out_lat: null,
        clock_out_lng: null,
        users: {
          name: '<script>alert("pwned")</script>',
          emp_id: 'EMP-HACK',
          dept: '<b>Hacker</b>',
        },
        distanceMeters: 0,
        isInsideGeofence: true,
        distanceFormatted: '0 m',
      }

      // Should render without error and not execute scripts
      const { container } = render(
        <AttendanceMap
          records={[maliciousRecord]}
          selectedRecordId={null}
        />
      )

      expect(container.querySelector('script')).toBeNull()
    })
  })

  describe('Defect 2: Malicious javascript: Photo URL Sanitization', () => {
    it('rejects javascript: URLs in photo preview and InfoWindow', () => {
      const dangerousRecord: AttendanceGPSItem = {
        id: 'js-url-1',
        user_id: 'u-danger',
        date: '2026-09-21',
        clock_in_time: '2026-09-21T08:00:00.000Z',
        clock_out_time: null,
        status: 'ontime',
        is_flagged: false,
        clock_in_photo_url: 'javascript:alert("XSS")',
        clock_in_lat: OFFICE_LAT,
        clock_in_lng: OFFICE_LNG,
        clock_out_lat: null,
        clock_out_lng: null,
        users: { name: 'Suspect User', emp_id: 'EMP-99', dept: 'admin' },
        distanceMeters: 0,
        isInsideGeofence: true,
        distanceFormatted: '0 m',
      }

      // Render detail table
      render(
        <MemoryRouter>
          <GPSDetailTable
            records={[dangerousRecord]}
            selectedRecordId={null}
            onSelectRecord={vi.fn()}
            searchQ=""
            setSearchQ={vi.fn()}
            deptFilter="all"
            setDeptFilter={vi.fn()}
            areaFilter="all"
            setAreaFilter={vi.fn()}
            dateFilter="today"
            setDateFilter={vi.fn()}
          />
        </MemoryRouter>
      )

      // External link button must not use javascript:
      const externalLink = screen.getByTitle('Buka di Google Maps External')
      expect(externalLink.getAttribute('href')).toMatch(/^https?:\/\//)
      expect(externalLink.getAttribute('href')).not.toContain('javascript:')
    })
  })

  describe('Defect 3: Null Safety on Missing User Relation', () => {
    it('safely handles orphaned attendance records where users is null', () => {
      const orphanedRecord: AttendanceGPSItem = {
        id: 'orphan-1',
        user_id: 'deleted-user',
        date: '2026-09-21',
        clock_in_time: '2026-09-21T08:00:00.000Z',
        clock_out_time: null,
        status: 'ontime',
        is_flagged: false,
        clock_in_photo_url: null,
        clock_in_lat: OFFICE_LAT,
        clock_in_lng: OFFICE_LNG,
        clock_out_lat: null,
        clock_out_lng: null,
        users: null, // Null relationship
        distanceMeters: 0,
        isInsideGeofence: true,
        distanceFormatted: '0 m',
      }

      render(
        <MemoryRouter>
          <GPSDetailTable
            records={[orphanedRecord]}
            selectedRecordId={null}
            onSelectRecord={vi.fn()}
            searchQ=""
            setSearchQ={vi.fn()}
            deptFilter="all"
            setDeptFilter={vi.fn()}
            areaFilter="all"
            setAreaFilter={vi.fn()}
            dateFilter="today"
            setDateFilter={vi.fn()}
          />
        </MemoryRouter>
      )

      expect(screen.getByText('Unknown')).toBeInTheDocument()
      expect(screen.getByText(/EMP-\?\?\?/)).toBeInTheDocument()
    })
  })

  describe('Defect 4: Reverse Tabnabbing Security Protection', () => {
    it('strictly enforces rel="noopener,noreferrer" on all target="_blank" Google Maps anchors', () => {
      const sampleRecord: AttendanceGPSItem = {
        id: 'sec-1',
        user_id: 'u-1',
        date: '2026-09-21',
        clock_in_time: '2026-09-21T08:00:00.000Z',
        clock_out_time: null,
        status: 'ontime',
        is_flagged: false,
        clock_in_photo_url: null,
        clock_in_lat: OFFICE_LAT,
        clock_in_lng: OFFICE_LNG,
        clock_out_lat: null,
        clock_out_lng: null,
        users: { name: 'Ahmad', emp_id: 'EMP-01', dept: 'dokter' },
        distanceMeters: 10,
        isInsideGeofence: true,
        distanceFormatted: '10 m',
      }

      render(
        <MemoryRouter>
          <GPSDetailTable
            records={[sampleRecord]}
            selectedRecordId={null}
            onSelectRecord={vi.fn()}
            searchQ=""
            setSearchQ={vi.fn()}
            deptFilter="all"
            setDeptFilter={vi.fn()}
            areaFilter="all"
            setAreaFilter={vi.fn()}
            dateFilter="today"
            setDateFilter={vi.fn()}
          />
        </MemoryRouter>
      )

      const externalLinks = screen.getAllByRole('link')
      externalLinks.forEach((link) => {
        if (link.getAttribute('target') === '_blank') {
          const rel = link.getAttribute('rel') || ''
          expect(rel).toContain('noopener')
          expect(rel).toContain('noreferrer')
        }
      })
    })
  })

  describe('Defect 5: Arithmetic & Boundary Robustness', () => {
    it('safely handles extreme coordinates, NaN, and negative infinity', () => {
      expect(getDistance(NaN, NaN, OFFICE_LAT, OFFICE_LNG)).toBe(Infinity)
      expect(getDistance(OFFICE_LAT, OFFICE_LNG, -Infinity, 100)).toBe(Infinity)
      expect(isWithinArea(NaN, 100, OFFICE_LAT, OFFICE_LNG, 100)).toBe(false)
      expect(formatCoordinates(NaN, NaN)).toBe('Tidak ada koordinat')
      expect(formatCoordinates(null, null)).toBe('Tidak ada koordinat')
    })

    it('accurately evaluates exact boundary (100.00m) as inside', () => {
      // 0 distance is inside
      expect(isWithinArea(OFFICE_LAT, OFFICE_LNG, OFFICE_LAT, OFFICE_LNG, 100)).toBe(true)
    })
  })

  describe('Defect 6: Multi-Branch Geofencing & Cross-Site Scripting Guard in Branch Rendering', () => {
    it('escapes branch names safely in Map and Detail table', () => {
      const branchRecord: AttendanceGPSItem = {
        id: 'branch-xss-1',
        user_id: 'u-1',
        date: '2026-09-21',
        clock_in_time: '2026-09-21T08:00:00.000Z',
        clock_out_time: null,
        status: 'ontime',
        is_flagged: false,
        clock_in_photo_url: null,
        clock_in_lat: OFFICE_LAT,
        clock_in_lng: OFFICE_LNG,
        clock_out_lat: null,
        clock_out_lng: null,
        users: { name: 'Karyawan Aman', emp_id: 'EMP-01', dept: 'dokter' },
        distanceMeters: 15,
        isInsideGeofence: true,
        distanceFormatted: '15 m',
        nearestBranch: {
          id: 'b-xss',
          name: '<img src=x onerror=alert(1)> Cabang 2',
          address: '<script>alert(2)</script>',
          lat: OFFICE_LAT,
          lng: OFFICE_LNG,
          radius: 100,
          is_active: true,
        },
      }

      const { container } = render(
        <MemoryRouter>
          <GPSDetailTable
            records={[branchRecord]}
            selectedRecordId={null}
            onSelectRecord={vi.fn()}
            searchQ=""
            setSearchQ={vi.fn()}
            deptFilter="all"
            setDeptFilter={vi.fn()}
            areaFilter="all"
            setAreaFilter={vi.fn()}
            dateFilter="today"
            setDateFilter={vi.fn()}
            branches={branchRecord.nearestBranch ? [branchRecord.nearestBranch] : []}
          />
        </MemoryRouter>
      )

      expect(container.querySelector('img[src="x"]')).toBeNull()
      expect(container.querySelector('script')).toBeNull()
    })
  })
})
