import React from 'react';

const AutoRefreshStatus = ({ 
  enabled, 
  onToggle, 
  lastRefreshTime, 
  refreshCount, 
  isRefreshing,
  showDetails = false 
}) => {
  const formatTimeAgo = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only"
        />
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-600'
        }`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </div>
        <span className="ml-2 text-sm text-gray-300">Tự động refresh</span>
      </label>
      
      {showDetails && (
        <>
          {lastRefreshTime && (
            <span className="text-xs text-gray-400">
              {formatTimeAgo(lastRefreshTime)}
            </span>
          )}
          {refreshCount > 0 && (
            <span className="text-xs text-blue-400">
              ({refreshCount} lần)
            </span>
          )}
          {isRefreshing && (
            <span className="text-xs text-yellow-400 animate-pulse">
              Đang refresh...
            </span>
          )}
        </>
      )}
      
      {!showDetails && lastRefreshTime && (
        <span className="text-xs text-gray-400">
          {formatTimeAgo(lastRefreshTime)}
        </span>
      )}
    </div>
  );
};

export default AutoRefreshStatus; 