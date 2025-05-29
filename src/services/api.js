import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
};

// Video Script APIs
export const videoScriptAPI = {
  generateScript: (data) => api.post('/video-scripts/generate', data),
  enhanceScript: (scriptId) => api.post(`/video-scripts/enhance/${scriptId}`),
  getScripts: () => api.get('/video-scripts/scripts'),
  getScriptById: (id) => api.get(`/video-scripts/scripts/${id}`),
};

// Voice APIs
export const voiceAPI = {
  textToSpeech: (data) => api.post('/voice/text-to-speech', data),
  scriptToSpeech: (scriptId, data) => api.post(`/voice/script-to-speech/${scriptId}`, data),
};

// Image APIs
export const imageAPI = {
  generateImage: (data) => api.post('/images/generate', data),
  generateImagesForScript: (scriptId) => api.post(`/images/generate-for-script/${scriptId}`),
  generateImageForScene: (scriptId, sceneIndex, prompt) => api.post(`/images/generate-for-scene/${scriptId}`, {
    scene_index: sceneIndex,
    prompt: prompt
  })
};

export default api; 