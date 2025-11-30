import axiosClient from './axiosClient'

const adminApi = {
  // Get all users
  getUsers: async (params = {}) => {
    return await axiosClient.get('/admin/users', { params })
  },

  // Create new user
  createUser: async (data) => {
    return await axiosClient.post('/admin/users', data)
  },

  // Delete user
  deleteUser: async (userId) => {
    return await axiosClient.delete(`/admin/users/${userId}`)
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    return await axiosClient.put(`/admin/users/${userId}/role`, { role })
  },

  // Reset user password
  resetPassword: async (userId, password = null) => {
    const response = await axiosClient.post(`/admin/users/${userId}/reset-password`, { password })
    return { new_password: response.password || response.new_password }
  },

  // Get all classes (admin view)
  getAllClasses: async (params = {}) => {
    return await axiosClient.get('/admin/classes', { params })
  },

  // Create class with teacher assignment
  createClass: async (data) => {
    return await axiosClient.post('/admin/classes', data)
  },

  // Delete class
  deleteClass: async (classId) => {
    return await axiosClient.delete(`/admin/classes/${classId}`)
  },

  // Assign teacher to class
  assignTeacher: async (classId, teacherId) => {
    return await axiosClient.post(`/admin/classes/${classId}/assign-teacher`, {
      teacher_id: teacherId
    })
  },

  // Assign students to class
  assignStudents: async (classId, studentIds) => {
    return await axiosClient.post(`/admin/classes/${classId}/assign-students`, {
      student_ids: studentIds
    })
  },

  // Remove member from class
  removeMember: async (classId, userId) => {
    return await axiosClient.post(`/admin/classes/${classId}/remove-member`, {
      user_id: userId
    })
  },

  // Get admin statistics
  getStats: async () => {
    return await axiosClient.get('/admin/stats')
  }
}

export default adminApi
