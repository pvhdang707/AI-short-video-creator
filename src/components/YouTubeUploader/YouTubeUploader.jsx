import React, { useState } from 'react';
import { toast } from 'react-toastify';
import YouTubeService from '../../services/youtubeService';
import YouTubeSetupGuide from '../YouTubeSetupGuide';

const YouTubeUploader = ({ videoUrl, projectTitle, projectDescription, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: projectTitle || '',
    description: projectDescription || '',
    privacy_status: 'private'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleUpload = async () => {
    if (!videoUrl) {
      toast.error('❌ No video to upload');
      return;
    }

    if (!uploadForm.title.trim()) {
      toast.error('❌ Please enter video title');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('privacy_status', uploadForm.privacy_status);
      formData.append('file_url', videoUrl);

      const result = await YouTubeService.uploadVideo(formData);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }    } catch (error) {
      console.error('YouTube upload error:', error);
      
      // Display specific error message from backend
      let errorMessage = '❌ Video upload error';
      let showGuide = false;
      
      if (error.message) {
        // If there's an error message from backend
        errorMessage = `❌ ${error.message}`;
        
        // Check if it's a YouTube channel error
        if (error.message.includes('no YouTube channel') || 
            error.message.includes('youtubeSignupRequired')) {
          showGuide = true;
        }
      } else if (error.response?.data?.detail) {
        // If there's error detail from FastAPI
        errorMessage = `❌ ${error.response.data.detail}`;
        
        // Check if it's a YouTube channel error
        if (error.response.data.detail.includes('no YouTube channel') || 
            error.response.data.detail.includes('youtubeSignupRequired')) {
          showGuide = true;
        }
      } else if (error.response?.status === 401) {
        errorMessage = '❌ Not logged in to Google. Please login again.';
      } else if (error.response?.status === 400) {
        errorMessage = '❌ Invalid data. Please check again.';
      } else if (error.response?.status === 500) {
        errorMessage = '❌ Server error. Please try again later.';
      }      
      toast.error(errorMessage);
      
      // Show guide if needed
      if (showGuide) {
        setShowSetupGuide(true);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-6">        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Upload to YouTube
        </h3>
        
        <div className="space-y-4">          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              name="title"
              value={uploadForm.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter video title..."
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {uploadForm.title.length}/100 characters
            </p>
          </div>          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Video Description
            </label>
            <textarea
              name="description"
              value={uploadForm.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter video description..."
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {uploadForm.description.length}/5000 characters
            </p>
          </div>          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Privacy Setting
            </label>
            <select
              name="privacy_status"
              value={uploadForm.privacy_status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="private">Private (Only you)</option>
              <option value="unlisted">Unlisted (Only with link)</option>
              <option value="public">Public (Everyone can view)</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading || !videoUrl}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Upload to YouTube
                </>
              )}
            </button>
          </div>          {!videoUrl && (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">
                ⚠️ Video is required to upload to YouTube
              </p>
            </div>
          )}
        </div>
      </div>

      {/* YouTube Setup Guide Modal */}
      {showSetupGuide && (
        <YouTubeSetupGuide onClose={() => setShowSetupGuide(false)} />
      )}
    </>
  );
};

export default YouTubeUploader; 