import React from 'react';

const YouTubeVideoList = ({ videos, loading, onVideoClick }) => {
  const formatNumber = (num) => {
    if (!num) return '0';
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
  const getPrivacyBadge = (privacyStatus) => {
    const config = {
      'public': { color: 'bg-green-500/20 border-green-500/30 text-green-400', text: 'Public' },
      'private': { color: 'bg-gray-500/20 border-gray-500/30 text-gray-400', text: 'Private' },
      'unlisted': { color: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400', text: 'Unlisted' }
    };
    
    const badge = config[privacyStatus] || { color: 'bg-gray-500/20 border-gray-500/30 text-gray-400', text: privacyStatus };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full backdrop-blur-sm border font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-700"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-700 rounded mb-3"></div>
              <div className="h-4 bg-gray-700 rounded mb-3 w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl">
        <div className="p-4 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <p className="text-gray-300 text-lg mb-2 font-medium">No YouTube Videos Yet</p>
        <p className="text-gray-500 max-w-md mx-auto">Create videos from your projects and upload them to YouTube to see them here.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div 
          key={video.video_id} 
          className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-red-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 hover:-translate-y-1 cursor-pointer"
          onClick={() => onVideoClick && onVideoClick(video)}
        >
          <div className="relative overflow-hidden">
            <img 
              src={video.thumbnail_url} 
              alt={video.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/images/1.jpeg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-sm text-white font-medium">
              {video.duration}
            </div>
            <div className="absolute top-3 left-3">
              {getPrivacyBadge(video.privacy_status)}
            </div>
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div className="p-5">
            <h4 className="font-semibold text-lg mb-2 line-clamp-2 text-white group-hover:text-red-300 transition-colors duration-300">
              {video.title}
            </h4>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {video.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{formatNumber(video.view_count)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{formatNumber(video.like_count)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{formatNumber(video.comment_count)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(video.published_at)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Watch on YouTube</span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default YouTubeVideoList; 