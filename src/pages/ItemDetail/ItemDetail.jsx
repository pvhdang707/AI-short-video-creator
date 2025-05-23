import React, { useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiHeart, FiShare2, FiDownload, FiArrowLeft } from 'react-icons/fi';

// Dữ liệu mẫu, thực tế bạn nên lấy từ API hoặc context


const ItemDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const itemData = location.state?.item;

  if (!itemData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 p-2 bg-white rounded-full shadow-md"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy item!</h2>
          <p className="text-gray-500">Vui lòng thử lại.</p>
        </div>
      </div>
    );
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Gọi API yêu thích ở đây nếu cần
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Nút back luôn hiển thị */}
      <button 
        onClick={handleBack}
        className="fixed top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md"
      >
        <FiArrowLeft className="w-5 h-5" />
      </button>

      {/* Phần media bên trái */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center relative overflow-hidden">
        {itemData.type && itemData.type.includes('video') ? (
          <video 
            src={itemData.mediaUrl} 
            controls 
            autoPlay
            className="w-full h-full object-contain"
          />
        ) : (
          <img 
            src={itemData.mediaUrl} 
            alt={itemData.title} 
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Phần thông tin bên phải */}
      <div className="w-full lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{itemData.title}</h1>
            <button 
              onClick={handleFavorite}
              className={`p-2 rounded-full ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            >
              <FiHeart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Loại sản phẩm */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {(itemData.type?.replace(/-/g, ' ') || 'Unknown').toUpperCase()}
            </span>
          </div>

          {/* Prompt */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Prompt</h2>
            <p className="bg-gray-100 p-4 rounded-lg">{itemData.prompt}</p>
          </div>

          {/* Options */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Options</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(itemData.options).map(([key, value]) => (
                <div key={key} className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 capitalize">{key}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Thông tin thêm */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Details</h2>
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <span className="mr-2">❤️</span>
                <span>{itemData.likes} likes</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">👁️</span>
                <span>{itemData.views} views</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                <span>{itemData.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <FiShare2 className="mr-2" />
              Share
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              <FiDownload className="mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;