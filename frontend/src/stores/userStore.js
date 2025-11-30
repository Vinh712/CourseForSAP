import { create } from 'zustand'
import { userApi } from '@/api/userApi'

export const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  // Fetch profile
  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const user = await userApi.getProfile()
      set({ user, isLoading: false })
      return user
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const user = await userApi.updateProfile(data)
      set({ user, isLoading: false })
      return user
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Sync profile (after Clerk login)
  syncProfile: async (data) => {
    try {
      const user = await userApi.syncProfile(data)
      set({ user })
      return user
    } catch (error) {
      console.error('Failed to sync profile:', error)
      throw error
    }
  },

  // Clear user
  clearUser: () => set({ user: null, error: null }),
}))

export default useUserStore
