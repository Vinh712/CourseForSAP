import axiosClient from './axiosClient'

export const courseApi = {
  // Get all courses for a class
  getClassCourses: (classId) => axiosClient.get(`/courses/class/${classId}`),

  // Get a specific course
  getCourse: (courseId) => axiosClient.get(`/courses/${courseId}`),

  // Create a new course
  createCourse: (classId, data) => axiosClient.post(`/courses/class/${classId}`, data),

  // Update a course
  updateCourse: (courseId, data) => axiosClient.put(`/courses/${courseId}`, data),

  // Delete a course
  deleteCourse: (courseId) => axiosClient.delete(`/courses/${courseId}`),

  // Add a module to a course
  addModule: (courseId, data) => axiosClient.post(`/courses/${courseId}/modules`, data),

  // Update a module
  updateModule: (courseId, moduleId, data) => 
    axiosClient.put(`/courses/${courseId}/modules/${moduleId}`, data),

  // Delete a module
  deleteModule: (courseId, moduleId) => 
    axiosClient.delete(`/courses/${courseId}/modules/${moduleId}`),
}

export default courseApi
