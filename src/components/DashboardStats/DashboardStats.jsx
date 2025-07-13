import React from 'react';
import YouTubeChannelButton from '../YouTubeChannelButton';

const DashboardStats = ({ stats }) => {
  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-yellow-400';
      case 'draft':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  // Kiểm tra nếu stats không tồn tại
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl">
            <p className="text-gray-400">Loading stats...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-blue-500/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Total Projects</h3>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">{stats.totalScripts || 0}</p>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" style={{width: '100%'}}></div>
          </div>
        </div>
        
        <div className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-yellow-500/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-yellow-600/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 rounded-lg mr-3">
              <svg className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Draft Projects</h3>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">{stats.draftScripts || 0}</p>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-500" style={{width: `${stats.totalScripts > 0 ? (stats.draftScripts / stats.totalScripts) * 100 : 0}%`}}></div>
          </div>
        </div>
        
        <div className="group bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-green-500/50 p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-600/20">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-lg mr-3">
              <svg className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-gray-300 text-sm font-medium">Completed Projects</h3>
          </div>
          <p className="text-3xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">{stats.completedScripts || 0}</p>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" style={{width: `${stats.totalScripts > 0 ? (stats.completedScripts / stats.totalScripts) * 100 : 0}%`}}></div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default DashboardStats; 