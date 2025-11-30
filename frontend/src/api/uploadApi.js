import axiosClient from './axiosClient'

export const uploadApi = {
  // Upload any file (auto-detect type)
  uploadFile: async (file, folder = 'files') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return axiosClient.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Upload an image
  uploadImage: async (file, folder = 'images') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return axiosClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Upload a video
  uploadVideo: async (file, folder = 'videos') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return axiosClient.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Upload a document
  uploadDocument: async (file, folder = 'documents') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return axiosClient.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosClient.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Delete a file
  deleteFile: (publicId) => axiosClient.delete(`/upload/${publicId}`),

  // Get my files
  getMyFiles: (params) => axiosClient.get('/upload/my-files', { params }),
}

export default uploadApi
