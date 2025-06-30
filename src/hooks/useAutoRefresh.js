import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';

export const useAutoRefresh = (scriptId, videoUrl, enabled = true) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Kiểm tra URL expiration từ parameters
  const checkUrlExpiration = useCallback((url) => {
    try {
      const urlObj = new URL(url);
      const expirationParam = urlObj.searchParams.get('X-Goog-Expires');
      
      if (expirationParam) {
        const expirationTime = parseInt(expirationParam);
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Nếu còn ít hơn 5 phút thì refresh
        if (expirationTime - currentTime < 300) {
          return true; // Cần refresh
        }
      }
    } catch (error) {
      console.error('Lỗi khi parse URL:', error);
    }
    
    return false; // Không cần refresh
  }, []);

  // Refresh URL
  const refreshUrl = useCallback(async (autoRefresh = false) => {
    if (!videoUrl || !scriptId) return null;
    
    try {
      setIsRefreshing(true);
      
      if (videoUrl.includes('storage.googleapis.com')) {
        const result = await projectService.refreshVideoUrl(scriptId);
        setLastRefreshTime(new Date());
        setRefreshCount(prev => prev + 1);
        
        if (autoRefresh) {
          console.log('✅ Đã tự động làm mới URL video');
        }
        
        return result.video_url;
      }
    } catch (error) {
      console.error('Lỗi khi refresh URL:', error);
      if (!autoRefresh) {
        throw error;
      }
    } finally {
      setIsRefreshing(false);
    }
    
    return null;
  }, [videoUrl, scriptId]);

  // Kiểm tra và refresh tự động
  const checkAndRefresh = useCallback(async () => {
    if (!videoUrl || !enabled) return;
    
    try {
      // Kiểm tra xem có phải signed URL không
      if (videoUrl.includes('storage.googleapis.com')) {
        // Kiểm tra từ URL parameters trước
        if (checkUrlExpiration(videoUrl)) {
          console.log('URL sắp hết hạn, tự động refresh...');
          await refreshUrl(true);
          return;
        }
        
        // Kiểm tra bằng service
        const expirationCheck = await projectService.checkUrlExpiration(videoUrl);
        
        if (expirationCheck.isExpired) {
          console.log('URL đã hết hạn, tự động refresh...');
          await refreshUrl(true);
        }
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra URL:', error);
    }
  }, [videoUrl, enabled, checkUrlExpiration, refreshUrl]);

  // Auto refresh interval
  useEffect(() => {
    if (!videoUrl || !enabled) return;

    // Kiểm tra ngay khi component mount
    checkAndRefresh();
    
    // Kiểm tra mỗi 5 phút
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [videoUrl, enabled, checkAndRefresh]);

  return {
    isRefreshing,
    lastRefreshTime,
    refreshCount,
    refreshUrl,
    checkAndRefresh
  };
}; 