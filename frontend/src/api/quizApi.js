import axiosClient from "./axiosClient";

const quizApi = {
  // Get all quizzes for a class
  getByClass: (classId) => {
    return axiosClient.get(`/quizzes/class/${classId}`);
  },

  // Create a new quiz
  create: (classId, data) => {
    return axiosClient.post(`/quizzes/class/${classId}`, data);
  },

  // Get quiz details
  getById: (quizId) => {
    return axiosClient.get(`/quizzes/${quizId}`);
  },

  // Update quiz
  update: (quizId, data) => {
    return axiosClient.put(`/quizzes/${quizId}`, data);
  },

  // Delete quiz
  delete: (quizId) => {
    return axiosClient.delete(`/quizzes/${quizId}`);
  },

  // Submit quiz answers
  submit: (quizId, answers) => {
    return axiosClient.post(`/quizzes/${quizId}/submit`, { answers });
  },

  // Get quiz results (teacher only)
  getResults: (quizId) => {
    return axiosClient.get(`/quizzes/${quizId}/results`);
  },
};

export default quizApi;
