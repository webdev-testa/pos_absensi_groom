import { describe, it, expect } from 'vitest'
import { cn, fmtCurrency, fmtDate } from '../utils'

describe('src/lib/utils.ts - Pure functions', () => {
  describe('cn (classNames merger)', () => {
    it('combines multiple class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
    })

    it('resolves conflicting tailwind classes with tailwind-merge', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    it('handles conditionals and falsy values', () => {
      expect(cn('btn', false && 'btn-active', null, undefined, 'btn-primary')).toBe('btn btn-primary')
    })
  })

  describe('fmtCurrency', () => {
    it('formats millions with jt suffix', () => {
      expect(fmtCurrency(1500000)).toBe('Rp 1.5jt')
      expect(fmtCurrency(2000000)).toBe('Rp 2jt')
    })

    it('formats thousands with k suffix', () => {
      expect(fmtCurrency(50000)).toBe('Rp 50k')
      expect(fmtCurrency(65000)).toBe('Rp 65k')
    })

    it('formats smaller values directly', () => {
      expect(fmtCurrency(500)).toBe('Rp 500')
      expect(fmtCurrency(0)).toBe('Rp 0')
    })
  })

  describe('fmtDate', () => {
    it('formats a valid ISO string', () => {
      const res = fmtDate('2026-05-15T10:00:00.000Z')
      expect(res).toBeTruthy()
      expect(typeof res).toBe('string')
    })

    it('returns the input fallback if invalid date string passed', () => {
      expect(fmtDate('not-a-valid-date')).toBe('Invalid Date')
    })
  })
})
