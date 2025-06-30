import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Tạo axios instance với credentials
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Quan trọng: gửi cookie với mọi request
});

export const projectService = {
  // Lấy danh sách kịch bản của user hiện tại
  getMyScripts: async (params = {}) => {
    try {
      const response = await apiClient.get(`/api/project-manager/user/scripts`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách kịch bản của user
  getUserScripts: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/api/project-manager/user/scripts`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy chi tiết một kịch bản
  getScriptDetail: async (scriptId) => {
    try {
      const response = await apiClient.get(`/api/project-manager/scripts/${scriptId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Alias cho getScriptById (để tương thích với code hiện tại)
  getScriptById: async (scriptId) => {
    try {
      const response = await apiClient.get(`/api/project-manager/scripts/${scriptId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy nội dung script từ video-scripts API
  getScriptContent: async (scriptId) => {
    try {
      const response = await apiClient.get(`/api/video-scripts/scripts/${scriptId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật kịch bản
  updateScript: async (scriptId, updateData) => {
    try {
      const response = await apiClient.put(`/api/project-manager/scripts/${scriptId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa kịch bản
  deleteScript: async (scriptId) => {
    try {
      const response = await apiClient.delete(`/api/project-manager/scripts/${scriptId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lưu trữ kịch bản
  archiveScript: async (scriptId) => {
    try {
      const response = await apiClient.post(`/api/project-manager/scripts/${scriptId}/archive`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Khôi phục kịch bản
  restoreScript: async (scriptId) => {
    try {
      const response = await apiClient.post(`/api/project-manager/scripts/${scriptId}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Kiểm tra script có tồn tại không
  checkScriptExists: async (scriptId) => {
    try {
      const response = await apiClient.get(`/api/project-manager/scripts/${scriptId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật video_url cho script
  updateVideoUrl: async (scriptId, videoUrl) => {
    try {
      const response = await apiClient.put(
        `/api/project-manager/scripts/${scriptId}`,
        { video_url: videoUrl }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy signed URL cho video
  getVideoUrl: async (filename) => {
    try {
      const response = await apiClient.get(`/api/v1/storage/get-video-url/${filename}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo URL upload video
  generateVideoUploadUrl: async (fileInfo) => {
    try {
      const response = await apiClient.post('/api/v1/storage/generate-upload-url', fileInfo);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Kiểm tra URL có hết hạn không
  checkUrlExpiration: async (url) => {
    try {
      // Kiểm tra xem có phải signed URL không
      if (!url.includes('storage.googleapis.com')) {
        return { isExpired: false, reason: 'Not a signed URL' };
      }

      // Thử fetch URL với method HEAD để kiểm tra
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Tránh CORS issues
      });
      
      // Nếu có lỗi network, có thể URL đã hết hạn
      return { isExpired: false, reason: 'URL accessible' };
    } catch (error) {
      return { isExpired: true, reason: 'Network error or expired' };
    }
  },

  // Refresh signed URL cho video
  refreshVideoUrl: async (scriptId) => {
    try {
      // Lấy thông tin script hiện tại
      const script = await apiClient.get(`/api/project-manager/scripts/${scriptId}`);
      const currentVideoUrl = script.data.video_url;
      
      if (!currentVideoUrl || !currentVideoUrl.includes('storage.googleapis.com')) {
        throw new Error('Không phải signed URL');
      }

      // Lấy filename từ URL
      const urlParts = currentVideoUrl.split('/');
      const filename = urlParts.slice(-2).join('/'); // videos/filename.mp4
      
      // Lấy signed URL mới
      const response = await apiClient.get(`/api/v1/storage/get-video-url/${filename}`);
      const newVideoUrl = response.data.signed_url;
      
      // Cập nhật script với URL mới
      await apiClient.put(`/api/project-manager/scripts/${scriptId}`, {
        video_url: newVideoUrl
      });
      
      return { video_url: newVideoUrl, refreshed_at: new Date().toISOString() };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 