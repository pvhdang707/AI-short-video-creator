import { useState, useEffect } from 'react';
import YouTubeService from '../services/youtubeService';

export const useYouTubeChannel = () => {
  const [hasChannel, setHasChannel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkChannel = async () => {
    try {
      setLoading(true);
      setError(null);

      const stats = await YouTubeService.getMyChannelStats();
      // Kiểm tra kỹ hơn: phải có channel_id và title
      if (stats && stats.channel_id && stats.title) {
        setHasChannel(true);
      } else {
        setHasChannel(false);
      }
    } catch (err) {
      setHasChannel(false);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkChannel();
  }, []);

  return {
    hasChannel,
    loading,
    error,
    checkChannel
  };
}; 