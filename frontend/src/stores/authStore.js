import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosClient from '@/api/axiosClient'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }))
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      // Login method
      login: async (email, password) => {
        const response = await axiosClient.post('/auth/login', { email, password })
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false
        })
        return response
      },

      // Load profile from server
      loadProfile: async () => {
        try {
          const response = await axiosClient.get('/auth/profile')
          set((state) => ({
            user: { ...state.user, ...response },
            isLoading: false
          }))
          return response
        } catch (error) {
          console.error('Failed to load profile:', error)
          return null
        }
      },

      // Update profile
      updateProfile: async (data) => {
        const response = await axiosClient.put('/auth/profile', data)
        set((state) => ({
          user: { ...state.user, ...response }
        }))
        return response
      },

      // Check if user has a specific role
      hasRole: (role) => {
        const user = get().user
        return user?.role === role
      },

      // Check if user is admin
      isAdmin: () => {
        const user = get().user
        return user?.role === 'admin'
      },

      // Check if user is teacher
      isTeacher: () => {
        const user = get().user
        return user?.role === 'teacher' || user?.role === 'admin'
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export { useAuthStore }
export default useAuthStore
