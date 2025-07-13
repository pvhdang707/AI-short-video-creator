import axios from 'axios';

export async function getTrendingKeywords(region = 'VN', limit = 20) {
  try {
    const API_BASE_URL = process.env.REACT_APP_TRENDING_KEYWORDS_API_BASE_URL || 'http://localhost:8000/api';
    const response = await fetch(`${API_BASE_URL}/trending-keywords`);
    
    if (!response.ok) {
      console.warn('Failed to fetch YouTube trending keywords, using fallback');
      // Trả về keywords mặc định nếu API lỗi
      return [
        "gaming", "music", "comedy", "education", "lifestyle", 
        "cooking", "travel", "fitness", "tech", "news",
        "entertainment", "sports", "beauty", "fashion", "art"
      ];
    }
    
    const data = await response.json();
    return data.keywords || [];
  } catch (error) {
    console.error('Error fetching YouTube trending keywords:', error);
    // Trả về keywords mặc định nếu có lỗi
    return [
      "gaming", "music", "comedy", "education", "lifestyle", 
      "cooking", "travel", "fitness", "tech", "news",
      "entertainment", "sports", "beauty", "fashion", "art"
    ];
  }
}
