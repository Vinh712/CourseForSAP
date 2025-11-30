import { create } from 'zustand'
import { classApi } from '@/api/classApi'

export const useClassStore = create((set, get) => ({
  classes: [],
  currentClass: null,
  isLoading: false,
  error: null,

  // Fetch all classes
  fetchClasses: async () => {
    set({ isLoading: true, error: null })
    try {
      const classes = await classApi.getClasses()
      set({ classes, isLoading: false })
      return classes
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Fetch single class
  fetchClass: async (classId) => {
    set({ isLoading: true, error: null })
    try {
      const classData = await classApi.getClass(classId)
      set({ currentClass: classData, isLoading: false })
      return classData
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Update class (teacher only)
  updateClass: async (classId, data) => {
    set({ isLoading: true, error: null })
    try {
      const updatedClass = await classApi.updateClass(classId, data)
      set(state => ({
        classes: state.classes.map(c => c._id === classId ? updatedClass : c),
        currentClass: state.currentClass?._id === classId ? updatedClass : state.currentClass,
        isLoading: false
      }))
      return updatedClass
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Clear current class
  clearCurrentClass: () => set({ currentClass: null }),

  // Clear error
  clearError: () => set({ error: null }),
}))

export default useClassStore
