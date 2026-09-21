import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GPSStats } from '../GPSStats'

describe('GPSStats.tsx - Component Tests', () => {
  it('renders all 4 stat cards with numbers and percentage badges', () => {
    const mockStats = {
      total: 10,
      withGps: 9,
      inside: 7,
      outside: 2,
      noGps: 1,
      insidePct: 70,
      outsidePct: 20,
    }

    render(<GPSStats stats={mockStats} />)

    expect(screen.getByText('Dalam Radius (≤ 100m)')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()

    expect(screen.getByText('Di Luar Radius (> 100m)')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()

    expect(screen.getByText('Total Terekam GPS')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('/ 10 staf')).toBeInTheDocument()

    expect(screen.getByText('Tanpa Koordinat GPS')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('handles 0 outside gracefully without showing 0% badge', () => {
    const mockStats = {
      total: 5,
      withGps: 5,
      inside: 5,
      outside: 0,
      noGps: 0,
      insidePct: 100,
      outsidePct: 0,
    }

    render(<GPSStats stats={mockStats} />)

    expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })
})
