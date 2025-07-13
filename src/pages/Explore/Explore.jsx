import React, { useState, useEffect, useRef } from "react";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import ItemCard from "../../components/ItemCard/ItemCard";
import { searchVideos } from "../../services/videoSearchService";
import { getTiktokTrendingKeywords, getTrendingKeywords } from "../../services/trendingKeywordService";

// Định nghĩa mảng keyword TikTok cứng
const TIKTOK_KEYWORDS = [
  "trending", "viral", "funny", "dance", "music",
  "comedy", "food", "travel", "beauty", "fashion",
  "gaming", "sports", "education", "lifestyle", "entertainment"
];

const Explore = () => {  
  // State quản lý input và file - tạm thời comment out vì chưa sử dụng
  // const [prompt, setPrompt] = useState("");
  // const [selectedFile, setSelectedFile] = useState(null);
  // const [previewUrl, setPreviewUrl] = useState(null);
  
  // Khóa lưu trữ cho sessionStorage
  const SEARCH_STATE_KEY = 'explore_search_state';
  const KEYWORDS_STATE_KEY = 'explore_keywords_state';
  const KEYWORDS_TIMESTAMP_KEY = 'explore_keywords_timestamp';

  // Hàm lấy trạng thái lưu trữ từ sessionStorage
  const getSavedSearchState = () => {
    try {
      const savedState = sessionStorage.getItem(SEARCH_STATE_KEY);
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error('Error reading saved search state:', error);
      return null;
    }
  };

  // Hàm lấy keywords từ sessionStorage
  const getSavedKeywordsState = () => {
    try {
      const savedKeywords = sessionStorage.getItem(KEYWORDS_STATE_KEY);
      const timestamp = sessionStorage.getItem(KEYWORDS_TIMESTAMP_KEY);
      
      if (!savedKeywords || !timestamp) return null;
      
      // Kiểm tra xem keywords có quá cũ không (30 phút)
      const now = Date.now();
      const savedTime = parseInt(timestamp);
      const thirtyMinutes = 30 * 60 * 1000; // 30 phút
      
      if (now - savedTime > thirtyMinutes) {
        // Keywords quá cũ, xóa khỏi storage
        sessionStorage.removeItem(KEYWORDS_STATE_KEY);
        sessionStorage.removeItem(KEYWORDS_TIMESTAMP_KEY);
        return null;
      }
      
      return JSON.parse(savedKeywords);
    } catch (error) {
      console.error('Error reading saved keywords state:', error);
      return null;
    }
  };

  // Hàm lưu keywords vào sessionStorage
  const saveKeywordsState = (keywords) => {
    try {
      sessionStorage.setItem(KEYWORDS_STATE_KEY, JSON.stringify(keywords));
      sessionStorage.setItem(KEYWORDS_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving keywords state:', error);
    }
  };

  // State quản lý UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [isLoadingKeywords, setIsLoadingKeywords] = useState(true); // tạm thời comment
  const [activeKeywordTab, setActiveKeywordTab] = useState('all'); // 'all', 'tiktok', 'youtube'
  
  // Ref để track việc đã restore state hay chưa
  const hasRestoredState = useRef(false);

  // State cho input search và kết quả, khôi phục từ sessionStorage nếu có
  const savedState = getSavedSearchState();
  const savedKeywords = getSavedKeywordsState();
  
  const [search, setSearch] = useState(savedState?.search || "");
  const [selectedPlatform, setSelectedPlatform] = useState(savedState?.selectedPlatform || "all");
  const [searchResults, setSearchResults] = useState(savedState?.searchResults || []);
  const [platformResults, setPlatformResults] = useState(savedState?.platformResults || {});
  const [resultFilter, setResultFilter] = useState("all"); // Bộ lọc kết quả: 'all', 'youtube', 'tiktok', 'google'
  const [displayLimit, setDisplayLimit] = useState(12); // Số lượng kết quả hiển thị ban đầu
  const [keywordDisplayLimit, setKeywordDisplayLimit] = useState(10); // Số lượng keywords hiển thị ban đầu
  const [keywordLimits, setKeywordLimits] = useState({
    tiktok: 10,
    youtube: 10
  }); // Quản lý giới hạn hiển thị riêng cho từng platform
  // const [trendingVideos, setTrendingVideos] = useState([]); // tạm thời comment
  // const [trendHints, setTrendHints] = useState([]); // tạm thời comment
  const [platformKeywords, setPlatformKeywords] = useState({
    tiktok: TIKTOK_KEYWORDS,
    youtube: savedKeywords?.youtube || [],
    loading: {
      tiktok: false,
      youtube: !savedKeywords?.youtube
    }
  });

  // Danh sách các nền tảng tìm kiếm
  const platforms = [
    { id: "all", name: "All Platforms" },
    { id: "youtube", name: "YouTube" },
    { id: "tiktok", name: "TikTok" },
  ];

  // Load trending keywords khi component mount
  useEffect(() => {
    // Chỉ load YouTube keywords nếu chưa có trong storage
    if (!savedKeywords?.youtube) {
      loadYouTubeKeywords();
    }
    // TikTok luôn dùng mảng cứng, không cần load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // Hàm refresh keywords
  const refreshKeywords = () => {
    // Xóa keywords cũ khỏi storage
    sessionStorage.removeItem(KEYWORDS_STATE_KEY);
    sessionStorage.removeItem(KEYWORDS_TIMESTAMP_KEY);
    
    // Reset loading state
    setPlatformKeywords(prev => ({
      ...prev,
      tiktok: TIKTOK_KEYWORDS,
      youtube: [],
      loading: { tiktok: false, youtube: true }
    }));
    // Load lại YouTube keywords
    loadYouTubeKeywords();
  };

  // Hàm load YouTube keywords
  const loadYouTubeKeywords = () => {
    setPlatformKeywords(prev => ({ ...prev, loading: { ...prev.loading, youtube: true } }));
    getTrendingKeywords('VN', 15)
      .then((keywords) => {
        console.log('YouTube trending keywords:', keywords);
        setPlatformKeywords(prev => ({ 
          ...prev, 
          youtube: keywords,
          loading: { ...prev.loading, youtube: false }
        }));
        // Lưu vào storage
        saveKeywordsState({
          tiktok: platformKeywords.tiktok,
          youtube: keywords
        });
      })
      .catch((error) => {
        console.error('Error loading YouTube trending keywords:', error);
        const fallbackKeywords = ["gaming", "music", "comedy", "education", "lifestyle"];
        setPlatformKeywords(prev => ({ 
          ...prev, 
          youtube: fallbackKeywords,
          loading: { ...prev.loading, youtube: false }
        }));
        // Lưu fallback keywords vào storage
        saveKeywordsState({
          tiktok: platformKeywords.tiktok,
          youtube: fallbackKeywords
        });
      });
  };

  // Tự động thực hiện tìm kiếm lại nếu có dữ liệu được lưu
  useEffect(() => {
    // Chỉ restore state một lần khi component mount
    if (!hasRestoredState.current && savedState && savedState.search) {
      hasRestoredState.current = true;
      // Tự động áp dụng bộ lọc đã lưu
      setSearch(savedState.search);
      setSelectedPlatform(savedState.selectedPlatform);
      setSearchResults(savedState.searchResults);
      if (savedState.platformResults) {
        setPlatformResults(savedState.platformResults);
      }
    }
  }, [savedState]); // Chỉ phụ thuộc vào savedState

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsLoading(true);
    setError(null);
    setDisplayLimit(12); // Reset display limit khi search mới

    try {
      const results = await searchVideos(search, selectedPlatform);
      
      // Kiểm tra nếu có lỗi từ API
      if (results.error) {
        setError(results.error);
        setSearchResults([]);
        setPlatformResults({});
      } else {
        setSearchResults(results.videos || []);
        // Lưu kết quả theo nền tảng nếu có
        if (results.platformResults) {
          setPlatformResults(results.platformResults);
        } else {
          setPlatformResults({});
        }
      }

      // Lưu trạng thái tìm kiếm vào sessionStorage
      sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify({
        search,
        selectedPlatform,
        searchResults: results.videos || [],
        platformResults: results.platformResults || {}
      }));
    } catch (err) {
      console.error('Search error:', err);
      setError("An error occurred while searching. Please try again later.");
      setSearchResults([]);
      setPlatformResults({});
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm lọc kết quả theo nền tảng
  const getFilteredResults = () => {
    let results = [];
    
    if (resultFilter === "all") {
      results = searchResults;
    } else {
      // Nếu có platformResults, lọc theo nền tảng
      if (platformResults[resultFilter]) {
        results = platformResults[resultFilter].videos || [];
      } else {
        // Fallback: lọc từ searchResults dựa trên thuộc tính platform
        results = searchResults.filter(video => video.platform === resultFilter);
      }
    }
    
    // Giới hạn số lượng kết quả hiển thị
    return results.slice(0, displayLimit);
  };

  // Hàm lấy tổng số kết quả (không bị giới hạn bởi displayLimit)
  const getTotalFilteredResults = () => {
    if (resultFilter === "all") {
      return searchResults.length;
    }
    
    if (platformResults[resultFilter]) {
      return platformResults[resultFilter].videos?.length || 0;
    }
    
    return searchResults.filter(video => video.platform === resultFilter).length;
  };

  // Hàm hiển thị thêm kết quả
  const loadMoreResults = () => {
    setDisplayLimit(prev => prev + 12);
  };

  // Hàm hiển thị thêm keywords
  const loadMoreKeywords = (platform) => {
    if (platform === 'all') {
      setKeywordDisplayLimit(prev => prev + 10);
    } else {
      setKeywordLimits(prev => ({
        ...prev,
        [platform]: prev[platform] + 10
      }));
    }
  };

  // Hàm xóa kết quả tìm kiếm
  const clearSearchResults = () => {
    setSearchResults([]);
    setPlatformResults({});
    setSearch("");
    setResultFilter("all");
    setDisplayLimit(12); // Reset display limit
    setKeywordLimits({ tiktok: 10, youtube: 10 }); // Reset keyword limits
    sessionStorage.removeItem(SEARCH_STATE_KEY);
  };

  

  // Function to get keywords update time
  const getKeywordsUpdateTime = () => {
    try {
      const timestamp = sessionStorage.getItem(KEYWORDS_TIMESTAMP_KEY);
      if (!timestamp) return null;
      
      const date = new Date(parseInt(timestamp));
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just updated';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    } catch (error) {
      return null;
    }
  };

  // Hàm xử lý thay đổi filter kết quả
  const handleFilterChange = (newFilter) => {
    setResultFilter(newFilter);
    setDisplayLimit(12); // Reset display limit khi thay đổi filter
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white h-full">
      {/* Header section */}
      <div className="w-full pt-12 pb-12 z-10 bg-gradient-to-b from-gray-900 to-transparent transition-all duration-300 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating video icons */}
          <div className="absolute top-20 left-10 w-8 h-8 text-blue-400/20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </div>
          <div className="absolute top-32 right-20 w-6 h-6 text-cyan-400/20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="absolute top-16 left-1/3 w-10 h-10 text-blue-500/20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          
          {/* Additional floating elements */}
          <div className="absolute top-40 right-10 w-4 h-4 text-cyan-400/30 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="absolute top-60 left-20 w-5 h-5 text-blue-400/25 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          {/* Gradient orbs */}
          <div className="absolute top-10 right-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-600/10 to-blue-700/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-50 left-1/2 w-20 h-20 bg-gradient-to-r from-cyan-500/8 to-blue-500/8 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Sparkle effects - more sparkles */}
          <div className="absolute top-40 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-60 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-80 left-1/4 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute top-30 right-1/2 w-1 h-1 bg-cyan-500 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute top-70 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1.8s' }}></div>
          <div className="absolute top-90 right-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
          
          {/* Particle trail effects */}
          <div className="absolute top-20 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute top-25 left-1/4 w-0.5 h-0.5 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute top-30 left-1/4 w-0.5 h-0.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0.6s' }}></div>
        </div>

        <div className="mx-auto text-center px-4 relative z-10">
          <div className="relative mb-8">
            {/* Main title with enhanced effects */}
            <div className="relative group">
              <h1 className="font-bold py-6 mb-2 font-mono text-6xl bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                Explore Trending Creations
              </h1>
              
              {/* Multiple shadow layers for depth */}
              <div className="absolute inset-0 font-bold py-6 mb-2 font-mono text-6xl bg-gradient-to-r from-blue-600/30 via-cyan-600/30 to-blue-700/30 bg-clip-text text-transparent blur-sm -z-10 " >
                Explore Trending Creations
              </div>
              {/* <div className="absolute inset-0 font-bold py-6 mb-2 font-mono text-6xl bg-gradient-to-r from-blue-800/20 via-purple-800/20 to-pink-800/20 bg-clip-text text-transparent blur-md -z-20 animate-pulse" style={{ animationDelay: '1s' }}>
                Explore Trending Creations
              </div> */}
              
                {/* Glowing border effect */}
              {/* <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div> */}
              
              {/* Shimmer effect on title */}
              {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000"></div> */}
            </div>
            
            {/* Enhanced subtitle with sparkles */}
            <p className="text-gray-300 text-lg font-medium mt-4 relative">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                Discover the most popular content across platforms
              </span>
              <span className="ml-2 text-cyan-400 animate-pulse">✨</span>
              <span className="ml-1 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }}>✨</span>
              <span className="ml-1 text-cyan-500 animate-pulse" style={{ animationDelay: '1s' }}>✨</span>
            </p>
            
            {/* Enhanced decorative line with sparkles */}
            <div className="relative mt-6">
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 mx-auto rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-32 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 mx-auto rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Sparkles around the line */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -top-1 right-1/4 w-1 h-1 bg-cyan-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </div>
            
            {/* Floating action indicators with enhanced effects */}
            <div className="flex justify-center space-x-8 mt-6">
              <div className="flex items-center space-x-2 text-blue-400/70 animate-bounce group" style={{ animationDelay: '0s', animationDuration: '2s' }}>
                <div className="p-1 bg-blue-500/20 rounded-full group-hover:bg-blue-500/40 transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium group-hover:text-blue-300 transition-colors duration-300">Search</span>
              </div>
              <div className="flex items-center space-x-2 text-cyan-400/70 animate-bounce group" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
                <div className="p-1 bg-cyan-500/20 rounded-full group-hover:bg-cyan-500/40 transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium group-hover:text-cyan-300 transition-colors duration-300">Discover</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-500/70 animate-bounce group" style={{ animationDelay: '1s', animationDuration: '2s' }}>
                <div className="p-1 bg-blue-600/20 rounded-full group-hover:bg-blue-600/40 transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium group-hover:text-blue-400 transition-colors duration-300">Create</span>
              </div>
            </div>
          </div>

          {/* Input search + nút search */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6 gap-3">
              <div className="relative flex-1 group">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search videos, keywords..."
                  className="w-full px-6 py-4 text-lg bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-700/50 group-hover:border-blue-400/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e);
                    }
                  }}
                />
                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 via-cyan-600/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                {/* Search icon inside input */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Sparkle effect on focus */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-focus-within:opacity-100 group-focus-within:animate-ping transition-opacity duration-300"></div>
              </div>
              
              <button
                className="group flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 min-w-[120px] relative overflow-hidden"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Sparkle effects around button */}
                <div className="absolute -top-1 -left-1 w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
                <div className="absolute -top-1 -right-1 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-cyan-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300" style={{ animationDelay: '0.6s' }}></div>
                
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </>
                )}
              </button>
              
              {searchResults.length > 0 && (
                <button
                  className="group flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/50 hover:to-gray-500/50 border border-gray-600/30 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:border-gray-500 flex-shrink-0 min-w-[100px] hover:shadow-lg hover:shadow-gray-600/30 hover:-translate-y-0.5"
                  onClick={clearSearchResults}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Platform selector */}
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
            {/* {platforms.map((platform) => (
              <button
                key={platform.id}
                className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  selectedPlatform === platform.id
                    ? 'bg-gradient-to-r from-blue-600/30 to-blue-700/30 text-white shadow-lg shadow-blue-600/20 border border-blue-600/40' 
                    : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 border border-gray-600/30 hover:border-gray-500'
                }`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                {selectedPlatform === platform.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-blue-600/20 animate-pulse"></div>
                )}
                <span className="relative z-10 font-medium">{platform.name}</span>
                {selectedPlatform === platform.id && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-full"></div>
                )}
              </button>
            ))} */}
          </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="max-w-6xl mx-auto mb-6">
              <div className="bg-gradient-to-r from-red-600/20 to-red-700/20 backdrop-blur-sm border border-red-600/30 rounded-xl p-4 text-red-400">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-white">Search Error</span>
                    <p className="text-sm text-red-300 mt-1">{error}</p>
                  </div>
                </div>
                <div className="ml-11">
                  <p className="text-xs text-red-300/80">
                    💡 Suggestion: Try searching with different keywords or select another platform
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phần hiển thị trending keywords */}
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-400 flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span>Trending Keywords from Platforms</span>
              </h3>
              <div className="flex items-center space-x-3">
                {getKeywordsUpdateTime() && (
                  <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-lg border border-gray-600/30">
                    Updated: {getKeywordsUpdateTime()}
                  </span>
                )}
                <button
                  onClick={refreshKeywords}
                  className="group flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                  title="Refresh keywords"
                >
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            {/* Platform Tabs */}
            {/* <div className="flex justify-center mb-4">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-1 flex">
                <button
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeKeywordTab === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveKeywordTab('all')}
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>All</span>
                </button>
                
                <button
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeKeywordTab === 'youtube'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveKeywordTab('youtube')}
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube</span>
                </button>
                
                <button
                  className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeKeywordTab === 'tiktok'
                      ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg shadow-pink-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                  onClick={() => setActiveKeywordTab('tiktok')}
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  <span>TikTok</span>
                </button>
              </div>
            </div> */}

            {/* Keywords Display */}
            <div className="space-y-4">
              {/* TikTok Keywords */}
              {(activeKeywordTab === 'tiktok' || activeKeywordTab === 'all') && (
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center">
                      <div className="p-2 bg-gradient-to-r from-pink-600/20 to-red-600/20 rounded-lg mr-3">
                        <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-white font-medium">TikTok Trending</span>
                        <span className="ml-2 px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded-full border border-pink-500/30">
                          {platformKeywords.tiktok.length}
                        </span>
                      </div>
                    </h4>
                    {platformKeywords.loading.tiktok && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                        <span className="text-xs text-gray-400">Loading...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {platformKeywords.loading.tiktok ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                        <span className="text-gray-400">Loading TikTok keywords...</span>
                      </div>
                    ) : (
                      <>
                        {platformKeywords.tiktok.slice(0, keywordLimits.tiktok).map((keyword, index) => (
                          <button
                            key={`tiktok-${index}`}
                            className="group px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-red-500/20 hover:from-pink-500/30 hover:to-red-500/30 border border-pink-500/30 hover:border-pink-400 rounded-xl cursor-pointer transition-all duration-300 text-white text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                            onClick={() => {
                              setSearch(keyword);
                              // setSelectedPlatform('tiktok');
                              handleSubmit({ preventDefault: () => {} });
                            }}
                          >
                            <span className="flex items-center space-x-1">
                              <span className="text-pink-400 group-hover:text-pink-300">#</span>
                              <span className="group-hover:text-white">{keyword}</span>
                            </span>
                          </button>
                        ))}
                        {platformKeywords.tiktok.length > keywordLimits.tiktok && (
                          <button
                            onClick={() => loadMoreKeywords('tiktok')}
                            className="group flex items-center space-x-1 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 hover:border-gray-500 rounded-xl text-gray-300 hover:text-white text-sm font-medium transition-all duration-300"
                          >
                            <svg className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>+{platformKeywords.tiktok.length - keywordLimits.tiktok}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* YouTube Keywords */}
              {(activeKeywordTab === 'youtube' || activeKeywordTab === 'all') && (
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-300 flex items-center">
                      <div className="p-2 bg-gradient-to-r from-red-600/20 to-red-700/20 rounded-lg mr-3">
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-white font-medium">YouTube Trending</span>
                        <span className="ml-2 px-2 py-0.5 bg-red-600/20 text-red-400 text-xs rounded-full border border-red-600/30">
                          {platformKeywords.youtube.length}
                        </span>
                      </div>
                    </h4>
                    {platformKeywords.loading.youtube && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        <span className="text-xs text-gray-400">Loading...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {platformKeywords.loading.youtube ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        <span className="text-gray-400">Loading YouTube keywords...</span>
                      </div>
                    ) : (
                      <>
                        {platformKeywords.youtube.slice(0, keywordLimits.youtube).map((keyword, index) => {
                          // Loại bỏ dấu # nếu keyword đã có sẵn
                          const cleanKeyword = keyword.startsWith('#') ? keyword.slice(1) : keyword;
                          return (
                            <button
                              key={`youtube-${index}`}
                              className="group px-3 py-1.5 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 border border-red-600/30 hover:border-red-500 rounded-xl cursor-pointer transition-all duration-300 text-white text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5"
                              onClick={() => {
                                setSearch(cleanKeyword);
                                // setSelectedPlatform('youtube');
                                handleSubmit({ preventDefault: () => {} });
                              }}
                            >
                              <span className="flex items-center space-x-1">
                                <span className="text-red-400 group-hover:text-red-300">#</span>
                                <span className="group-hover:text-white">{cleanKeyword}</span>
                              </span>
                            </button>
                          );
                        })}
                        {platformKeywords.youtube.length > keywordLimits.youtube && (
                          <button
                            onClick={() => loadMoreKeywords('youtube')}
                            className="group flex items-center space-x-1 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 hover:border-gray-500 rounded-xl text-gray-300 hover:text-white text-sm font-medium transition-all duration-300"
                          >
                            <svg className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>+{platformKeywords.youtube.length - keywordLimits.youtube}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8 ">
          {/* tạo đường kẻ ngang */}
          <div className="h-px bg-gray-700/50 my-4"></div>
          <div className="flex justify-between items-center mb-4 ">
            <SectionTitle title="Search Results" />
            
            {/* Bộ lọc kết quả theo nền tảng - chỉ hiển thị khi search "all" */}
            {selectedPlatform === "all" && Object.keys(platformResults).length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 font-medium">Filter by:</span>
                <div className="flex items-center space-x-2">
                  <button
                    className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      resultFilter === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/30'
                    }`}
                    onClick={() => handleFilterChange('all')}
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>All ({searchResults.length})</span>
                  </button>
                  {platformResults.youtube && platformResults.youtube.videos.length > 0 && (
                    <button
                      className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        resultFilter === 'youtube'
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                          : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/30'
                      }`}
                      onClick={() => handleFilterChange('youtube')}
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>YouTube ({platformResults.youtube.videos.length})</span>
                    </button>
                  )}
                  {platformResults.tiktok && platformResults.tiktok.videos.length > 0 && (
                    <button
                      className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        resultFilter === 'tiktok'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/30'
                      }`}
                      onClick={() => handleFilterChange('tiktok')}
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                      <span>TikTok ({platformResults.tiktok.videos.length})</span>
                    </button>
                  )}
                  {platformResults.google && platformResults.google.videos.length > 0 && (
                    <button
                      className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        resultFilter === 'google'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50 border border-gray-600/30'
                      }`}
                      onClick={() => setResultFilter('google')}
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Google ({platformResults.google.videos.length})</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {getFilteredResults().map((video, index) => (
              <ItemCard
                key={`${video.platform}-${index}`}
                id={video.url}
                title={video.title}
                image={video.thumbnail_url}
                item={video}
                searchResult={true}
              />
            ))}
          </div>

          {/* Nút Xem thêm cho kết quả tìm kiếm */}
          {getTotalFilteredResults() > displayLimit && (
            <div className="flex justify-center px-6 pb-4 mt-8">
              <button
                onClick={loadMoreResults}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Load More ({getTotalFilteredResults() - displayLimit} videos remaining)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;