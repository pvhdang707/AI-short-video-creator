import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import YouTubeService from '../../services/youtubeService';
import YouTubeAnalytics30D from '../../components/YouTubeAnalytics30D';
import { toast } from 'react-toastify';

const YouTubeManager = () => {
  const { user } = useAuth();
  const [channelStats, setChannelStats] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (user) {
      loadChannelData();
    }
  }, [user]);

  const loadChannelData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load channel stats
      const stats = await YouTubeService.getMyChannelStats();
      setChannelStats(stats);

      // Load videos
      const videosData = await YouTubeService.getMyVideos(20);
      setMyVideos(videosData.videos || []);    } catch (err) {
      console.error('Error loading YouTube data:', err);
      setError('Unable to load YouTube data. Please check access permissions.');
      toast.error('❌ Error loading YouTube data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    // YouTube duration format: PT4M13S
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'N/A';
    
    const hours = match[1] || 0;
    const minutes = match[2] || 0;
    const seconds = match[3] || 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>You need to login to view YouTube Manager.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-gray-300 mb-4 text-lg">{error}</p>            <button 
              onClick={loadChannelData}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <svg className="w-8 h-8 mr-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>            <h1 className="text-3xl font-bold">YouTube Manager</h1>
          </div>
          <p className="text-gray-400">Manage your YouTube channel and videos</p>
        </div>        {/* Tabs */}        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-4 py-2 rounded-md transition ${
              activeTab === 'stats' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Channel Statistics
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-4 py-2 rounded-md transition ${
              activeTab === 'analytics' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            30-Day Analytics
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 px-4 py-2 rounded-md transition ${
              activeTab === 'videos' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Videos
          </button>
        </div>

        {/* Channel Stats Tab */}
        {activeTab === 'stats' && channelStats && (
          <div className="space-y-6">
            {/* Channel Info */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-6">
                <img 
                  src={channelStats.avatar_url} 
                  alt={channelStats.title}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h2 className="text-2xl font-bold">{channelStats.title}</h2>                  <p className="text-gray-400">{channelStats.description}</p>
                  <p className="text-sm text-gray-500">
                    Created: {formatDate(channelStats.published_at)}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {formatNumber(channelStats.subscriber_count)}
                  </div>
                  <div className="text-gray-400">Subscribers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {formatNumber(channelStats.view_count)}
                  </div>
                  <div className="text-gray-400">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {formatNumber(channelStats.video_count)}
                  </div>
                  <div className="text-gray-400">Videos</div>
                </div>
              </div>
            </div>
          </div>        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <YouTubeAnalytics30D 
              channelId={channelStats?.channel_id} 
              channelStats={channelStats} 
            />
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (<div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Videos</h2>
              <button
                onClick={loadChannelData}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
              >
                Refresh
              </button>
            </div>            {myVideos.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-xl">
                <div className="text-gray-400 text-6xl mb-4">📹</div>
                <p className="text-gray-300 text-lg mb-2">No videos yet</p>
                <p className="text-gray-500">Create videos from projects and upload to YouTube</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myVideos.map((video) => (
                  <div key={video.video_id} className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition">
                    <div className="relative">
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-sm">
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {video.title}
                      </h3>                      <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                        <span>{formatNumber(video.view_count)} views</span>
                        <span>{formatNumber(video.like_count)} likes</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(video.published_at)}
                      </p>
                      <div className="mt-3">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                        >                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          Watch on YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeManager; 