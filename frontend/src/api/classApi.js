import axiosClient from './axiosClient'

export const classApi = {
  // Get all classes for current user
  getClasses: () => axiosClient.get('/classes/'),

  // Get a specific class by ID
  getClass: (classId) => axiosClient.get(`/classes/${classId}`),

  // Update a class (teacher only)
  updateClass: (classId, data) => axiosClient.put(`/classes/${classId}`, data),

  // Get class members
  getClassMembers: (classId) => axiosClient.get(`/classes/${classId}/members`),
}

export default classApi
