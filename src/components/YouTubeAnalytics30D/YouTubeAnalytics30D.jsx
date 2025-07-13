import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import YouTubeService from '../../services/youtubeService';

const YouTubeAnalytics30D = ({ channelId, channelStats }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartMode, setChartMode] = useState('net'); // 'net', 'detailed'

  useEffect(() => {
    loadAnalyticsData();
  }, [channelId]);
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy dữ liệu tổng quan với time range 30d
      const summaryData = await YouTubeService.getMyChannelSimpleAnalytics('30d');
      console.log('YouTube analytics summary (30d) loaded:', summaryData);
      
      // Lấy dữ liệu theo ngày cho biểu đồ với time range 30d  
      const chartData = await YouTubeService.getMyChannelAnalyticsForChart('30d');
      console.log('YouTube analytics chart data (30d) loaded:', chartData);
      
      // Kết hợp dữ liệu
      const combinedData = {
        summary: summaryData,
        chartData: chartData
      };
      
      setAnalyticsData(combinedData);
      
    } catch (err) {
      console.error('Error loading 30d analytics data:', err);
      setError('Unable to load 30-day analytics data. Please check your YouTube channel access or try again later.');
    } finally {
      setLoading(false);
    }
  };  const testAnalyticsAccess = async () => {
    try {
      const result = await YouTubeService.testAnalyticsAccess();
      console.log('Analytics access test result:', result);
      
      let message = `🔍 YouTube Analytics Access Test\n\n`;
      message += `Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}\n`;
      message += `Channel ID: ${result.channel_id || 'Not found'}\n`;
      message += `Data Points: ${result.data_points || 0}\n\n`;
      
      if (result.eligibility) {
        message += `📊 Channel Requirements:\n`;
        if (result.eligibility.requirements_met?.length > 0) {
          message += `${result.eligibility.requirements_met.join('\n')}\n`;
        }
        if (result.eligibility.requirements_missing?.length > 0) {
          message += `${result.eligibility.requirements_missing.join('\n')}\n`;
        }
        message += `\n`;
      }
      
      message += `Message: ${result.message}\n`;
      
      if (!result.success) {
        message += `\nError: ${result.error}\n`;
        if (result.eligibility?.recommendations?.length > 0) {
          message += `\n💡 Recommendations:\n`;
          message += `${result.eligibility.recommendations.join('\n• ')}\n`;
        }
      }
      
      alert(message);
    } catch (err) {
      console.error('Analytics test failed:', err);
      alert(`Analytics Test Failed: ${err.message}`);
    }
  };
  const data = analyticsData?.chartData || [];
  const summary = analyticsData?.summary || {};
  
  // Fallback to channel stats if no analytics data
  const hasAnalyticsData = summary.total_views > 0 || summary.data_points > 0;
  const fallbackToChannelStats = !hasAnalyticsData && channelStats;
  
  const totalStats = {
    views: summary.total_views || (fallbackToChannelStats ? (channelStats.view_count || 0) : 0),
    subscribers: summary.total_subscribers || 0,  // Backward compatibility
    subscribersGained: summary.total_subscribers_gained || 0,
    subscribersLost: summary.total_subscribers_lost || 0,
    netSubscribers: summary.net_subscribers || 0,
  };

  console.log('YouTube Analytics 30D totalStats:', totalStats);
  console.log('chartData length:', data.length);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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

  if (!analyticsData || (!data || data.length === 0)) {
    return (
      <div className="text-center p-8">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No 30-Day Analytics Data</h3>
          <p className="text-gray-400 mb-4">
            No analytics data available for the last 30 days.
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
  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">30-Day YouTube Analytics</h2>
          <p className="text-gray-400">Views and subscriber analytics for the last 30 days</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={testAnalyticsAccess}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
          >
            Test Access
          </button>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>      {/* Analytics Warning */}
      {(fallbackToChannelStats || (totalStats.views === 0 && channelStats?.view_count > 0)) && (
        <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-orange-300 font-medium">Limited Analytics Data</p>
              <p className="text-orange-200 text-sm">
                {channelStats && (
                  <>
                    Channel has {channelStats.subscriber_count} subscriber{channelStats.subscriber_count !== 1 ? 's' : ''} and {channelStats.view_count} total view{channelStats.view_count !== 1 ? 's' : ''}. 
                    {channelStats.subscriber_count < 1000 && (
                      <> YouTube Analytics API requires 1000+ subscribers for detailed metrics.</>
                    )}
                    {totalStats.views === 0 && channelStats.view_count > 0 && (
                      <> No views in the last 30 days or data not yet processed.</>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}{/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Views (30d)</p>
              <p className="text-2xl font-bold text-blue-400">{formatNumber(totalStats.views)}</p>
              {channelStats && (
                <p className="text-xs text-gray-500 mt-1">
                  Channel Total: {formatNumber(channelStats.view_count || 0)}
                  {totalStats.views === 0 && channelStats.view_count > 0 && (
                    <span className="text-orange-400"> (No recent analytics data)</span>
                  )}
                </p>
              )}
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New Subscribers (30d)</p>
              <p className="text-2xl font-bold text-green-400">+{formatNumber(totalStats.subscribersGained)}</p>
              <p className="text-xs text-gray-500 mt-1">Subscribers gained</p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Lost Subscribers (30d)</p>
              <p className="text-2xl font-bold text-red-400">-{formatNumber(totalStats.subscribersLost)}</p>
              <p className="text-xs text-gray-500 mt-1">Subscribers lost</p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Net Change (30d)</p>
              <p className={`text-2xl font-bold ${totalStats.netSubscribers >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalStats.netSubscribers >= 0 ? '+' : ''}{formatNumber(totalStats.netSubscribers)}
              </p>
              {channelStats && (
                <p className="text-xs text-gray-500 mt-1">Total: {formatNumber(channelStats.subscriber_count)}</p>
              )}
            </div>
            <div className={`w-8 h-8 ${totalStats.netSubscribers >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center`}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {totalStats.netSubscribers >= 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>      <div className="text-xs text-gray-400 mt-2 mb-4">
        * Displaying analytics data for the last 30 days. Data may be delayed 1-2 days due to YouTube Analytics API processing.<br/>
        * "Gained" shows new subscribers, "Lost" shows unsubscribes, "Net Change" shows the actual growth/decline.
      </div>

      {/* Line Chart - Views Over Time */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Views Over Time (Last 30 Days)</h3>
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
      </div>      {/* Line Chart - Subscribers Over Time (YouTube Style) */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Subscribers Over Time (Last 30 Days)</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartMode('net')}
              className={`px-3 py-1 text-xs rounded transition ${
                chartMode === 'net' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Net Change
            </button>
            <button
              onClick={() => setChartMode('detailed')}
              className={`px-3 py-1 text-xs rounded transition ${
                chartMode === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
        
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
              formatter={(value, name) => {
                if (chartMode === 'net') {
                  return [formatNumber(value), 'Net Subscribers'];
                } else {
                  if (name === 'subscribers') return [formatNumber(value), 'Gained'];
                  if (name === 'subscribersLost') return [formatNumber(value), 'Lost'];
                  if (name === 'netSubscribers') return [formatNumber(value), 'Net Change'];
                  return [formatNumber(value), name];
                }
              }}
            />
            
            {chartMode === 'net' ? (
              <Line 
                type="monotone" 
                dataKey="netSubscribers" 
                stroke="#60A5FA" 
                strokeWidth={2}
                dot={{ fill: '#60A5FA', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#60A5FA', strokeWidth: 2 }}
              />
            ) : (
              <>
                <Line 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  name="subscribers"
                />
                <Line 
                  type="monotone" 
                  dataKey="subscribersLost" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                  name="subscribersLost"
                />
                <Line 
                  type="monotone" 
                  dataKey="netSubscribers" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="netSubscribers"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
        
        {chartMode === 'detailed' && (
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-gray-300">Gained</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="text-gray-300">Lost</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span className="text-gray-300">Net Change</span>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-400">
          {chartMode === 'net' 
            ? '* Net subscriber change (gained - lost) per day. Positive values show growth, negative values show decline.'
            : '* Detailed view showing gained, lost, and net subscriber changes per day.'
          }
        </div>
      </div>
    </div>
  );
};

export default YouTubeAnalytics30D;
