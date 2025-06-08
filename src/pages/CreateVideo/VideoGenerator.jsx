import React, { useState, useEffect } from 'react';
import { videoScriptAPI } from '../../services/api';
import videoGenerator from '../../services/videoGenerator';

const VideoGenerator = ({ script, content, onNext, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    // Cleanup khi component unmount
    return () => {
      if (videoId) {
        videoGenerator.cleanup(videoId);
      }
    };
  }, [videoId]);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      // Gọi service để tạo video
      const result = await videoGenerator.generateVideo(script, content);
      setVideoUrl(result.url);
      setVideoId(result.videoId);
      setProgress(100);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${script.title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Preview */}
      <div className="bg-gray-700/50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Xem trước video</h3>
        
        {videoUrl ? (
          <div className="space-y-4">
            <video
              controls
              className="w-full rounded-lg"
              src={videoUrl}
            />
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Tải xuống
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              {isGenerating
                ? 'Đang tạo video...'
                : 'Nhấn nút bên dưới để bắt đầu tạo video'}
            </p>
            {isGenerating && (
              <div className="w-full bg-gray-600 rounded-full h-2.5 mb-4">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700"
            >
              {isGenerating ? 'Đang tạo...' : 'Tạo video'}
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          Quay lại
        </button>
        <button
          onClick={onNext}
          disabled={!videoUrl}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700"
        >
          Hoàn thành
        </button>
      </div>
    </div>
  );
};

export default VideoGenerator; 