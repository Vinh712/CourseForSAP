/**
 * Problem Management API - Coding problems with AI grading
 */

import axiosClient from './axiosClient'

const problemApi = {
  // ==================== PROBLEMS ====================
  
  /**
   * Get all problems
   * Admin sees all, students see only published
   */
  getProblems: () => {
    return axiosClient.get('/problems/')
  },

  /**
   * Get a specific problem by ID
   */
  getProblem: (problemId) => {
    return axiosClient.get(`/problems/${problemId}`)
  },

  /**
   * Create a new problem (Admin only)
   * @param {Object} data - {title, description, grading_criteria, max_score, difficulty, tags, is_published}
   */
  createProblem: (data) => {
    return axiosClient.post('/problems/', data)
  },

  /**
   * Update a problem (Admin only)
   */
  updateProblem: (problemId, data) => {
    return axiosClient.put(`/problems/${problemId}`, data)
  },

  /**
   * Delete a problem (Admin only)
   */
  deleteProblem: (problemId) => {
    return axiosClient.delete(`/problems/${problemId}`)
  },

  // ==================== SUBMISSIONS ====================

  /**
   * Submit a solution to a problem
   * @param {string} problemId - Problem ID
   * @param {Object} data - {submission_text, language}
   */
  submitProblem: (problemId, data) => {
    return axiosClient.post(`/problems/${problemId}/submit`, data)
  },

  /**
   * Get a specific submission by ID
   */
  getSubmission: (submissionId) => {
    return axiosClient.get(`/problems/submissions/${submissionId}`)
  },

  /**
   * Get all submissions for a problem (Admin only)
   */
  getProblemSubmissions: (problemId) => {
    return axiosClient.get(`/problems/${problemId}/submissions`)
  },

  /**
   * Get current user's submissions
   */
  getMySubmissions: () => {
    return axiosClient.get('/problems/my-submissions')
  }
}

export default problemApi
