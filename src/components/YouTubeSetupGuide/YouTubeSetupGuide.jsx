import React from 'react';

const YouTubeSetupGuide = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Hướng dẫn tạo kênh YouTube</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-yellow-400 font-semibold">Lưu ý quan trọng</span>
            </div>
            <p className="text-yellow-300 text-sm">
              Để upload video lên YouTube, bạn cần có một kênh YouTube. Nếu chưa có, hãy làm theo hướng dẫn bên dưới.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Bước 1: Truy cập YouTube</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 mb-2">1. Mở trình duyệt và truy cập:</p>
              <a 
                href="https://www.youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://www.youtube.com
              </a>
            </div>

            <h4 className="text-lg font-semibold text-white">Bước 2: Đăng nhập Google</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 mb-2">2. Đăng nhập bằng tài khoản Google mà bạn đã sử dụng để login vào web app.</p>
            </div>

            <h4 className="text-lg font-semibold text-white">Bước 3: Tạo kênh YouTube</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 mb-2">3. Click vào avatar của bạn ở góc trên bên phải</p>
              <p className="text-gray-300 mb-2">4. Chọn "Create a channel" hoặc "Tạo kênh"</p>
              <p className="text-gray-300 mb-2">5. Điền thông tin kênh và click "Create channel"</p>
            </div>

            <h4 className="text-lg font-semibold text-white">Bước 4: Xác nhận kênh</h4>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 mb-2">6. Hoàn tất quá trình tạo kênh</p>
              <p className="text-gray-300 mb-2">7. Quay lại web app và thử upload video lại</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-blue-400 font-semibold">Mẹo</span>
            </div>
            <p className="text-blue-300 text-sm">
              Sau khi tạo kênh YouTube, bạn có thể upload video với quyền riêng tư (private) để kiểm tra trước khi công khai.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Đã hiểu
            </button>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-center"
            >
              Mở YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSetupGuide; 