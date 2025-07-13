import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_VIDEO_SEARCH_API_BASE_URL || 'http://localhost:8000/api';

export const searchVideos = async (keyword, platform = 'all') => {
  try {
    let response;
    
    switch(platform) {
      case 'youtube':
        response = await axios.get(`${API_BASE_URL}/search/youtube/${keyword}`);
        break;
      case 'tiktok':
        // Gọi backend, không gọi RapidAPI trực tiếp nữa
        response = await axios.get(`${API_BASE_URL}/search/tiktok-rapid/${keyword}`);
        break;
      case 'google':
        response = await axios.get(`${API_BASE_URL}/search/google/${keyword}`);
        break;
      default:
        // Search all platforms - bao gồm cả TikTok, YouTube và Google
        const promises = [
          axios.get(`${API_BASE_URL}/search/youtube/${keyword}`).catch(err => {
            console.warn('YouTube search failed:', err.message);
            return { data: { videos: [], total: 0 } };
          }),
          axios.get(`${API_BASE_URL}/search/tiktok-rapid/${keyword}`).catch(err => {
            console.warn('TikTok search failed:', err.message);
            return { data: { videos: [], total: 0 } };
          })
          
        ];
        const [youtubeRes, tiktokRes, googleRes] = await Promise.all(promises);
        
        // Ghép tất cả kết quả từ các nền tảng
        const allVideos = [
          ...(youtubeRes.data.videos || []),
          ...(tiktokRes.data.videos || []),
        ];
        
        response = {
          data: {
            videos: allVideos,
            total: (youtubeRes.data.total || 0) + (tiktokRes.data.total || 0) ,
            platformResults: {
              youtube: {
                videos: youtubeRes.data.videos || [],
                total: youtubeRes.data.total || 0
              },
              tiktok: {
                videos: tiktokRes.data.videos || [],
                total: tiktokRes.data.total || 0
              }
              
            }
          }
        };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error searching videos:', error);
    // Trả về kết quả rỗng thay vì throw error
    return {
      videos: [],
      total: 0,
      error: 'Search temporarily unavailable'
    };
  }
};

// export const getTikTokTrending = async (page = 1, limit = 20) => {
//   try {
//     console.log('Calling TikTok trending API with params:', { page, limit, period: 30, order_by: 'vv', country: 'US' });
//     const response = await axios.get(`${API_BASE_URL}/search/tiktok/trending`, {
//       params: { 
//         page, 
//         limit,
//         period: 30,
//         order_by: 'vv',
//         country: 'US'
//       }
//     });
//     console.log('TikTok API raw response:', response);
//     return response.data;
//   } catch (error) {
//     console.error('Error getting TikTok trending:', error);
//     // Trả về dữ liệu mẫu thay vì throw error
//     return {
//       videos: [
//         {
//           title: "Sample TikTok Video",
//           description: "This is a sample video when TikTok API is unavailable",
//           url: "#",
//           thumbnail_url: "https://via.placeholder.com/300x200?text=TikTok+Sample",
//           view_count: 1000,
//           like_count: 100,
//           platform: "tiktok"
//         }
//       ],
//       total: 1,
//       error: 'TikTok trending temporarily unavailable'
//     };
//   }
// };

// export const getYouTubeTrending = async (page = 1, limit = 20) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/search/youtube/trending`, {
//       params: { 
//         page, 
//         limit,
//         region_code: 'US'
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error getting YouTube trending:', error);
//     throw error;
//   }
// };

// export const getGoogleTrending = async (page = 1, limit = 20) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/search/google/trending`, {
//       params: { 
//         page, 
//         limit,
//         region_code: 'US'
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error getting Google trending:', error);
//     throw error;
//   }
// }; 