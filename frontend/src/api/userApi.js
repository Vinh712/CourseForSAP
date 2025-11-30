import axiosClient from './axiosClient'

export const userApi = {
  // Get current user's profile
  getProfile: () => axiosClient.get('/auth/profile'),

  // Update profile
  updateProfile: (data) => axiosClient.put('/auth/profile', data),

  // Sync profile after login
  syncProfile: (data) => axiosClient.post('/auth/profile/sync', data),
}

export default userApi
