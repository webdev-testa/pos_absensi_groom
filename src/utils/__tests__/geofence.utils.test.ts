import { describe, it, expect } from 'vitest'
import { 
  getDistance, 
  isWithinArea, 
  formatDistance, 
  formatCoordinates, 
  isValidCoordinate,
  getNearestBranch,
  evaluateLocationAgainstBranches,
} from '../geofence.utils'
import { OFFICE_LAT, OFFICE_LNG, GEOFENCE_RADIUS } from '@/constants/geofence.constants'

describe('src/utils/geofence.utils.ts - Geofence calculations', () => {
  it('validates coordinates correctly with isValidCoordinate', () => {
    expect(isValidCoordinate(-6.19026, 106.82391)).toBe(true)
    expect(isValidCoordinate("-6.19026", "106.82391")).toBe(true)
    expect(isValidCoordinate(null, 106.82391)).toBe(false)
    expect(isValidCoordinate(-6.19026, undefined)).toBe(false)
    expect(isValidCoordinate(NaN, 106.82391)).toBe(false)
    expect(isValidCoordinate(95, 106.82391)).toBe(false) // Lat > 90
    expect(isValidCoordinate(-6.19026, 185)).toBe(false) // Lng > 180
  })

  it('returns 0 distance when user coordinate is identical to office coordinate', () => {
    const dist = getDistance(OFFICE_LAT, OFFICE_LNG, OFFICE_LAT, OFFICE_LNG)
    expect(dist).toBeCloseTo(0, 1)
  })

  it('correctly identifies location within 100m radius', () => {
    // Offset ~30 meters north (1 deg lat ~ 111,000m -> 0.0003 deg ~ 33m)
    const nearbyLat = OFFICE_LAT + 0.0003
    const nearbyLng = OFFICE_LNG
    const dist = getDistance(nearbyLat, nearbyLng, OFFICE_LAT, OFFICE_LNG)
    expect(dist).toBeLessThan(100)
    expect(isWithinArea(nearbyLat, nearbyLng, OFFICE_LAT, OFFICE_LNG, GEOFENCE_RADIUS)).toBe(true)
  })

  it('correctly identifies location outside 100m radius', () => {
    // Offset ~1.1km north (0.01 deg lat)
    const farLat = OFFICE_LAT + 0.01
    const farLng = OFFICE_LNG
    const dist = getDistance(farLat, farLng, OFFICE_LAT, OFFICE_LNG)
    expect(dist).toBeGreaterThan(100)
    expect(isWithinArea(farLat, farLng, OFFICE_LAT, OFFICE_LNG, GEOFENCE_RADIUS)).toBe(false)
  })

  it('safely handles NaN, null, and non-finite numbers', () => {
    expect(getDistance(NaN, 106.82, OFFICE_LAT, OFFICE_LNG)).toBe(Infinity)
    expect(getDistance(OFFICE_LAT, OFFICE_LNG, Infinity, 106.82)).toBe(Infinity)
    expect(isWithinArea(NaN, 106.82, OFFICE_LAT, OFFICE_LNG)).toBe(false)
    expect(isWithinArea(OFFICE_LAT, OFFICE_LNG, NaN, NaN)).toBe(false)
  })

  it('formats distance correctly for meters and kilometers', () => {
    expect(formatDistance(45.2)).toBe('45 m')
    expect(formatDistance(1500)).toBe('1.50 km')
    expect(formatDistance(Infinity)).toBe('Tidak diketahui')
    expect(formatDistance(NaN)).toBe('Tidak diketahui')
  })

  it('formats coordinates correctly', () => {
    expect(formatCoordinates(-6.19026, 106.82391)).toBe('-6.19026, 106.82391')
    expect(formatCoordinates("-6.19026", "106.82391")).toBe('-6.19026, 106.82391')
    expect(formatCoordinates(null, null)).toBe('Tidak ada koordinat')
    expect(formatCoordinates(undefined, undefined)).toBe('Tidak ada koordinat')
  })

  describe('Multi-branch geofence evaluation', () => {
    const mockBranches = [
      {
        id: 'branch-malang-1',
        name: 'Dr. Meow Cabang Dinoyo',
        address: 'Jl. MT Haryono No. 1',
        lat: -7.9455,
        lng: 112.6105,
        radius: 100,
        is_active: true,
      },
      {
        id: 'branch-malang-2',
        name: 'Dr. Meow Cabang Sukun',
        address: 'Jl. S. Supriadi No. 2',
        lat: -8.0097,
        lng: 112.6106,
        radius: 150,
        is_active: true,
      },
      {
        id: 'branch-inactive',
        name: 'Dr. Meow Nonaktif',
        address: 'Tutup',
        lat: -8.0098,
        lng: 112.6107,
        radius: 100,
        is_active: false,
      },
    ]

    it('identifies nearest branch and distance accurately', () => {
      // User is right at branch-malang-2
      const result = getNearestBranch(-8.0097, 112.6106, mockBranches)
      expect(result.branch?.id).toBe('branch-malang-2')
      expect(result.distance).toBeCloseTo(0, 0)
      expect(result.isInside).toBe(true)
    })

    it('ignores inactive branches even if physically closer', () => {
      // User is right next to branch-inactive (-8.0098, 112.6107), but it is inactive
      const result = getNearestBranch(-8.0098, 112.6107, mockBranches)
      // Nearest ACTIVE branch must be branch-malang-2
      expect(result.branch?.id).toBe('branch-malang-2')
    })

    it('evaluates location against branches returning structured GeofenceEvaluation', () => {
      // 50m from branch-malang-1 (within 100m)
      const nearbyLat = -7.9455 + 0.0003
      const evaluation = evaluateLocationAgainstBranches(nearbyLat, 112.6105, mockBranches)
      expect(evaluation.nearestBranch?.id).toBe('branch-malang-1')
      expect(evaluation.isInsideGeofence).toBe(true)
      expect(evaluation.distanceMeters).toBeLessThan(100)
      expect(evaluation.distanceFormatted).toMatch(/m$/)
    })

    it('evaluates invalid or missing coordinates gracefully as Tanpa GPS', () => {
      const evaluation = evaluateLocationAgainstBranches(null, undefined, mockBranches)
      expect(evaluation.nearestBranch).toBeNull()
      expect(evaluation.distanceMeters).toBeNull()
      expect(evaluation.isInsideGeofence).toBeNull()
      expect(evaluation.distanceFormatted).toBe('Tanpa GPS')
    })

    it('reports Tidak ada cabang aktif when coordinates are valid but all branches are inactive', () => {
      const allInactiveBranches = [
        {
          id: 'b-off',
          name: 'Tutup',
          address: 'Tutup',
          lat: -8.0097,
          lng: 112.6106,
          radius: 100,
          is_active: false,
        },
      ]
      const evaluation = evaluateLocationAgainstBranches(-8.0097, 112.6106, allInactiveBranches)
      expect(evaluation.nearestBranch).toBeNull()
      expect(evaluation.isInsideGeofence).toBe(false)
      expect(evaluation.distanceFormatted).toBe('Tidak ada cabang aktif')
    })
  })
})
