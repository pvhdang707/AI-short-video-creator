const API_BASE_URL = 'http://localhost:8000/api';

class YouTubeService {
  // Lấy danh sách video của kênh
  static async getChannelVideos(channelId, maxResults = 20, pageToken = null) {
    try {
      const params = new URLSearchParams({
        channel_id: channelId,
        max_results: maxResults
      });
      
      if (pageToken) {
        params.append('page_token', pageToken);
      }

      const response = await fetch(`${API_BASE_URL}/youtube/channel/videos?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channel videos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      throw error;
    }
  }

  // Lấy danh sách video của người dùng hiện tại
  static async getMyVideos(maxResults = 20, pageToken = null) {
    try {
      const params = new URLSearchParams({
        max_results: maxResults
      });
      
      if (pageToken) {
        params.append('page_token', pageToken);
      }

      const response = await fetch(`${API_BASE_URL}/youtube/my/videos?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch my videos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my videos:', error);
      throw error;
    }
  }

  // Lấy thống kê kênh của người dùng hiện tại
  static async getMyChannelStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/youtube/my/stats`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channel stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching channel stats:', error);
      throw error;
    }
  }

  // Lấy channel ID của người dùng hiện tại
  static async getMyChannelId() {
    try {
      const response = await fetch(`${API_BASE_URL}/youtube/my/channel-id`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channel ID');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching channel ID:', error);
      throw error;
    }
  }

  // Lấy dữ liệu analytics của kênh
  static async getChannelAnalytics(channelId, timeRange = '7d') {
    try {
      const params = new URLSearchParams({
        channel_id: channelId,
        time_range: timeRange
      });

      const response = await fetch(`${API_BASE_URL}/youtube/analytics?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channel analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching channel analytics:', error);
      throw error;
    }
  }

  // Lấy dữ liệu analytics của kênh người dùng hiện tại
  static async getMyChannelAnalytics(timeRange = '7d') {
    try {
      const params = new URLSearchParams({
        time_range: timeRange
      });

      const response = await fetch(`${API_BASE_URL}/youtube/my/analytics?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch my channel analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my channel analytics:', error);
      throw error;
    }
  }

  // Lấy thống kê chi tiết video
  static async getVideoAnalytics(videoId, timeRange = '7d') {
    try {
      const params = new URLSearchParams({
        video_id: videoId,
        time_range: timeRange
      });

      const response = await fetch(`${API_BASE_URL}/youtube/video/analytics?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      throw error;
    }
  }

  // Lấy dữ liệu demographics
  static async getChannelDemographics(channelId) {
    try {
      const params = new URLSearchParams({
        channel_id: channelId
      });

      const response = await fetch(`${API_BASE_URL}/youtube/demographics?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch channel demographics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching channel demographics:', error);
      throw error;
    }
  }

  // Lấy dữ liệu traffic sources
  static async getChannelTrafficSources(channelId) {
    try {
      const params = new URLSearchParams({
        channel_id: channelId
      });

      const response = await fetch(`${API_BASE_URL}/youtube/traffic-sources?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch traffic sources');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching traffic sources:', error);
      throw error;
    }
  }

  // Upload video lên YouTube
  static async uploadVideo(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/youtube/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  // Xóa video khỏi YouTube
  static async deleteVideo(videoId, accessToken) {
    try {
      const params = new URLSearchParams({
        access_token: accessToken
      });

      const response = await fetch(`${API_BASE_URL}/youtube/video/${videoId}?${params}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }

  // Lấy dữ liệu analytics chi tiết của kênh người dùng hiện tại
  static async getMyChannelAnalyticsDetailed(timeRange = '7d') {
    try {
      const params = new URLSearchParams({
        time_range: timeRange
      });

      const response = await fetch(`${API_BASE_URL}/youtube/my/analytics/detailed?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detailed analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      throw error;
    }
  }

  // Lấy tổng quan analytics của kênh người dùng hiện tại
  static async getMyChannelAnalyticsSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/youtube/my/analytics/summary`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }
}

export default YouTubeService; 