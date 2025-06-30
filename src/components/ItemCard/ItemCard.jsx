import React from 'react';
import { Link } from 'react-router-dom';

const ItemCard = ({ id, title, image, item, onDelete, onArchive, searchResult = false }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete();
    }
  };

  const handleArchive = (e) => {
    e.preventDefault();
    onArchive();
  };

  // Format số lượt xem
  const formatViewCount = (count) => {
    if (!count && count !== 0) return '';
    if (count >= 1000000000) {
      return (count / 1000000000).toFixed(1) + 'B views';
    } else if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M views';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K views';
    }
    return count + ' views';
  };

  // Format số lượt like
  const formatLikeCount = (count) => {
    if (!count && count !== 0) return '';
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Format thời gian đăng video
  const formatPublishedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays < 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Format thời lượng video
  const formatDuration = (duration) => {
    if (!duration && duration !== 0) return '';
    // Nếu là số (giây), format sang mm:ss hoặc hh:mm:ss
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    // Nếu là string, xử lý định dạng PT15S hoặc PT1H30M45S
    if (typeof duration === 'string') {
      const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!matches) return '';
      const hours = matches[1] ? parseInt(matches[1]) : 0;
      const minutes = matches[2] ? parseInt(matches[2]) : 0;
      const seconds = matches[3] ? parseInt(matches[3]) : 0;
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes || 0}:${seconds.toString().padStart(2, '0')}`;
    }
    // Nếu kiểu khác, trả về chuỗi rỗng
    return '';
  };

  // Xác định platform icon
  const getPlatformIcon = (platform) => {
    switch(platform?.toLowerCase()) {
      case 'youtube':
        return (
          <svg className="w-4 h-4" fill="red" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298 0 .595.038.88.113v-3.49a6.37 6.37 0 00-6.38 6.38A6.37 6.37 0 0010.31 22a6.37 6.37 0 006.37-6.38v-7.3a7.3 7.3 0 004.34 1.42v-3.05h-.433z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
            <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
          </svg>
        );
    }
  };

  // Hàm tạo embed URL cho từng platform
  const getEmbedUrl = (url, platform) => {
    if (!url) return '';
    
    const platformLower = platform?.toLowerCase();
    
    if (platformLower === 'youtube') {
      // Xử lý YouTube URL
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
    } else if (platformLower === 'tiktok') {
      // Xử lý TikTok URL - TikTok không hỗ trợ embed trực tiếp, nhưng có thể sử dụng URL gốc
      return url;
    }
    
    return url;
  };

  // Hàm xác định loại video
  const getVideoType = (platform) => {
    const platformLower = platform?.toLowerCase();
    if (platformLower === 'youtube') return 'video-youtube';
    if (platformLower === 'tiktok') return 'video-tiktok';
    return 'video';
  };

  // Hàm xử lý URL cho TikTok
  const processTikTokUrl = (url) => {
    if (!url) return '';
    // Đảm bảo URL TikTok có định dạng đúng
    if (url.includes('tiktok.com')) {
      return url;
    }
    return url;
  };

  // Thiết kế cho kết quả tìm kiếm
  if (searchResult) {
    const platform = item.platform || (item.url?.includes('youtube') ? 'youtube' : 'tiktok');
    const videoType = getVideoType(platform);
    const embedUrl = getEmbedUrl(item.url, platform);
    const processedUrl = platform === 'tiktok' ? processTikTokUrl(item.url) : item.url;
    // Tạo id duy nhất cho route
    const itemId = item.id || encodeURIComponent(item.url) || item.aweme_id || item.video_id || Math.random().toString(36).substring(2, 10);
    // Ưu tiên link phát trực tiếp cho TikTok
    let tiktokVideoUrl = item.url;
    if (platform === 'tiktok') {
      tiktokVideoUrl = item.hdplay || item.play || item.wmplay || item.url;
    }
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-gray-600 flex flex-col">
        <Link to={`/item/${itemId}`} state={{ item: {
          id: itemId,
          title: item.title,
          description: item.description,
          mediaUrl: tiktokVideoUrl,
          thumbnailUrl: item.thumbnail_url || item.cover,
          embedUrl: embedUrl,
          type: videoType,
          prompt: item.description || '',
          options: {
            platform: platform,
            channel: typeof item.channel_name === 'object' ? (item.channel_name.nickname || item.channel_name.unique_id || '') : (item.channel_name || (item.author && (item.author.nickname || item.author.unique_id)) || ''),
            duration: formatDuration(item.duration) || '',
            publishedAt: item.published_at ? new Date(item.published_at).toLocaleDateString() : '',
            videoId: platform === 'youtube' ? (item.url?.split('v=')[1]?.split('&')[0] || '') : '',
          },
          likes: item.like_count || item.likes || 0,
          views: item.view_count || item.views || 0,
          createdAt: item.published_at ? new Date(item.published_at).toLocaleDateString() : '',
          externalUrl: processedUrl,
          videoId: platform === 'youtube' ? (item.url?.split('v=')[1]?.split('&')[0] || '') : '',
          channel_name: typeof item.channel_name === 'object' ? (item.channel_name.nickname || item.channel_name.unique_id || '') : (item.channel_name || (item.author && (item.author.nickname || item.author.unique_id)) || ''),
        }}} className="block h-full">
          <div className="relative">
            {/* Video thumbnail */}
            <img
              src={image || item.thumbnail_url || item.cover || 'https://via.placeholder.com/300x200'}
              alt={title}
              className="w-full h-44 object-cover"
            />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-40 rounded-full p-3 transition-transform transform hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              </div>
            </div>
            
            {/* Duration badge */}
            {item.duration && (
              <div className="absolute bottom-2 right-2">
                <span className="bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs font-medium">
                  {formatDuration(item.duration)}
                </span>
              </div>
            )}
            
            {/* Platform badge */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                platform === 'youtube' 
                  ? 'bg-red-600 text-white' 
                  : platform === 'tiktok'
                  ? 'bg-black text-white'
                  : 'bg-gray-600 text-white'
              }`}>
                {platform === 'youtube' ? 'YouTube' : platform === 'tiktok' ? 'TikTok' : platform?.toUpperCase()}
              </span>
            </div>
            
            {/* Badge shorts nếu là video ngắn (chỉ cho YouTube) */}
            {platform === 'youtube' && typeof item.duration === "string" && item.duration.includes("PT") && parseInt(item.duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/)[1] || 0) < 1 && (
              <div className="absolute top-2 right-2">
                <span className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  #SHORTS
                </span>
              </div>
            )}
          </div>
          
          <div className="p-3 flex-grow">
            {/* Title */}
            <h3 className="text-base font-medium line-clamp-2 text-white mb-2" title={title}>
              {title}
            </h3>
            
            {/* Meta info: views, channel, age */}
            <div className="flex flex-col gap-1">
              {/* Channel name with platform icon */}
              <div className="flex items-center text-sm text-gray-300 gap-1">
                {getPlatformIcon(platform)}
                <span className="truncate max-w-[180px]">{
                  typeof item.channel_name === 'object'
                    ? (item.channel_name.nickname || item.channel_name.unique_id || '')
                    : (item.channel_name || (item.author && (item.author.nickname || item.author.unique_id)) || '')
                }</span>
              </div>
              
              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{formatViewCount(item.view_count || item.views)}</span>
                {(item.like_count !== undefined || item.likes !== undefined) && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3m7-2V5a3 3 0 00-3-3l-4 9h12a2 2 0 012 2v7a2 2 0 01-2 2h-9a2 2 0 01-2-2v-4"></path>
                    </svg>
                    {formatLikeCount(item.like_count || item.likes)}
                  </span>
                )}
                <span>{formatPublishedDate(item.published_at)}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
  
  // Thiết kế cho card thường
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link to={`/project/${id}`}>
        <div className="relative">
          <img
            src={image || 'https://via.placeholder.com/300x200'}
            alt={title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {onArchive && (
              <button
                onClick={handleArchive}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition"
                title="Archive"
              >
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition"
                title="Delete"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs ${
              item.status === 'ACTIVE' ? 'bg-green-500' :
              item.status === 'COMPLETED' ? 'bg-blue-500' :
              item.status === 'PROCESSING' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}>
              {item.status}
            </span>
            <span className="text-sm text-gray-400">
              {new Date(item.created_at || item.published_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ItemCard;