import React from 'react';
import YouTubeChannelButton from '../YouTubeChannelButton';

const YouTubeStats = ({ stats, loading, channelId }) => {
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
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 p-6 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-3"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }
  return (
    <div className="space-y-6 mb-8">
      {/* Channel Info */}
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 hover:border-red-500/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <img 
                src={stats.avatar_url} 
                alt={stats.title}
                className="w-16 h-16 rounded-full mr-4 ring-2 ring-red-500/30"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{stats.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 max-w-md">{stats.description}</p>
              <div className="flex items-center mt-2 text-gray-500 text-xs">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Created on {formatDate(stats.published_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-3xl font-bold text-red-400">{formatNumber(stats.subscriber_count)}</div>
              <div className="text-sm text-gray-400 font-medium">Subscribers</div>
            </div>
            
            <button
              className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30 hover:-translate-y-0.5 disabled:opacity-50"
              disabled={!stats.channel_id}
             onClick={() => window.open(`https://www.youtube.com/channel/${stats.channel_id}`, '_blank')}>
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Go to Channel</span>
            </button>

          </div>
        </div>
      </div>      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-blue-500/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Total Views</h3>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">{formatNumber(stats.view_count)}</p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" style={{width: '100%'}}></div>
          </div>
        </div>
        
        <div className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-green-500/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-600/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-lg mr-3">
              <svg className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
              </svg>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Total Videos</h3>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">{formatNumber(stats.video_count)}</p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" style={{width: `${Math.min((stats.video_count / 100) * 100, 100)}%`}}></div>
          </div>
        </div>
        
        <div className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-purple-500/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded-lg mr-3">
              <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Average Views</h3>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
            {stats.video_count > 0 ? formatNumber(Math.round(stats.view_count / stats.video_count)) : '0'}
          </p>
          <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500" style={{width: `${stats.video_count > 0 ? Math.min((Math.round(stats.view_count / stats.video_count) / 10000) * 100, 100) : 0}%`}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeStats; 