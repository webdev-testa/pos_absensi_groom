import { describe, it, expect, beforeEach, vi } from 'vitest'
import { branchService, getCachedBranches, saveCachedBranches } from '../branchService'
import { DEFAULT_BRANCHES } from '@/constants/geofence.constants'

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    schema: () => ({
      from: () => ({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: new Error('Table not found') }),
        }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
}))

describe('branchService.ts - Hybrid Persistence & Branch CRUD', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getCachedBranches returns DEFAULT_BRANCHES when storage is empty or corrupted', () => {
    expect(getCachedBranches()).toEqual(DEFAULT_BRANCHES)

    // Corrupted JSON
    localStorage.setItem('dr_meow_branches_cache', '{invalid-json}')
    expect(getCachedBranches()).toEqual(DEFAULT_BRANCHES)

    // Empty array
    localStorage.setItem('dr_meow_branches_cache', '[]')
    expect(getCachedBranches()).toEqual(DEFAULT_BRANCHES)

    // Poisoned array with null, primitive, or invalid coordinates
    localStorage.setItem('dr_meow_branches_cache', JSON.stringify([null, 123, { id: 'bad-1', lat: 'invalid' }]))
    expect(getCachedBranches()).toEqual(DEFAULT_BRANCHES)
  })

  it('fetchBranches falls back to cached/default branches when database table is absent', async () => {
    const branches = await branchService.fetchBranches()
    expect(branches.length).toBeGreaterThanOrEqual(1)
    expect(branches[0].id).toBe(DEFAULT_BRANCHES[0].id)
  })

  it('createBranch generates a unique ID, clamps radius >= 10m, and persists to cache', async () => {
    const newBranch = await branchService.createBranch({
      name: 'Cabang Test Sukun',
      address: 'Jl. Sukun Raya',
      lat: -8.001,
      lng: 112.62,
      radius: 5, // Below 10 -> should be clamped to 10
      is_active: true,
    })

    expect(newBranch.id).toContain('cabang-test-sukun')
    expect(newBranch.radius).toBe(10) // Clamped

    const cached = getCachedBranches()
    expect(cached.some((b) => b.id === newBranch.id)).toBe(true)
  })

  it('updateBranch modifies existing branch in cache', async () => {
    const branch = await branchService.createBranch({
      name: 'Cabang Update',
      address: 'Jl. Lama',
      lat: -8.01,
      lng: 112.63,
      radius: 100,
      is_active: true,
    })

    const updated = await branchService.updateBranch(branch.id, {
      name: 'Cabang Update Baru',
      radius: 200,
    })

    expect(updated.name).toBe('Cabang Update Baru')
    expect(updated.radius).toBe(200)

    const cached = getCachedBranches()
    const found = cached.find((b) => b.id === branch.id)
    expect(found?.name).toBe('Cabang Update Baru')
  })

  it('deleteBranch prevents deleting the last remaining branch', async () => {
    // Reset cache to exactly 1 branch
    saveCachedBranches([DEFAULT_BRANCHES[0]])

    await expect(branchService.deleteBranch(DEFAULT_BRANCHES[0].id)).rejects.toThrow(
      'Tidak dapat menghapus cabang terakhir'
    )
  })

  it('deleteBranch successfully removes a branch when more than 1 exist', async () => {
    const extraBranch = await branchService.createBranch({
      name: 'Cabang Temporary',
      address: 'Jl. Temp',
      lat: -8.02,
      lng: 112.64,
      radius: 100,
      is_active: true,
    })

    expect(getCachedBranches().length).toBeGreaterThan(1)

    const success = await branchService.deleteBranch(extraBranch.id)
    expect(success).toBe(true)

    const cached = getCachedBranches()
    expect(cached.some((b) => b.id === extraBranch.id)).toBe(false)
  })
})
