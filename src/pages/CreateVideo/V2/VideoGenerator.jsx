import React, { useState, useEffect, useRef } from 'react';
import TimelineUI from './TimelineUI';
import { initFFmpeg, generateVideoFromScript } from '../../../utils/ffmpegUtils';

const VideoGenerator = ({ content = [], onBack }) => {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentScript, setCurrentScript] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);

  // Keeping these presets for future use if needed
  // const availablePresets = [
  //   { value: 'ultrafast', label: 'Ultrafast (Nhanh nhất, chất lượng thấp)' },
  //   { value: 'superfast', label: 'Superfast (Rất nhanh)' },
  //   { value: 'veryfast', label: 'Veryfast (Nhanh)' },
  //   { value: 'faster', label: 'Faster (Khá nhanh)' },
  //   { value: 'fast', label: 'Fast (Nhanh, cân bằng)' },
  //   { value: 'medium', label: 'Medium (Trung bình)' },
  //   { value: 'slow', label: 'Slow (Chậm, chất lượng tốt)' },
  //   { value: 'slower', label: 'Slower (Rất chậm)' },
  //   { value: 'veryslow', label: 'Veryslow (Chậm nhất, chất lượng cao nhất)' }
  // ];

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = await initFFmpeg();
        if (ffmpegInstance) {
          setFFmpeg(ffmpegInstance);
        setIsFFmpegLoaded(true);
        } else {
          setError('Không thể khởi tạo FFmpeg');
        }
      } catch (error) {
        console.error('Lỗi khi tải FFmpeg:', error);
        setError('Không thể tải FFmpeg: ' + error.message);
      }
    };

    if (!isFFmpegLoaded) {
      loadFFmpeg();
    }

    // Cleanup video URL when component unmounts
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [isFFmpegLoaded, videoUrl]);

  const handleGenerateFromScript = async () => {
    try {
      // Clear previous video
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
      
      if (!ffmpeg) {
        setError('FFmpeg chưa được tải');
        return;
      }
      
      // Tự động tạo script từ TimelineUI thông qua ref
      const timelineRef = document.querySelector('.timeline-component');
      
      // Sử dụng currentScript nếu đã có hoặc yêu cầu TimelineUI tạo script mới
      let script = currentScript;
      
      if (!script && timelineRef) {
        // Gọi hàm tạo script từ TimelineUI component (nếu không có script hiện tại)
        try {
          // Hàm này được triển khai trong TimelineUI bằng forwardRef và useImperativeHandle
          const generatedScript = await timelineRef.generateAndExportScript();
          if (generatedScript) {
            script = generatedScript;
          }
        } catch (scriptError) {
          console.error('Lỗi khi tạo script:', scriptError);
        }
      }
      
      if (!script) {
        setError('Chưa có script để tạo video');
        return;
      }

      // Kiểm tra script có đầy đủ thông tin không
      if (!script.scenes || script.scenes.length === 0) {
        setError('Script không có scene nào');
        return;
      }

      // Kiểm tra đối tượng ffmpeg có hoạt động không
      try {
        await ffmpeg.writeFile('test.txt', new Uint8Array([1, 2, 3]));
        await ffmpeg.deleteFile('test.txt');
      } catch (error) {
        console.error('Lỗi khi kiểm tra FFmpeg:', error);
        setError('FFmpeg không hoạt động đúng, vui lòng tải lại trang');
        return;
      }

      setIsGenerating(true);
      setProgress(0);
      setError(null);

      const videoBlob = await generateVideoFromScript(ffmpeg, script, (progress) => {
        setProgress(progress);
      });

      // Kiểm tra kết quả video
      if (!videoBlob || videoBlob.size === 0) {
        throw new Error('Video được tạo ra rỗng hoặc không hợp lệ');
      }

      // Create URL and display video
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      
      // Tạo URL để tải xuống video
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_${new Date().toISOString().slice(0, 10)}.mp4`;
      a.click();

    } catch (error) {
      console.error('Lỗi khi tạo video:', error);
      setError('Lỗi khi tạo video: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };



  // Cập nhật state currentScript khi TimelineUI gửi script mới
  const handleExportScript = (script) => {
    setCurrentScript(script);
    console.log('Script đã được nhận và lưu vào state');
  };

  // upload script
  const handleUploadScript = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const script = JSON.parse(e.target.result);
        setCurrentScript(script);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="video-generator">

      {/*<div className="flex flex-col items-center justify-center">
       //upload script 
      <input type="file" accept=".json" onChange={handleUploadScript} />
      <button onClick={handleGenerateFromScript}>Generate from script</button>

      </div>*/}
      <TimelineUI 
        content={content} 
        onExportScript={handleExportScript}
        ffmpeg={ffmpeg}
      /> 
      
      {videoUrl && (
        <div className="video-preview mt-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
          <video 
            ref={videoRef}
            src={videoUrl} 
            controls 
            autoPlay 
            className="w-full rounded-lg shadow-lg"
            style={{ maxHeight: '500px' }}
          />
        </div>
      )}
      
      {error && (
        <div className="error-message p-3 bg-red-500 text-white rounded-lg my-4">
          {error}
        </div>
      )}

      {isGenerating && (
        <div className="progress-container mt-4 mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium">Đang tạo video...</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="progress-fill h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="controls flex space-x-4 mt-4">
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={handleGenerateFromScript}
          disabled={!isFFmpegLoaded || isGenerating}
          className={`px-6 py-3 font-medium rounded-lg transition-colors flex-grow
            ${!isFFmpegLoaded || isGenerating
              ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isGenerating ? 'Đang tạo video...' : 'Tạo video'}
        </button>
      </div>
    </div>
  );
};

export default VideoGenerator;