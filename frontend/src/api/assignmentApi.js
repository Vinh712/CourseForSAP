import axiosClient from './axiosClient'

export const assignmentApi = {
  // Get all assignments for a class
  getClassAssignments: (classId) => axiosClient.get(`/assignments/class/${classId}`),

  // Get upcoming assignments across all classes
  getUpcomingAssignments: () => axiosClient.get('/assignments/upcoming'),

  // Get a specific assignment
  getAssignment: (assignmentId) => axiosClient.get(`/assignments/${assignmentId}`),

  // Create a new assignment
  createAssignment: (classId, data) => axiosClient.post(`/assignments/class/${classId}`, data),

  // Update an assignment
  updateAssignment: (assignmentId, data) => axiosClient.put(`/assignments/${assignmentId}`, data),

  // Delete an assignment
  deleteAssignment: (assignmentId) => axiosClient.delete(`/assignments/${assignmentId}`),

  // Submit an assignment
  submitAssignment: (assignmentId, data) => axiosClient.post(`/assignments/${assignmentId}/submit`, data),

  // Grade a submission
  gradeSubmission: (assignmentId, submissionId, data) => 
    axiosClient.post(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data),
}

export default assignmentApi
