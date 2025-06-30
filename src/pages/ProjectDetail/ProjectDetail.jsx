import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { useYouTubeChannel } from '../../hooks/useYouTubeChannel';
import { toast } from 'react-toastify';
import YouTubeUploader from '../../components/YouTubeUploader';
import YouTubeChannelButton from '../../components/YouTubeChannelButton';
import YouTubeSetupGuide from '../../components/YouTubeSetupGuide';

const ProjectDetail = () => {
  const { scriptId } = useParams();
  const navigate = useNavigate();
  const { hasChannel: hasYouTubeChannel } = useYouTubeChannel();
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showYouTubeUploader, setShowYouTubeUploader] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [scriptContent, setScriptContent] = useState(null);
  const [scriptContentLoading, setScriptContentLoading] = useState(false);

  // Sử dụng hook auto refresh
  const {
    isRefreshing,
    lastRefreshTime: autoRefreshLastTime,
    refreshCount,
    refreshUrl,
    checkAndRefresh
  } = useAutoRefresh(scriptId, script?.video_url, autoRefreshEnabled);

  useEffect(() => {
    loadProjectDetail();
  }, [scriptId]);

  useEffect(() => {
    if (scriptId) {
      loadScriptContent();
    }
  }, [scriptId]);

  const handleSetupYouTubeChannel = () => {
    setShowSetupGuide(true);
  };

  const loadProjectDetail = async () => {
    try {
      setLoading(true);
      const data = await projectService.getScriptById(scriptId);
      setScript(data);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết project:', err);
      setError('Unable to load project details. Please try again.');
      toast.error('❌ Unable to load project details');
    } finally {
      setLoading(false);
    }
  };

  const loadScriptContent = async () => {
    try {
      setScriptContentLoading(true);
      const content = await projectService.getScriptContent(scriptId);
      setScriptContent(content);
    } catch (err) {
      console.error('Error loading script content:', err);
      // Không hiển thị toast error vì đây không phải lỗi nghiêm trọng
    } finally {
      setScriptContentLoading(false);
    }
  };

  const handleEditProject = () => {
    navigate(`/create-video/?scriptId=${scriptId}`, {
      state: {
        projectData: script,
        editMode: true
      }
    });
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    try {
      await projectService.deleteScript(scriptId);
      toast.success('✅ Project deleted successfully');
      navigate('/gallery');
    } catch (err) {
      toast.error('❌ Unable to delete project');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleYouTubeUploadSuccess = (result) => {
    console.log('YouTube upload result:', result);
    setShowYouTubeUploader(false);
    toast.success('🎉 Video uploaded to YouTube successfully!');
  };

  const handleVideoError = (error) => {
    setVideoLoading(false);
    
    const isExpiredToken = script.video_url && 
                          script.video_url.includes('storage.googleapis.com') &&
                          (error?.target?.error?.code === 4 || 
                           error?.message?.includes('ExpiredToken') ||
                           error?.message?.includes('Invalid argument') ||
                           error?.target?.error?.code === 3);
    
    if (isExpiredToken) {
      setVideoError('Video URL has expired. Please click "Refresh URL" to reload.');
      
      if (autoRefreshEnabled) {
        console.log('🔄 Tự động refresh URL do expired token...');
        setTimeout(() => {
          refreshUrl(true);
        }, 1000);
      } else {
        toast.error('❌ Video URL has expired. Please refresh URL.');
      }
    } else {
      setVideoError('Unable to load video. Please check the URL.');
      toast.error('❌ Unable to load video');
    }
  };

  const handleRefreshSignedUrl = async () => {
    if (!script.video_url) return;
    
    try {
      setVideoLoading(true);
      setVideoError(null);
      
      if (script.video_url.includes('storage.googleapis.com')) {
        const newVideoUrl = await refreshUrl(false);
        
        if (newVideoUrl) {
          setScript(prev => ({
            ...prev,
            video_url: newVideoUrl
          }));
          toast.success('🔄 Video URL refreshed');
        }
      }
    } catch (err) {
      console.error('Lỗi khi refresh signed URL:', err);
      toast.error('❌ Unable to refresh video URL. Please try again.');
      setVideoError('Unable to refresh video URL. Please try again.');
    } finally {
      setVideoLoading(false);
    }
  };

  const validateVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
    const isVideoUrl = videoExtensions.some(ext => url.toLowerCase().includes(ext)) || 
                      url.includes('video') || 
                      url.includes('storage.googleapis.com');
    return isVideoUrl;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', text: 'Draft' },
      'COMPLETED': { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'Completed' },
      'FAILED': { color: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'Failed' },
      'PROCESSING': { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', text: 'Processing' },
      'ARCHIVED': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', text: 'Archived' },
      'ACTIVE': { color: 'bg-green-500/20 text-green-400 border-green-500/30', text: 'Active' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', text: status };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectImage = (script) => {
    if (script.cover_image) {
      return script.cover_image;
    }
    if (script.scenes && script.scenes.length > 0) {
      for (const scene of script.scenes) {
        if (scene.images && scene.images.length > 0) {
          return scene.images[0].image_url;
        }
      }
    }
    return '/images/1.jpeg';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-gray-300 mb-4 text-lg">{error || 'Project not found'}</p>
          <button 
            onClick={() => navigate('/gallery')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header với Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
            <button 
              onClick={() => navigate('/gallery')}
              className="hover:text-blue-400 transition flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
            <span>/</span>
            <span className="text-white font-medium">{script.title || 'Project'}</span>
          </nav>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 justify-between">
                <h1 className="text-3xl font-bold text-white">{script.title || 'Untitled Project'}</h1>
                {getStatusBadge(script.status)}
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                {script.description || 'No description for this project'}
              </p>
            </div>
            
            
          </div>
        </div>

        {/* Video Hero Section */}
        {script.video_url && validateVideoUrl(script.video_url) && (
          <div className="mb-8">
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              {videoLoading && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-300 text-lg">Loading video...</p>
                  </div>
                </div>
              )}
              
              {videoError && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center z-10">
                  <div className="text-center max-w-md">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-white mb-2">Video loading error</h3>
                    <p className="text-gray-300 mb-4">{videoError}</p>
                    {videoError.includes('hết hạn') && script.video_url.includes('storage.googleapis.com') && (
                      <button 
                        onClick={handleRefreshSignedUrl}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                      >
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh URL
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <video 
                src={script.video_url} 
                controls 
                className="w-full aspect-video"
                poster="/images/1.jpeg"
                onLoadStart={() => setVideoLoading(true)}
                onLoadedData={() => setVideoLoading(false)}
                onError={handleVideoError}
                onAbort={handleVideoError}
              />
            </div>
            
            {/* Video Actions - Di chuyển xuống dưới video */}
            <div className="mt-4 flex justify-end">
              <a
                href={script.video_url}
                download={`${script.title || 'video'}.mp4`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center text-sm shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </a>
            </div>
          </div>
        )}

        {/* Project Image Hero - Chỉ hiển thị khi không có video */}
        {(!script.video_url || !validateVideoUrl(script.video_url)) && (
          <div className="relative h-80 rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <img 
              src={getProjectImage(script)} 
              alt={script.title || 'Project'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/images/1.jpeg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{script.title || 'Untitled Project'}</h2>
                  <p className="text-gray-200 text-lg leading-relaxed max-w-2xl">
                    {script.description || 'No description for this project'}
                  </p>
                </div>
                <div className="flex items-center gap-6 ml-6">
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-300 mb-1">Scenes</p>
                    <p className="text-2xl font-bold text-white">{script.scenes?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Detailed Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Project Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột 1 */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Project Title</label>
                    <p className="text-white text-lg font-medium">{script.title || 'No title yet'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Target Audience</label>
                    <p className="text-white">{script.target_audience || 'Not specified'}</p>
                  </div>
                </div>
                
                {/* Cột 2 */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Created Date</label>
                    <p className="text-white">{formatDate(script.created_at)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Last Updated</label>
                    <p className="text-white">{formatDate(script.updated_at)}</p>
                  </div>
                </div>
              </div>

              {/* Script Content Section */}
              {scriptContent && scriptContent.scenes && scriptContent.scenes.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm  mt-6">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Script Content
                  </h3>
                  
                  {scriptContentLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                      <span className="ml-3 text-gray-300">Loading script content...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scriptContent.scenes
                        .sort((a, b) => a.scene_number - b.scene_number)
                        .map((scene, index) => (
                        <div key={index} className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {scene.scene_number}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">Scene {scene.scene_number}</h4>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Scene Description */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Description
                              </h5>
                              <p className="text-gray-300 leading-relaxed text-sm">
                                {scene.description}
                              </p>
                            </div>
                            
                            {/* Visual Elements */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Visual Elements
                              </h5>
                              <p className="text-gray-300 leading-relaxed text-sm">
                                {scene.visual_elements || 'No visual elements specified'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Voice Over */}
                          {scene.voice_over && (
                            <div className="mt-4 pt-4 border-t border-gray-600/50">
                              <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                Voice Over
                              </h5>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <p className="text-gray-300 leading-relaxed text-sm italic">
                                  "{scene.voice_over}"
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Script Content Not Available */}
              {!scriptContentLoading && (!scriptContent || !scriptContent.scenes || scriptContent.scenes.length === 0) && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Script Content
                  </h3>
                  
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📝</div>
                    <p className="text-gray-300 text-lg mb-2">No script content available</p>
                    <p className="text-gray-400 text-sm">
                      This project may not have detailed script information or the content is not accessible.
                    </p>
                  </div>
                </div>
              )}

              
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            

            {/* edit Project Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              
              
              <div className="space-y-4">
                
                
              <button
                    onClick={handleEditProject}
                    className="w-full flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Project
                  </button>
                  
                  {script.video_url && validateVideoUrl(script.video_url) && (
                    hasYouTubeChannel ? (
                      <button
                        onClick={() => setShowYouTubeUploader(true)}
                        className="w-full flex justify-center items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition flex items-center font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Upload to YouTube
                      </button>
                    ) : (
                      <YouTubeChannelButton 
                        onSetupClick={handleSetupYouTubeChannel}
                        onClose={null}
                        compact={true}
                      />
                    )
                  )}
              </div>
            </div>
            {/* Delete Project Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center text-red-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete project
              </h3>
              
              <div className="space-y-4">
                <p className="text-gray-400 text-sm leading-relaxed">
                  This action will permanently delete the project and all related data.
                </p>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition flex items-center justify-center font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Upload Modal */}
        {showYouTubeUploader && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Upload video to YouTube</h3>
                <button
                  onClick={() => setShowYouTubeUploader(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <YouTubeUploader
                videoUrl={script.video_url}
                projectTitle={script.title}
                projectDescription={script.description}
                onUploadSuccess={handleYouTubeUploadSuccess}
              />
            </div>
          </div>
        )}

        {/* YouTube Setup Guide Modal */}
        {showSetupGuide && (
          <YouTubeSetupGuide onClose={() => setShowSetupGuide(false)} />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Confirm Delete Project</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete project <strong>"{script.title || 'Untitled Project'}"</strong>?
                </p>
                <p className="text-red-400 text-sm mb-6">
                  ⚠️ This action cannot be undone. All data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </div>
                    ) : (
                      'Delete permanently'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail; 