import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'
import type { User } from '@/types'

describe('src/stores/authStore.ts - Zustand Store', () => {
  // Use useAuthStore.setState() for test isolation as required by project conventions
  beforeEach(() => {
    useAuthStore.setState({ user: null, loading: false })
  })

  it('initializes with default empty state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.loading).toBe(false)
  })

  it('updates user state when setUser action is called', () => {
    const mockUser: User = {
      id: 'user-123',
      name: 'Budi Groomer',
      emp_id: 'EMP-001',
      role: 'employee',
      email: 'budi@drmeow.com',
      phone: null,
      address: null,
      dept: 'Salon',
      jabatan: 'Groomer',
      salary: null,
      shift: null,
      kasbon_limit: null,
      status: 'active',
      joined: null,
      created_at: new Date().toISOString(),
    }

    useAuthStore.getState().setUser(mockUser)

    expect(useAuthStore.getState().user).toEqual(mockUser)
    expect(useAuthStore.getState().user?.name).toBe('Budi Groomer')
  })

  it('updates loading state when setLoading is called', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().loading).toBe(true)

    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('isolates state across tests using useAuthStore.setState()', () => {
    // Manually set state to test isolation pattern
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        name: 'Dr. Meow Admin',
        emp_id: 'ADM-001',
        role: 'admin',
        email: 'admin@drmeow.com',
        phone: null,
        address: null,
        dept: 'Management',
        jabatan: 'Admin',
        salary: null,
        shift: null,
        kasbon_limit: null,
        status: 'active',
        joined: null,
        created_at: new Date().toISOString(),
      },
      loading: false,
    })

    expect(useAuthStore.getState().user?.role).toBe('admin')

    // Reset action
    useAuthStore.getState().reset()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().loading).toBe(false)
  })
})
