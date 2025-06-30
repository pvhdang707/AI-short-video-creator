import React from 'react';

const YouTubeChannelButton = ({ 
  onSetupClick, 
  onClose, 
  compact = false, 
  hasChannel = false, 
  channelData = null 
}) => {
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-red-600/10 to-red-800/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-red-600/20 rounded-lg mr-3">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                {hasChannel ? 'Kênh YouTube của bạn' : 'Chưa có kênh YouTube'}
              </h4>
              <p className="text-red-300 text-xs">
                {hasChannel ? 'Quản lý và truy cập kênh' : 'Cần tạo kênh để upload video'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onSetupClick}
            className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded text-sm hover:from-red-700 hover:to-red-800 transition flex items-center font-medium"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {hasChannel ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              )}
            </svg>
            {hasChannel ? 'Truy cập kênh' : 'Tạo kênh'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-red-600/20 rounded-lg mr-3">
              <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {hasChannel ? 'Kênh YouTube của bạn' : 'Chưa có kênh YouTube'}
              </h3>
              <p className="text-red-300 text-sm">
                {hasChannel ? (
                  channelData?.title ? `${channelData.title} • ${channelData.subscriber_count || 0} subscribers` : 'Quản lý và truy cập kênh'
                ) : (
                  'Cần tạo kênh YouTube để upload video'
                )}
              </p>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            {hasChannel ? (
              'Kênh YouTube của bạn đã được thiết lập. Bạn có thể quản lý video, xem thống kê và tương tác với khán giả.'
            ) : (
              'Để upload video lên YouTube, bạn cần có một kênh YouTube. Hãy tạo kênh YouTube để bắt đầu chia sẻ video của bạn.'
            )}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onSetupClick}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition flex items-center font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {hasChannel ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                )}
              </svg>
              {hasChannel ? 'Truy cập kênh YouTube' : 'Tạo kênh YouTube'}
            </button>
            
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition ml-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default YouTubeChannelButton; 