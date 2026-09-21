import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SebaranGPS from '../sebaranGPS'
import { OFFICE_LAT, OFFICE_LNG } from '@/constants/geofence.constants'

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

// Setup global google object before tests
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

const mockRecords = [
  {
    id: 'att-1',
    user_id: 'u-1',
    date: '2026-09-21',
    clock_in_time: '2026-09-21T08:05:00.000Z',
    clock_out_time: null,
    status: 'ontime',
    is_flagged: false,
    clock_in_photo_url: 'https://example.com/photo1.jpg',
    clock_in_lat: OFFICE_LAT + 0.0002, // ~22m away
    clock_in_lng: OFFICE_LNG,
    clock_out_lat: null,
    clock_out_lng: null,
    users: { name: 'Dr. Siti', emp_id: 'EMP-001', dept: 'dokter' },
    distanceMeters: 22,
    isInsideGeofence: true,
    distanceFormatted: '22 m',
  },
  {
    id: 'att-2',
    user_id: 'u-2',
    date: '2026-09-21',
    clock_in_time: '2026-09-21T08:20:00.000Z',
    clock_out_time: null,
    status: 'late',
    is_flagged: false,
    clock_in_photo_url: null,
    clock_in_lat: OFFICE_LAT + 0.005, // ~550m away
    clock_in_lng: OFFICE_LNG,
    clock_out_lat: null,
    clock_out_lng: null,
    users: { name: 'Budi Groomer', emp_id: 'EMP-002', dept: 'groomer' },
    distanceMeters: 550,
    isInsideGeofence: false,
    distanceFormatted: '550 m',
  },
]

const mockUseGeolocation = {
  loading: false,
  error: null,
  refresh: vi.fn(),
  records: mockRecords,
  plottableRecords: mockRecords,
  stats: {
    total: 2,
    withGps: 2,
    inside: 1,
    outside: 1,
    noGps: 0,
    insidePct: 50,
    outsidePct: 50,
  },
  dateFilter: 'today',
  setDateFilter: vi.fn(),
  deptFilter: 'all',
  setDeptFilter: vi.fn(),
  areaFilter: 'all',
  setAreaFilter: vi.fn(),
  searchQ: '',
  setSearchQ: vi.fn(),
  selectedRecordId: null,
  setSelectedRecordId: vi.fn(),
}

vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => mockUseGeolocation,
}))

describe('sebaranGPS.tsx - Admin Geolocation Page Tests', () => {
  it('renders page header, office geofence banner, and key sections', () => {
    render(
      <MemoryRouter>
        <SebaranGPS />
      </MemoryRouter>
    )

    expect(screen.getByText('Sebaran Geolokasi GPS Staf')).toBeInTheDocument()
    expect(screen.getByText(/Radius Geofence: 100m/i)).toBeInTheDocument()
    expect(screen.getByText(/Visualisasi Peta Interaktif/i)).toBeInTheDocument()
    expect(screen.getByText(/Detail Audit Verifikasi GPS/i)).toBeInTheDocument()
  })

  it('displays outside area alert banner when outside records exist', () => {
    render(
      <MemoryRouter>
        <SebaranGPS />
      </MemoryRouter>
    )

    expect(screen.getByText(/Perhatian: Terdeteksi 1 absensi di luar radius kantor/i)).toBeInTheDocument()
  })

  it('renders employee records in table with distance and compliance badges', () => {
    render(
      <MemoryRouter>
        <SebaranGPS />
      </MemoryRouter>
    )

    expect(screen.getByText('Dr. Siti')).toBeInTheDocument()
    expect(screen.getByText('Budi Groomer')).toBeInTheDocument()
    expect(screen.getByText(/Dalam Radius \(22 m\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Di Luar Radius \(550 m\)/i)).toBeInTheDocument()
  })

  it('triggers refresh when Perbarui Data button is clicked', () => {
    render(
      <MemoryRouter>
        <SebaranGPS />
      </MemoryRouter>
    )

    const refreshBtn = screen.getByRole('button', { name: /Perbarui Data/i })
    fireEvent.click(refreshBtn)
    expect(mockUseGeolocation.refresh).toHaveBeenCalled()
  })

  it('triggers selection when Fokus di Peta button is clicked', () => {
    render(
      <MemoryRouter>
        <SebaranGPS />
      </MemoryRouter>
    )

    const focusBtns = screen.getAllByRole('button', { name: /Fokus di Peta/i })
    fireEvent.click(focusBtns[0])
    expect(mockUseGeolocation.setSelectedRecordId).toHaveBeenCalledWith('att-1')
  })

  it('ensures external Google Maps links include noopener and noreferrer', () => {
    render(
      <MemoryRouter>
        <SebaranGPS />
      </MemoryRouter>
    )

    const externalLinks = screen.getAllByTitle('Buka di Google Maps External')
    externalLinks.forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
      expect(link.getAttribute('rel')).toContain('noreferrer')
    })
  })
})
