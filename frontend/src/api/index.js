import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login    = (data) => api.post('/auth/login', data)
export const getMe    = ()     => api.get('/auth/me')

// Sessions
export const startSession   = ()   => api.post('/sessions/start')
export const endSession     = (id) => api.put(`/sessions/${id}/end`)
export const getSessions    = ()   => api.get('/sessions')
export const getSessionById = (id) => api.get(`/sessions/${id}`)
export const getReport      = ()   => api.get('/sessions/report')

// Speech
export const correctText    = (data) => api.post('/speech/correct-text', data)
export const getTranscripts = (id)   => api.get(`/speech/transcripts/${id}`)

// Expression
export const analyzeExpression = (formData) =>
  api.post('/expression/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

// Session real-time functions
export const analyzeFrame = async (sessionId, videoElement) => {
  if (!videoElement) return null

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 640
    canvas.height = 480
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(null)
        return
      }

      const formData = new FormData()
      formData.append('image', blob, 'frame.jpg')
      formData.append('sessionId', sessionId)

      try {
        const response = await api.post('/expression/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        resolve(response.data)
      } catch (error) {
        console.error('Frame analysis error:', error)
        resolve(null)
      }
    }, 'image/jpeg', 0.8)
  })
}

export const startSpeech = async (sessionId) => {
  // Initialize speech recognition for the session
  try {
    const response = await api.post('/speech/start', { sessionId })
    return response.data
  } catch (error) {
    console.error('Speech start error:', error)
    return null
  }
}

export default api
