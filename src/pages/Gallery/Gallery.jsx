import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../../components/ItemCard/ItemCard';
import { useScripts } from '../../hooks/useScripts';
import { useAuth } from '../../contexts/AuthContext';
import { useYouTubeChannel } from '../../hooks/useYouTubeChannel';
import { toast } from 'react-toastify';
import YouTubeService from '../../services/youtubeService';
import YouTubeStats from '../../components/YouTubeStats';
import YouTubeVideoList from '../../components/YouTubeVideoList';
import DashboardStats from '../../components/DashboardStats';
import YouTubeChannelButton from '../../components/YouTubeChannelButton';
import YouTubeAnalytics from '../../components/YouTubeAnalytics/YouTubeAnalytics';
import YouTubeAnalytics30D from '../../components/YouTubeAnalytics30D';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scripts, loading, error, deleteScript, archiveScript } = useScripts();
  const { hasChannel: hasYouTubeChannel, loading: channelLoading } = useYouTubeChannel();
  
  // YouTube state
  const [youtubeStats, setYoutubeStats] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'youtube'
  const [youtubeSubTab, setYoutubeSubTab] = useState('videos'); // 'videos', 'analytics'

  // Load YouTube data
  useEffect(() => {
    if (user && hasYouTubeChannel) {
      loadYouTubeData();
    }
  }, [user, hasYouTubeChannel]);

  const loadYouTubeData = async () => {
    try {
      setYoutubeLoading(true);
      
      // Load channel stats
      try {
        const stats = await YouTubeService.getMyChannelStats();
        if (stats) {
          console.log('YouTube channel stats loaded:', stats);
          setYoutubeStats(stats);
        }
      } catch (err) {
        console.log('Unable to load YouTube stats:', err);
      }
      
      // Load videos
      try {
        const videosData = await YouTubeService.getMyVideos(10);
        if (videosData && videosData.videos) {
          setYoutubeVideos(videosData.videos);
        }
      } catch (err) {
        console.log('Unable to load YouTube videos:', err);
      }
      
    } catch (err) {
      console.error('Error loading YouTube data:', err);
    } finally {
      setYoutubeLoading(false);
    }
  };

  // Tính toán thống kê
  const stats = {
    totalScripts: Array.isArray(scripts) ? scripts.length : 0,
    draftScripts: Array.isArray(scripts) ? scripts.filter(s => s?.status?.toUpperCase() === 'DRAFT').length : 0,
    completedScripts: Array.isArray(scripts) ? scripts.filter(s => s?.status?.toUpperCase() === 'COMPLETED').length : 0,
    inProgressScripts: Array.isArray(scripts) ? scripts.filter(s => s?.status?.toUpperCase() === 'PROCESSING').length : 0,
    youtubeVideos: youtubeVideos.length,
    youtubeSubscribers: youtubeStats?.subscriber_count || 0,
    youtubeViews: youtubeStats?.view_count || 0,
    youtubeChannelId: youtubeStats?.channel_id || null
  };

  // Xử lý sự kiện các nút
  const handleCreateProject = () => {
    navigate('/create-video');
  };

  const handleManageProjects = () => {
    toast.info('Detailed management feature is under development');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-video':
        navigate('/create-video');
        break;
      case 'youtube-manager':
        navigate('/youtube-manager');
        break;
      case 'templates':
        toast.info('Template feature is under development');
        break;
      case 'settings':
        toast.info('Settings feature is under development');
        break;
      case 'reports':
        toast.info('Report feature is under development');
        break;
      default:
        break;
    }
  };

  const handleViewAll = () => {
    toast.info('Currently on full list page');
  };

  const handleViewProjectDetail = (scriptId) => {
    navigate(`/project-detail/${scriptId}`);
  };

  const handleVideoClick = (video) => {
    // Có thể mở modal hoặc chuyển đến trang chi tiết video
    window.open(video.url, '_blank');
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

  // Lấy ảnh cho project
  const getProjectImage = (script) => {
    // Ưu tiên cover_image nếu có
    if (script.cover_image) {
      return script.cover_image;
    }
    // Nếu không có thì lấy ảnh đầu tiên của scene
    if (script.scenes && script.scenes.length > 0) {
      for (const scene of script.scenes) {
        if (scene.images && scene.images.length > 0) {
          return scene.images[0].image_url;
        }
      }
    }
    // Nếu không có ảnh, trả về ảnh mặc định
    return '/images/1.jpeg';
  };

  const handleSetupYouTubeChannel = () => {
    if (hasYouTubeChannel && youtubeStats?.channel_id) {
      // Nếu đã có kênh, truy cập kênh
      window.open(`https://www.youtube.com/channel/${youtubeStats.channel_id}`, '_blank');
    } else {
      // Nếu chưa có kênh, chuyển hướng đến trang tạo kênh YouTube
      window.open('https://www.youtube.com/create_channel', '_blank');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>You need to login to view Dashboard.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <h1 className="font-bold py-6 mb-2 font-mono text-5xl bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              Dashboard
            </h1>
            <div className="absolute inset-0 font-bold py-6 mb-2 font-mono text-5xl bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-purple-600/20 bg-clip-text text-transparent blur-sm -z-10">
              Dashboard
            </div>
            <p className="text-gray-400 text-lg font-medium">Manage your projects and YouTube content</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-1 flex">
            <button
              onClick={() => setActiveTab('projects')}
              className={`group flex items-center space-x-2 flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'projects' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`group flex items-center space-x-2 flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'youtube' 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube</span>
            </button>
          </div>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Dashboard Stats */}
            <DashboardStats stats={stats} />

            {/* Projects List */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-300 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span>Recent Projects</span>
                </h3>
               
              </div>

              {scripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30">
                  <div className="p-4 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-full mb-6">
                    <img 
                      src="/images/1.jpeg" 
                      alt="Default project" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-gray-400 font-medium text-lg mb-2">No projects yet</p>
                  <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
                    Start creating amazing videos with AI. Your projects will appear here once you create them.
                  </p>
                  <button 
                    onClick={handleCreateProject}
                    className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create first project</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scripts.map((script) => (
                    <div 
                      key={script.id}
                      className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-1 cursor-pointer"
                      onClick={() => handleViewProjectDetail(script.id)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={getProjectImage(script)} 
                          alt={script.title || 'Project'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/images/1.jpeg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm border ${
                            script.status?.toUpperCase() === 'COMPLETED' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                            script.status?.toUpperCase() === 'PROCESSING' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                            script.status?.toUpperCase() === 'DRAFT' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                            'bg-gray-500/20 border-gray-500/30 text-gray-400'
                          }`}>
                            {script.status?.toUpperCase() === 'COMPLETED' ? 'Completed' :
                             script.status?.toUpperCase() === 'PROCESSING' ? 'Processing' :
                             script.status?.toUpperCase() === 'DRAFT' ? 'Draft' :
                             script.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="font-semibold text-lg mb-2 text-white group-hover:text-blue-300 transition-colors duration-300">
                          {script.title || 'Untitled Project'}
                        </h4>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {script.description || 'No description available for this project.'}
                        </p>
                        <div className="flex justify-between items-center">
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(script.created_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* YouTube Tab */}
        {activeTab === 'youtube' && (
          <div className="max-w-7xl mx-auto space-y-8">
            {/* YouTube Channel Button - hiển thị với mode phù hợp */}
            {/* <YouTubeChannelButton 
              onSetupClick={handleSetupYouTubeChannel}
              hasChannel={hasYouTubeChannel}
              channelData={youtubeStats}
            /> */}

            {/* Nếu đã có channel, hiển thị thêm stats và tabs */}
            {hasYouTubeChannel && (
              <>
                {/* YouTube Stats */}
                <YouTubeStats 
                  stats={youtubeStats} 
                  loading={youtubeLoading} 
                  channelId={youtubeStats?.channel_id}
                />

                {/* YouTube Sub-tabs */}
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-1 flex">
                    <button
                      onClick={() => setYoutubeSubTab('videos')}
                      className={`group flex items-center space-x-2 flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        youtubeSubTab === 'videos' 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m12-4v18m-8-5l4-4-4-4" />
                      </svg>
                      <span>Videos</span>
                    </button>
                    <button
                      onClick={() => setYoutubeSubTab('analytics')}
                      className={`group flex items-center space-x-2 flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        youtubeSubTab === 'analytics' 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Analytics</span>
                    </button>
                  </div>
                </div>

                {/* Videos Sub-tab */}
                {youtubeSubTab === 'videos' && (
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-300 flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-lg">
                          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                        <span>Recent YouTube Videos</span>
                      </h3>
                    </div>

                    <YouTubeVideoList 
                      videos={youtubeVideos}
                      loading={youtubeLoading}
                      onVideoClick={handleVideoClick}
                    />
                  </div>
                )}

                {/* Analytics Sub-tab */}
                {youtubeSubTab === 'analytics' && (
                  <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-300 flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-lg">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <span>YouTube Analytics</span>
                      </h3>
                      <div className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-lg border border-gray-600/30">
                        Channel: {youtubeStats?.title || 'Unknown'}
                      </div>
                    </div>

                    {/* <YouTubeAnalytics
                      channelId={youtubeStats?.channel_id}
                      channelStats={youtubeStats}
                    /> */}
                    <YouTubeAnalytics30D
                      channelId={youtubeStats?.channel_id}
                      channelStats={youtubeStats}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* End of tabs */}
      </div>
    </div>
  );
};

export default Dashboard;