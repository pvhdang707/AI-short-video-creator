import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import YouTubeService from '../../services/youtubeService';

const YouTubeAnalytics = ({ channelId, channelStats }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (channelId) {
      loadAnalyticsData();
    }
  }, [channelId]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
        // Get analytics data from API
      const data = await YouTubeService.getMyChannelAnalyticsDetailed('30d');
      console.log('YouTube analytics data loaded:', data);
      setAnalyticsData(data);
      
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Unable to load analytics data. Please check YouTube Analytics API access.');
    } finally {
      setLoading(false);
    }
  };

  const data = analyticsData || [];  // Calculate total statistics
  const totalStats = {
    views: data.reduce((sum, item) => sum + (item.views || 0), 0),
    watchTime: data.reduce((sum, item) => sum + (item.watchTime || 0), 0),
    subscribers: channelStats?.subscriber_count || 0 // Lấy từ channel stats thay vì analytics data
  };

  console.log('YouTube Analytics totalStats:', totalStats);
  console.log('channelStats:', channelStats);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatWatchTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
        <button 
          onClick={loadAnalyticsData}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Analytics Data</h3>
          <p className="text-gray-400 mb-4">
            No analytics data available for this channel.
          </p>
          <button 
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  // Data for pie chart
  const pieData = [
    { name: 'Views', value: totalStats.views, color: '#0088FE' },
    { name: 'Watch Time (hours)', value: Math.floor(totalStats.watchTime / 60), color: '#00C49F' },
    { name: 'Subscribers', value: totalStats.subscribers, color: '#FFBB28' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-blue-400">{formatNumber(totalStats.views)}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Watch Time</p>
              <p className="text-2xl font-bold text-green-400">{formatWatchTime(totalStats.watchTime)}</p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Subscribers</p>
              <p className="text-2xl font-bold text-purple-400">{formatNumber(totalStats.subscribers)}</p>
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart - Views Over Time */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value) => [formatNumber(value), 'Views']}
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Watch Time Over Time */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Watch Time Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value) => [formatWatchTime(value), 'Watch Time']}
            />
            <Bar dataKey="watchTime" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Distribution */}
      <div className="bg-gray-800 rounded-lg p-4">
        
      </div>
    </div>
  );
};

export default YouTubeAnalytics;
