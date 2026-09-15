import { create } from 'zustand'
import type { User } from '@/types'

export interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  user: null,
  loading: false,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  reset: () => set(initialState),
}))
