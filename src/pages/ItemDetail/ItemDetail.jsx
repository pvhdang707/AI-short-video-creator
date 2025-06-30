import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiHeart, FiShare2, FiDownload, FiArrowLeft, FiExternalLink, FiCopy, FiLayers, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Dữ liệu mẫu, thực tế bạn nên lấy từ API hoặc context


const ItemDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);
  const [isTikTokVideo, setIsTikTokVideo] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [videoIdeas, setVideoIdeas] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Lấy dữ liệu item từ location state
  const itemData = location.state?.item;
  
  // Tự động phát hiện loại video
  useEffect(() => {
    if (itemData) {
      setIsYoutubeVideo(
        itemData.type === 'video-youtube' || 
        (itemData.mediaUrl && itemData.mediaUrl.includes('youtube.com'))
      );
      setIsTikTokVideo(
        itemData.type === 'video-tiktok' || 
        (itemData.play && itemData.play.includes('tiktok.com'))
      );
    }
  }, [itemData]);

  if (!itemData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 p-2 bg-white rounded-full shadow-md"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Item not found!</h2>
          <p className="text-gray-500">Please try again.</p>
        </div>
      </div>
    );
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Gọi API yêu thích ở đây nếu cần
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Hàm để tạo ý tưởng từ video
  const handleGenerateIdeas = () => {
    setIsGeneratingIdeas(true);
    
    // Trích xuất từ khóa và thông tin từ video
    const keywords = itemData.title.split(' ')
      .filter(word => word.length > 3)
      .filter(word => !['https', 'http', 'www', 'com', 'the', 'and', 'that'].includes(word.toLowerCase()));
    
    // Tạo ý tưởng dựa trên tiêu đề và mô tả
    setTimeout(() => {
      const generatedIdeas = [
        {
          title: `Remake of "${itemData.title.slice(0, 30)}${itemData.title.length > 30 ? '...' : ''}"`,
          description: `Create a similar video inspired by "${itemData.title}" with your own style and content`,
          keywords: keywords.slice(0, 5).join(', '),
          style: 'basic',
          idea: `Create a video similar to "${itemData.title}" with my own unique perspective`
        },
        {
          title: `${itemData.channel_name || 'Creator'} Style Video`,
          description: `Learn from the style of ${itemData.channel_name || 'this creator'} and create a video with similar editing techniques`,
          keywords: keywords.slice(0, 3).join(', '),
          style: 'information',
          idea: `Create a video using the editing style and techniques of ${itemData.channel_name || 'this creator'}`
        },
        {
          title: `Reaction to "${itemData.title.slice(0, 25)}${itemData.title.length > 25 ? '...' : ''}"`,
          description: 'Create a reaction video with your commentary and insights',
          keywords: 'reaction, commentary, review',
          style: 'comedy',
          idea: `My reaction and commentary on "${itemData.title}"`
        },
        {
          title: `Analysis of "${itemData.title.slice(0, 25)}${itemData.title.length > 25 ? '...' : ''}"`,
          description: 'Create an in-depth analysis explaining the key points and insights',
          keywords: 'analysis, explanation, insights',
          style: 'educational',
          idea: `An in-depth analysis and breakdown of "${itemData.title}"`
        },
        {
          title: `${itemData.title.split(' ').slice(0, 3).join(' ')} Challenge`,
          description: 'Create a challenge video based on the concept from this video',
          keywords: 'challenge, trend, viral',
          style: 'action',
          idea: `A challenge video based on the concept of "${itemData.title.split(' ').slice(0, 3).join(' ')}"`
        }
      ];
      
      setVideoIdeas(generatedIdeas);
      setIsGeneratingIdeas(false);
      setShowIdeas(true);
    }, 1500); // Simulating API call delay
  };

  // Hàm để sử dụng một ý tưởng cho video mới
  const handleUseIdea = (idea) => {
    navigate('/create-video-v2', { 
      state: { 
        videoIdea: idea,
        inspirationSource: {
          title: itemData.title,
          url: itemData.externalUrl || itemData.mediaUrl,
          thumbnailUrl: itemData.thumbnailUrl,
          channelName: itemData.channel_name
        }
      } 
    });
  };

  // Hàm render video player dựa trên platform
  const renderVideoPlayer = () => {
    if (isYoutubeVideo) {
      return (
        <div className="w-full h-full aspect-video">
          <iframe
            src={itemData.embedUrl || `https://www.youtube.com/embed/${itemData.videoId}`}
            title={itemData.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    } else if (isTikTokVideo) {
      // Nếu có link mp4 thì play trực tiếp
      const videoUrl = itemData.mediaUrl || itemData.play;
      console.log('videoUrl', videoUrl);
      if (videoUrl ) {
        return (
          <video 
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain bg-black"
          />
        );
      }
      // Nếu không có thì fallback về nút Xem trên TikTok
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <img src={itemData.thumbnailUrl} alt="TikTok thumbnail" className="mx-auto mb-4 rounded-lg max-h-64" />
            <h3 className="text-xl font-semibold mb-2">TikTok Video</h3>
            <p className="text-gray-300 mb-4">TikTok doesn't support direct playback on external websites. Please click the button below to view on TikTok.</p>
            <a 
              href={itemData.externalUrl || videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              View on TikTok
            </a>
          </div>
        </div>
      );
    } else if (itemData.type && itemData.type.includes('video')) {
      const videoUrl = itemData.mediaUrl || itemData.play;
      return (
        <video 
          src={videoUrl} 
          controls 
          autoPlay
          className="w-full h-full object-contain"
        />
      );
    } else {
      const imgUrl = itemData.mediaUrl || itemData.play;
      return (
        <img 
          src={imgUrl} 
          alt={itemData.title} 
          className="w-full h-full object-contain"
        />
      );
    }
  };

  // Hàm render nút action dựa trên platform
  const renderActionButtons = () => {
    if (isYoutubeVideo) {
      return (
        <a 
          href={itemData.externalUrl || itemData.mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition mb-2"
        >
          <FiExternalLink className="mr-2" />
          View on YouTube
        </a>
      );
    } else if (isTikTokVideo) {
      return (
        <a 
          href={itemData.externalUrl || itemData.mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition mb-2"
        >
          <FiExternalLink className="mr-2" />
          View on TikTok
        </a>
      );
    } else {
      return (
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition mb-2">
          <FiDownload className="mr-2" />
          Download
        </button>
      );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Back button */}
      <button 
        onClick={handleBack}
        className="fixed top-4 left-4 z-10 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition"
      >
        <FiArrowLeft className="w-5 h-5" />
      </button>

      {/* Media section */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center relative overflow-hidden">
        {renderVideoPlayer()}
      </div>

      {/* Info section */}
      <div className="w-full lg:w-1/2 p-4 lg:p-8 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-gray-100">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 break-words">{itemData.title}</h1>
              <div className="flex flex-wrap gap-2 items-center mt-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold tracking-wide">
                  {(itemData.type?.replace(/-/g, ' ') || 'Unknown').toUpperCase()}
                </span>
                {itemData.options?.platform && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm border ${
                    itemData.options.platform.toLowerCase() === 'youtube' 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : itemData.options.platform.toLowerCase() === 'tiktok'
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {itemData.options.platform.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={handleFavorite}
              className={`p-3 rounded-full border shadow transition ${isFavorite ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-400 border-gray-200 bg-white hover:bg-gray-100'}`}
              title="Yêu thích"
            >
              <FiHeart className={`w-7 h-7 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Stats Card */}
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex-1 min-w-[110px] bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100">
              <span className="text-2xl text-red-500 mb-1"><FiHeart /></span>
              <span className="font-semibold text-lg text-gray-900">{itemData.likes}</span>
              <span className="text-xs text-gray-500 mt-1">Likes</span>
            </div>
            <div className="flex-1 min-w-[110px] bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100">
              <span className="text-2xl text-blue-500 mb-1">👁️</span>
              <span className="font-semibold text-lg text-gray-900">{itemData.views}</span>
              <span className="text-xs text-gray-500 mt-1">Views</span>
            </div>
            <div className="flex-1 min-w-[110px] bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100">
              <span className="text-2xl text-green-500 mb-1">📅</span>
              <span className="font-semibold text-lg text-gray-900">{itemData.createdAt}</span>
              <span className="text-xs text-gray-500 mt-1">Created</span>
            </div>
          </div>

          {/* Description/Prompt Card */}
          {(itemData.description || itemData.prompt) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                {(isYoutubeVideo || isTikTokVideo) ? <FiExternalLink className="inline-block" /> : <FiLayers className="inline-block" />}
                {isYoutubeVideo || isTikTokVideo ? 'Description' : 'Prompt'}
              </h2>
              <div className="text-gray-700 leading-relaxed transition-all duration-200 relative">
                <p className={`${showFullDescription ? 'max-h-full' : 'max-h-24 overflow-hidden'} whitespace-pre-line`}>{itemData.description || itemData.prompt}</p>
                {((itemData.description && itemData.description.length > 150) || 
                  (itemData.prompt && itemData.prompt.length > 150)) && (
                  <button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-blue-600 hover:underline flex items-center font-medium"
                  >
                    {showFullDescription ? (
                      <>
                        <FiChevronUp className="mr-2" />Collapse
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="mr-2" />View more
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options/Video Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <FiLayers className="inline-block" />
              {isYoutubeVideo || isTikTokVideo ? 'Video Information' : 'Options'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(itemData.options || {}).map(([key, value]) => (
                value ? (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex flex-col">
                    <span className="text-xs text-gray-500 capitalize mb-1 font-medium">
                      {key === 'publishedAt' ? 'Published Date' : key}
                    </span>
                    <span className="font-medium text-gray-800 break-words">{value}</span>
                  </div>
                ) : null
              ))}
            </div>
          </div>

          {/* Action Buttons Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-wrap gap-4 justify-center items-center">
            {renderActionButtons()}
            <button 
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mb-2 shadow font-semibold"
              onClick={handleGenerateIdeas}
              disabled={isGeneratingIdeas}
            >
              {isGeneratingIdeas ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 border-4 border-t-transparent rounded-full" viewBox="0 0 24 24"></svg>
                  Generating...
                </>
              ) : (
                <>
                  <FiLayers className="mr-2" />Create Video Ideas
                </>
              )}
            </button>
          </div>

          {/* Video Ideas Card */}
          {showIdeas && videoIdeas.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-200 mt-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-700">Video Ideas</h2>
                <button 
                  className="text-gray-400 hover:text-gray-700 transition"
                  onClick={() => setShowIdeas(false)}
                  title="Đóng"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {videoIdeas.map((idea, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg shadow-sm hover:shadow-md transition border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="font-semibold mb-1 text-blue-900">{idea.title}</h4>
                      <p className="text-gray-700 text-sm mb-2">{idea.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-semibold">
                          {idea.style}
                        </span>
                        <span className="text-xs text-gray-500">Keywords: {idea.keywords}</span>
                      </div>
                    </div>
                    <button 
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold shadow"
                      onClick={() => handleUseIdea(idea)}
                    >
                      Use This Idea
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;