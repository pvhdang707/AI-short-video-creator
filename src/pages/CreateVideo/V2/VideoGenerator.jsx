import React, { useState, useEffect, useRef } from 'react';
import VideoEditor from './VideoEditor';
import { initFFmpeg, generateVideoFromScript, createSimpleVideo } from '../../../utils/ffmpegUtils';
import { toast } from 'react-toastify';
import { projectService } from '../../../services/projectService';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const VideoGenerator = ({ content = [], onBack, scriptId: propScriptId, script, ...otherProps }) => {
  console.log('VideoGenerator props:', { content, onBack, propScriptId, script, otherProps });

  const [ffmpeg, setFFmpeg] = useState(null);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentScript, setCurrentScript] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoDownloadUrl, setVideoDownloadUrl] = useState(null);
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
        if (ffmpegInstance && ffmpegInstance instanceof FFmpeg) {
          setFFmpeg(ffmpegInstance);
          setIsFFmpegLoaded(true);
        } else {
          setError('FFmpeg instance is invalid!');
          setFFmpeg(null);
        }
      } catch (error) {
        console.error('Lỗi khi tải FFmpeg:', error);
        setError('Unable to load FFmpeg: ' + error.message);
        setFFmpeg(null);
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

  // Thêm useEffect để set currentScript từ content prop nếu có
  useEffect(() => {
    console.log('useEffect - content received:', content);
    if (content && content.length > 0) {
      console.log('useEffect - first item:', content[0]);
      console.log('useEffect - first item keys:', Object.keys(content[0]));
      
      // Kiểm tra xem content có phải là script từ backend không (có id)
      const firstItem = content[0];
      if (firstItem && firstItem.id) {
        // Nếu content có id, có thể đây là script từ backend
        console.log('Found script ID from content:', firstItem.id);
        setCurrentScript({
          id: firstItem.id,
          scenes: content.map(scene => ({
            scene_number: scene.scene_number,
            description: scene.description,
            duration: scene.duration,
            visual_elements: scene.visual_elements,
            background_music: scene.background_music,
            voice_over: scene.voice_over,
            image: scene.image
          }))
        });
      } else {
        // Kiểm tra xem có script_id hoặc scriptId trong content không
        const scriptId = firstItem.script_id || firstItem.scriptId;
        if (scriptId) {
          console.log('Found script ID from script_id/scriptId:', scriptId);
          setCurrentScript({
            id: scriptId,
            scenes: content.map(scene => ({
              scene_number: scene.scene_number,
              description: scene.description,
              duration: scene.duration,
              visual_elements: scene.visual_elements,
              background_music: scene.background_music,
              voice_over: scene.voice_over,
              image: scene.image
            }))
          });
        } else {
          console.log('No script ID found in content');
        }
      }
    }
  }, [content]);

  // Lấy scriptId từ currentScript hoặc content
  const getScriptId = () => {
    console.log('getScriptId - currentScript:', currentScript);
    console.log('getScriptId - content:', content);
    console.log('getScriptId - propScriptId:', propScriptId);
    console.log('getScriptId - script:', script);
    
    // Ưu tiên 1: Script ID từ script prop
    if (script && script.id) {
      console.log('Using scriptId from script prop:', script.id);
      return script.id;
    }
    
    // Ưu tiên 2: Script ID từ props
    if (propScriptId) {
      console.log('Using scriptId from props:', propScriptId);
      return propScriptId;
    }
    
    // Ưu tiên 3: Script ID từ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlScriptId = urlParams.get('scriptId') || urlParams.get('script_id');
    if (urlScriptId) {
      console.log('Using scriptId from URL:', urlScriptId);
      return urlScriptId;
    }
    
    // Ưu tiên 4: Script ID từ currentScript
    if (currentScript && currentScript.id) {
      console.log('Using scriptId from currentScript:', currentScript.id);
      return currentScript.id;
    }
    
    // Ưu tiên 5: Script ID từ content
    if (content && content.length > 0 && content[0].id) {
      console.log('Using scriptId from content:', content[0].id);
      return content[0].id;
    }
    
    // Ưu tiên 6: Script ID từ content[0].script_id hoặc scriptId
    if (content && content.length > 0) {
      const scriptId = content[0].script_id || content[0].scriptId;
      if (scriptId) {
        console.log('Using scriptId from content[0].script_id:', scriptId);
        return scriptId;
      }
    }
    
    console.log('No scriptId found');
    return null;
  };

  const handleGenerateFromScript = async () => {
    try {
      // Clear previous video
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
      }
      
      if (!ffmpeg || !(ffmpeg instanceof FFmpeg)) {
        setError('FFmpeg is not loaded or invalid!');
        return;
      }

      // LUÔN tạo script mới từ TimelineUI mỗi lần bấm nút
      const timelineRef = document.querySelector('.timeline-component');
      let script = null;
      if (timelineRef && timelineRef.generateAndExportScript) {
        try {
          script = await timelineRef.generateAndExportScript();
          setCurrentScript(script); // Lưu lại script mới nhất nếu muốn
        } catch (scriptError) {
          console.error('Lỗi khi tạo script:', scriptError);
        }
      }
      // Nếu không có hàm generateAndExportScript trên element, báo lỗi
      if (!script) {
        setError('No script available to create video');
        return;
      }

      // Kiểm tra script có đầy đủ thông tin không
      if (!script.scenes || script.scenes.length === 0) {
        setError('Script has no scenes');
        return;
      }

      // Kiểm tra đối tượng ffmpeg có hoạt động không
      try {
        await ffmpeg.writeFile('test.txt', new Uint8Array([1, 2, 3]));
        await ffmpeg.deleteFile('test.txt');
      } catch (error) {
        console.error('Lỗi khi kiểm tra FFmpeg:', error);
        setError('FFmpeg is not working properly, please reload the page');
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
        throw new Error('Generated video is empty or invalid');
      }

      // Create URL and display video
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      
      // // Tạo URL để tải xuống video
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `video_${new Date().toISOString().slice(0, 10)}.mp4`;
      // a.click();

    } catch (error) {
      console.error('Error creating video:', error);
      setError('Error creating video: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Thêm hàm test FFmpeg cơ bản
  const handleTestFFmpeg = async () => {
    try {
      if (!ffmpeg) {
        setError('FFmpeg not loaded');
        return;
      }

      setIsGenerating(true);
      setProgress(0);
      setError(null);

      // Sử dụng ảnh mặc định để test
      const testImageUrl = 'https://via.placeholder.com/854x480/000000/FFFFFF?text=Test+Image';
      
      const videoBlob = await createSimpleVideo(ffmpeg, testImageUrl, 3, (progress) => {
        setProgress(progress);
      });

      if (!videoBlob || videoBlob.size === 0) {
        throw new Error('Test video is empty');
      }

      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      toast.success('✅ FFmpeg test successful!');

    } catch (error) {
      console.error('Error testing FFmpeg:', error);
      setError('Error testing FFmpeg: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToCloud = async () => {
    if (!videoUrl) return;
    setIsUploading(true);
    setVideoDownloadUrl(null);
    try {
      // Bước 1: Lấy dữ liệu video dưới dạng Blob
      console.log('Preparing video...');
      const response = await fetch(videoUrl);
      const videoBlob = await response.blob();
      const videoFile = new File([videoBlob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });

      // Bước 2: Upload lên Google Cloud Storage
      console.log('Uploading video to cloud storage...');
      const formData = new FormData();
      formData.append('file', videoFile);

      const uploadResponse = await fetch('http://localhost:8000/api/v1/storage/upload-video', {
          method: 'POST',
          body: formData,
      });

      if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.detail || 'Upload failed.');
      }

      const { public_url, signed_url } = await uploadResponse.json();
      setVideoDownloadUrl(signed_url);
      
      // Bước 3: Upload URL lên database
      console.log('Saving video information to database...');
      await updateVideoLinkInDB(signed_url);
      toast.success('✅ Completed! Video has been saved to the system.');

    } catch (err) {
      console.error(err);
      toast.error('❌ Error saving video: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const updateVideoLinkInDB = async (downloadUrl) => {
    // Gọi API backend để cập nhật link video
    try {
      console.log('Current script:', currentScript); // Debug log
      
      // Lấy script ID từ nhiều nguồn khác nhau
      const scriptId = getScriptId();
      console.log('Script ID để cập nhật video URL:', scriptId);
      
      if (!scriptId) {
        toast.error('Unable to find script ID to update video! Please recreate the video.');
        return;
      }
      
      // Kiểm tra script có tồn tại trong database không
      try {
        console.log('Kiểm tra script tồn tại:', scriptId);
        await projectService.checkScriptExists(scriptId);
        console.log('Script tồn tại trong database');
      } catch (checkError) {
        console.error('Script không tồn tại hoặc lỗi khi kiểm tra:', checkError);
        toast.error('Script does not exist in database! Please recreate the script.');
        return;
      }
      
      // Gọi API để cập nhật video URL
      console.log('Calling API to update video URL for script:', scriptId);
      await projectService.updateVideoUrl(scriptId, downloadUrl);
      toast.success('Video link has been updated in the system!');
    } catch (err) {
      console.error('Error updating video URL in DB:', err);
      toast.error('Error updating video to DB: ' + (err?.detail || err?.message || err));
    }
  };

  // Cập nhật state currentScript khi TimelineUI gửi script mới
  const handleExportScript = (script) => {
    console.log('Script được export từ TimelineUI:', script);
    
    // Đảm bảo script có ID từ getScriptId() nếu chưa có
    if (!script.id) {
      const scriptId = getScriptId();
      if (scriptId) {
        script.id = scriptId;
        console.log('Đã thêm script ID vào exported script:', scriptId);
      }
    }
    
    setCurrentScript(script);
    console.log('Script đã được nhận và lưu vào state với ID:', script.id);
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
    <div className="w-full px-8 py-8 space-y-8">
      

      {/* Timeline Section */}
      <div className=" relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-600/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="relative">
          {(() => {
            const scriptId = getScriptId();
            console.log('Rendering VideoEditor with scriptId:', scriptId);    
            return (
              <VideoEditor 
                content={content} 
                onExportScript={handleExportScript}
                ffmpeg={ffmpeg && ffmpeg instanceof FFmpeg ? ffmpeg : null}
                scriptId={scriptId}
              />
            );
          })()}
        </div>
      </div>
      
      {/* Video Preview */}
      {videoUrl && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-600/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"></div>
          <div className="relative p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/20">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Video Preview</h3>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black/50">
              <video 
                ref={videoRef}
                src={videoUrl} 
                controls 
                autoPlay 
                className="w-full rounded-xl"
                style={{ maxHeight: '500px' }}
              />
            </div>
            
            <div className="flex gap-4 mt-6">
              <a
                href={videoUrl}
                download={`video_${new Date().toISOString().slice(0, 10)}.mp4`}
                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 border border-green-400/20 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Download Video</span>
              </a>
              
              <button
                onClick={handleSaveToCloud}
                disabled={isUploading}
                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 border border-blue-400/20 backdrop-blur-sm"
              >
                {isUploading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">Saving to Cloud...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span className="font-medium">Save to Cloud & DB</span>
                  </>
                )}
              </button>
            </div>
            
            {videoDownloadUrl && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl">
                <p className="text-green-400 font-medium mb-2">✅ Video saved successfully!</p>
                <p className="text-slate-300 text-sm break-all">
                  Cloud link: 
                  <a href={videoDownloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-2 underline">
                    {videoDownloadUrl}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-400/30">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-400/20">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isGenerating && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-600/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="relative p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20">
                <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-white">Creating video...</span>
                  <span className="text-sm font-medium text-slate-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-600/30">
        <button 
          onClick={onBack}
          className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-600/80 to-slate-700/80 text-white rounded-xl hover:from-slate-500/80 hover:to-slate-600/80 transition-all duration-300 border border-slate-500/30 backdrop-blur-sm shadow-lg hover:shadow-slate-500/20"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
        
        <button
          onClick={handleGenerateFromScript}
          disabled={!isFFmpegLoaded || isGenerating}
          className="group flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 border border-blue-400/20 backdrop-blur-sm flex-1 max-w-md mx-4 justify-center"
        >
          {isGenerating ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Creating video...</span>
            </>
          ) : !isFFmpegLoaded ? (
            <>
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span className="font-medium">Loading FFmpeg...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Create Video</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
        
        <div className="w-20"></div> {/* Spacer for centering */}
      </div>
    </div>
  );
};

export default VideoGenerator;