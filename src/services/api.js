import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8000/api';

// Hàm tiện ích để xử lý lỗi
const handleError = (error) => {
  console.error('API Error:', error);

  // Lấy message lỗi từ response
  let errorMessage = 'Đã xảy ra lỗi không xác định';
  
  if (error.response) {
    // Lỗi từ server
    errorMessage = error.response.data?.detail || 
                  error.response.data?.message || 
                  `Lỗi ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // Lỗi network (không có response)
    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo server đang chạy.';
    } else {
      errorMessage = 'Lỗi kết nối mạng';
    }
  } else {
    // Lỗi khác
    errorMessage = error.message || 'Đã xảy ra lỗi không xác định';
  }

  // Log chi tiết lỗi
  console.log('Error Details:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    config: error.config,
    code: error.code,
    message: error.message
  });

  // Hiển thị thông báo lỗi
  toast.error(errorMessage);

  return Promise.reject(error);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Biến để tránh gọi refresh token nhiều lần đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    // Log request details
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Log response thành công
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      config: response.config
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Thử refresh token bằng cách gọi API với refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await authAPI.refreshToken(refreshToken);
          const newAccessToken = response.data.access_token;
          
          // Lưu access token mới
          localStorage.setItem('token', newAccessToken);
          
          processQueue(null, newAccessToken);
          isRefreshing = false;
          
          // Retry request ban đầu với token mới
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return api(originalRequest);
        } else {
          // Không có refresh token, chuyển hướng về login
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/auth/google/callback')) {
            window.location.href = '/login';
          }
          processQueue(error, null);
          isRefreshing = false;
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Xóa tokens không hợp lệ
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        
        // Chuyển hướng về login
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/auth/google/callback')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return handleError(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', 
    new URLSearchParams({
      username: credentials.username,
      password: credentials.password
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  ),
  register: (userData) => api.post('/auth/register', {
    username: userData.username,
    email: userData.email,
    password: userData.password,
    full_name: userData.full_name
  }),
  logout: (refreshToken) => api.post('/auth/logout', { refresh_token: refreshToken }),
  googleLoginUrl: () => api.get('/auth/google/login'),
  googleCallback: (code) => api.get(`/auth/google/callback?code=${code}`),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
};

// User APIs
export const userAPI = {
  // updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  // getSavedScripts: () => api.get('/users/saved-scripts'),
  // getVideos: () => api.get('/users/videos'),
  getProfile: () => api.get('/users/me'),
};

// Video Script APIs
export const videoScriptAPI = {
  generateScript: (data) => api.post('/video-scripts/generate', data),
  enhanceScript: (scriptId) => api.post(`/video-scripts/enhance/${scriptId}`),
  getScripts: (params) => api.get('/video-scripts/scripts', { params }),
  getScriptById: (id) => api.get(`/video-scripts/scripts/${id}`),
  saveScript: (scriptId) => api.post(`/video-scripts/scripts/${scriptId}/save`),
  uploadImagesFromUrls: (scriptId) => api.post(`/video-scripts/scripts/${scriptId}/upload-images-from-urls`),
  deleteScript: (scriptId) => api.delete(`/video-scripts/scripts/${scriptId}`),
  updateScript: (scriptId, data) => api.put(`/video-scripts/scripts/${scriptId}`, data),
};

// Voice APIs
export const voiceAPI = {
  // Chuyển đổi text thành giọng nói
  textToSpeech: (data) => api.post('/voice/text-to-speech', {
    text: data.text,
    voice_id: data.voice_id,
    speed: data.speed
  }),

  // Tạo giọng nói cho toàn bộ script
  scriptToSpeech: (scriptId, data) => api.post(`/voice/script-to-speech/${scriptId}`, {
    voice_id: data.voice_id,
    speed: data.speed
  }),

  // Lấy danh sách giọng nói của một script
  getScriptVoices: (scriptId) => api.get(`/voice/list/${scriptId}`),

  // Cập nhật giọng nói cho một scene
  updateVoice: (sceneId, data) => api.put(`/voice/update/${sceneId}`, {
    voice_over: data.text,
    voice_id: data.voice_id,
    speed: data.speed
  }),

  // Xóa giọng nói của một scene
  deleteVoice: (audioId) => api.delete(`/voice/voice-audio/${audioId}`),

  getVoices: () => api.get('/voice/available-voices'),
  getVoiceStatus: (taskId) => api.get(`/voice/status/${taskId}`),
  uploadVoiceFile: (sceneId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/voice/upload-audio/${sceneId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Image APIs
export const imageAPI = {
  // Tạo một hình ảnh cho scene
  generateImage: (data) => api.post('/images/generate', {
    scene_id: data.scene_id,
    prompt: data.prompt,
    width: data.width || 1024,
    height: data.height || 768
  }),

  // Tạo hình ảnh cho toàn bộ script
  generateImagesForScript: (scriptId) => api.post(`/images/generate-for-script/${scriptId}`),

  // Cập nhật hình ảnh của scene
  updateSceneImage: (imageId, data) => api.put(`/images/scene-images/${imageId}`, {
    prompt: data.prompt,
    width: data.width || 1024,
    height: data.height || 768
  }),

  // Lấy danh sách hình ảnh của script
  getScriptImages: (scriptId) => api.get(`/images/list/${scriptId}`),

  // Tạo lại hình ảnh cho một scene
  regenerateImage: (imageId, data) => api.put(`/images/scene-images/${imageId}`, {
    prompt: data.prompt,
    width: data.width || 1024,
    height: data.height || 768
  }),
};

// Video APIs
export const videoAPI = {
  createVideo: (scriptId) => api.post('/videos/create-video', { script_id: scriptId }),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  getUserVideos: () => api.get('/videos/user'),
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  getVideoStatus: (taskId) => api.get(`/videos/status/${taskId}`),
  downloadVideo: (videoId) => api.get(`/videos/${videoId}/download`, { responseType: 'blob' }),
};

// Script (Project) APIs
export const scriptAPI = {
  getScripts: () => api.get('/project-manager/user/scripts'),
  getScriptById: (scriptId) => api.get(`/project-manager/scripts/${scriptId}`),
  updateScript: (scriptId, data) => api.put(`/project-manager/scripts/${scriptId}`, data),
  updateScriptScenes: (scriptId, data) => api.put(`/project-manager/scripts/${scriptId}/scenes`, data),
  deleteScript: (scriptId) => api.delete(`/project-manager/scripts/${scriptId}`),
  archiveScript: (scriptId) => api.post(`/project-manager/scripts/${scriptId}/archive`),
  restoreScript: (scriptId) => api.post(`/project-manager/scripts/${scriptId}/restore`),
};