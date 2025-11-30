import axiosClient from './axiosClient'

export const scheduleApi = {
  // Get all schedule events
  getSchedule: (params) => axiosClient.get('/schedule/', { params }),

  // Get today's schedule
  getTodaySchedule: () => axiosClient.get('/schedule/today'),

  // Get this week's schedule
  getWeekSchedule: () => axiosClient.get('/schedule/week'),

  // Get a specific event
  getEvent: (eventId) => axiosClient.get(`/schedule/${eventId}`),

  // Create a new event
  createEvent: (data) => axiosClient.post('/schedule/', data),

  // Update an event
  updateEvent: (eventId, data) => axiosClient.put(`/schedule/${eventId}`, data),

  // Delete an event
  deleteEvent: (eventId) => axiosClient.delete(`/schedule/${eventId}`),
}

export default scheduleApi
