import React, { useState, useEffect } from 'react';
import { videoScriptAPI, voiceAPI, imageAPI } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import SceneVoiceEditor from '../../../components/VoiceEditor/SceneVoiceEditor';
import VoiceOptionsEditor from '../../../components/VoiceEditor/VoiceOptionsEditor';
import SceneImage from '../../../components/ImageGenerator/SceneImage';
import SceneInfo from '../../../components/ImageGenerator/SceneInfo';
import SceneEditor from '../../../components/ImageGenerator/SceneEditor';
import LoadingState from '../../../components/ImageGenerator/LoadingState';
import ErrorMessage from '../../../components/ImageGenerator/ErrorMessage';
import { detectLanguage, getDefaultVoiceForLanguage } from '../../../utils/languageUtils';


// Danh sách các giọng đọc cho mỗi ngôn ngữ
const VOICE_OPTIONS = {
  'vi-VN': [
    { id: 'vi-VN-Wavenet-A', name: 'Giọng 1 ', gender: 'female', language: 'vi-VN' },
    { id: 'vi-VN-Wavenet-B', name: 'Giọng 2 ', gender: 'male', language: 'vi-VN' },
    { id: 'vi-VN-Wavenet-C', name: 'Giọng 3 ', gender: 'female', language: 'vi-VN' },
    { id: 'vi-VN-Wavenet-D', name: 'Giọng 4 ', gender: 'male', language: 'vi-VN' },
    { id: 'vi-VN-Standard-A', name: 'Giọng 5 ', gender: 'female', language: 'vi-VN' },
    { id: 'vi-VN-Standard-B', name: 'Giọng 6 ', gender: 'male', language: 'vi-VN' },
    { id: 'vi-VN-Standard-C', name: 'Giọng 7 ', gender: 'female', language: 'vi-VN' },
    { id: 'vi-VN-Standard-D', name: 'Giọng 8 ', gender: 'male', language: 'vi-VN' },
  ],
  'en-US': [
    { id: 'en-US-Wavenet-A', name: 'Voice 1 ', gender: 'male', language: 'en-US' },
    { id: 'en-US-Wavenet-B', name: 'Voice 2 ', gender: 'male', language: 'en-US' },
    { id: 'en-US-Wavenet-C', name: 'Voice 3 ', gender: 'female', language: 'en-US' },
    { id: 'en-US-Wavenet-D', name: 'Voice 4 ', gender: 'male', language: 'en-US' },
    { id: 'en-US-Wavenet-E', name: 'Voice 5 ', gender: 'female', language: 'en-US' },
    { id: 'en-US-Wavenet-F', name: 'Voice 6 ', gender: 'female', language: 'en-US' },
    { id: 'en-US-Wavenet-G', name: 'Voice 7 ', gender: 'female', language: 'en-US' },
    { id: 'en-US-Wavenet-H', name: 'Voice 8 ', gender: 'female', language: 'en-US' },
    { id: 'en-US-Wavenet-I', name: 'Voice 9 ', gender: 'male', language: 'en-US' },
    { id: 'en-US-Wavenet-J', name: 'Voice 10 ', gender: 'male', language: 'en-US' },
  ],
  'zh-CN': [
    { id: 'zh-CN-Wavenet-A', name: '声音 1 ', gender: 'male', language: 'zh-CN' },
    { id: 'zh-CN-Wavenet-B', name: '声音 2 ', gender: 'female', language: 'zh-CN' },
    { id: 'zh-CN-Wavenet-C', name: '声音 3 ', gender: 'male', language: 'zh-CN' },
    { id: 'zh-CN-Wavenet-D', name: '声音 4 ', gender: 'female', language: 'zh-CN' },
  ],
  'ja-JP': [  
    { id: 'ja-JP-Wavenet-A', name: '声 1 ', gender: 'male', language: 'ja-JP' },
    { id: 'ja-JP-Wavenet-B', name: '声 2 ', gender: 'female', language: 'ja-JP' },
    { id: 'ja-JP-Wavenet-C', name: '声 3 ', gender: 'male', language: 'ja-JP' },
    { id: 'ja-JP-Wavenet-D', name: '声 4 ', gender: 'female', language: 'ja-JP' },
  ],
  'ko-KR': [
    { id: 'ko-KR-Wavenet-A', name: '목소리 1 ', gender: 'male', language: 'ko-KR' },
    { id: 'ko-KR-Wavenet-B', name: '목소리 2 ', gender: 'female', language: 'ko-KR' },
    { id: 'ko-KR-Wavenet-C', name: '목소리 3 ', gender: 'male', language: 'ko-KR' },
    { id: 'ko-KR-Wavenet-D', name: '목소리 4 ', gender: 'female', language: 'ko-KR' },
  ],
  'fr-FR': [
    { id: 'fr-FR-Wavenet-A', name: 'Voix 1 ', gender: 'male', language: 'fr-FR' },
    { id: 'fr-FR-Wavenet-B', name: 'Voix 2 ', gender: 'female', language: 'fr-FR' },  
    { id: 'fr-FR-Wavenet-C', name: 'Voix 3 ', gender: 'male', language: 'fr-FR' },
    { id: 'fr-FR-Wavenet-D', name: 'Voix 4 ', gender: 'female', language: 'fr-FR' },
  ]


};

const ContentGenerator = ({ script, onNext, onBack, initialContent }) => {
  // Use custom toast hook
  const { showSuccess, showError } = useToast();
  
  const [scenes, setScenes] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewAudios, setPreviewAudios] = useState({});
  const [isPreviewing, setIsPreviewing] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [generatedImages, setGeneratedImages] = useState({});
  const [generatedVoices, setGeneratedVoices] = useState({});
  const [regeneratingScene, setRegeneratingScene] = useState(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Hàm tạo lại ảnh cho một scene - ĐÃ CẢI THIỆN
  const handleRegenerateImage = async (sceneNumber, prompt) => {
    try {
      setRegeneratingScene(sceneNumber);
      
      
      // Tìm scene tương ứng với scene_number
      const targetScene = scenes.find(scene => scene.scene_number === sceneNumber);
      if (!targetScene) {
        throw new Error(`Scene ${sceneNumber} not found`);
      }

      // Tìm image hiện tại của scene này
      const existingImage = generatedImages[sceneNumber];
      if (!existingImage || !existingImage.id) {
        throw new Error(`No existing image found for scene ${sceneNumber}`);
      }

      console.log(`Regenerating image for scene ${sceneNumber} with image ID: ${existingImage.id}`);

      // Gọi API tạo lại ảnh với image ID
      const response = await imageAPI.regenerateImage(existingImage.id, {
        prompt: prompt,
        style: 'realistic',
        quality: 'high'
      });

      console.log('API response:', response);

      // Cập nhật state với ảnh mới
      setGeneratedImages(prev => ({
        ...prev,
        [sceneNumber]: response.data
      }));

      showSuccess(`Image regenerated successfully for scene ${sceneNumber}!`);

    } catch (error) {
      console.error('Error regenerating image:', error);
      
      let errorMessage = 'Failed to regenerate image. Please try again.';
      
      if (error.response) {
        // Lỗi từ server
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.message;
        
        if (status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (status === 400) {
          errorMessage = detail || 'Invalid request. Please check your input.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = detail || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Lỗi network
        errorMessage = 'Cannot connect to server. Please check your network connection.';
      } else {
        // Lỗi khác
        errorMessage = error.message || 'Unknown error';
      }
      
      showError(errorMessage);
    } finally {
      setRegeneratingScene(null);
    }
  };

  // Hàm tạo voice cho toàn bộ script
  const generateVoicesForScript = async () => {
    if (!scenes.length) return false;
    
    setIsGeneratingAll(true);
    try {
      const response = await voiceAPI.scriptToSpeech(script.id, {
        voice_id: scenes[0].voiceSettings.voice_id,
        speed: scenes[0].voiceSettings.speed
      });

      const newGeneratedVoices = {};
      const newPreviewAudios = {};
      
      response.data.forEach(voice => {
        newGeneratedVoices[voice.scene_number] = {
          audio_base64: voice.audio_base64,
          voice_id: voice.voice_id,
          speed: voice.speed
        };
        newPreviewAudios[voice.scene_number] = `data:audio/mp3;base64,${voice.audio_base64}`;
      });

      setGeneratedVoices(prev => ({...prev, ...newGeneratedVoices}));
      setPreviewAudios(prev => ({...prev, ...newPreviewAudios}));
      return true;
    } catch (error) {
      console.error('Error generating voices:', error);
      showError('An error occurred while generating voices for the video');
      return false;
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Hàm tạo ảnh cho toàn bộ script
  const generateImagesForScript = async () => {
    try {
      const response = await imageAPI.generateImagesForScript(script.id);
      
      if (response.data && Array.isArray(response.data)) {
        const newGeneratedImages = {};
        
        response.data.forEach(image => {
          newGeneratedImages[image.scene_number] = {
            id: image.id,
            url: image.image_url,
            prompt: image.prompt,
            width: image.width,
            height: image.height,
            created_at: image.created_at,
            scene_id: image.scene_id
          };
        });

        setGeneratedImages(prev => ({
          ...prev,
          ...newGeneratedImages
        }));
        return true;
      }
    } catch (error) {
      console.error('Error generating images:', error);
      showError('An error occurred while generating images for the video');
      return false;
    }
  };

  // Hàm tạo nội dung song song
  const generateContentForScript = async () => {
    setIsGeneratingAll(true);
    setLoading(true);
    
    try {
      console.log('Starting content generation...');
      
      // Chạy song song 2 hàm generate
      generateVoicesForScript().then( result => {
        generateImagesForScript().then( result => {
          setIsGeneratingAll(false);
          setLoading(false);
        });
      });

      console.log('Content generation successful');
    } catch (error) {
      console.error('Error generating content:', error);
      showError('An error occurred while generating content for the video');
    } finally {
      setIsGeneratingAll(false);
      setLoading(false);
    }
  };

  // Khởi tạo scenes và tạo nội dung khi component mount
  useEffect(() => {
    if (script && Array.isArray(script.scenes) && Object.keys(generatedImages).length === 0) {
      const initialScenes = script.scenes.map(scene => {
        return {
          ...scene,
          voiceSettings: {
            voice_id: 'vi-VN-Wavenet-A',
            speed: 1.0,
            option: 'generate',
            text: scene.voice_over,
            language: 'vi-VN'
          }
        };
      });
      setScenes(initialScenes);
      
      console.log('Scenes initialized:', initialScenes);

      // Load dữ liệu hiện có từ script (nếu có) khi ở chế độ edit
      const loadExistingData = async () => {
        try {
          // Load images hiện có
          if (script.scenes && script.scenes.length > 0) {
            const newGeneratedImages = {};
            for (const scene of script.scenes) {
              if (scene.images && scene.images.length > 0) {
                newGeneratedImages[scene.scene_number] = {
                  id: scene.images[0].id,
                  url: scene.images[0].image_url,
                  prompt: scene.images[0].prompt,
                  width: scene.images[0].width,
                  height: scene.images[0].height,
                  created_at: scene.images[0].created_at,
                  scene_id: scene.images[0].scene_id
                };
              }
            }
            setGeneratedImages(newGeneratedImages);
          }

          // Load voices hiện có (nếu có)
          if (script.scenes && script.scenes.length > 0) {
            const newGeneratedVoices = {};
            const newPreviewAudios = {};
            for (const scene of script.scenes) {
              if (scene.voice_over && scene.scene_number) {
                try {
                  const response = await voiceAPI.generateVoice({
                    text: scene.voice_over,
                    voice_id: 'vi-VN-Wavenet-A',
                    speed: 1.0
                  });
                  
                  newGeneratedVoices[scene.scene_number] = {
                    audio_base64: response.data.audio_base64,
                    voice_id: 'vi-VN-Wavenet-A',
                    speed: 1.0
                  };
                  newPreviewAudios[scene.scene_number] = `data:audio/mp3;base64,${response.data.audio_base64}`;
                } catch (error) {
                  console.log(`Cannot generate voice for scene ${scene.scene_number}:`, error);
                }
              }
            }
            setGeneratedVoices(newGeneratedVoices);
            setPreviewAudios(newPreviewAudios);
          }
        } catch (error) {
          console.error('Error loading existing data:', error);
        }
      };

      loadExistingData();

      // Tự động tạo nội dung khi chuyển từ bước 1 sang bước 2 
      generateContentForScript();
    }
  }, [script]);

  // Các hàm xử lý voice
  const handleVoiceOverChange = (sceneIndex, value) => {
    setScenes(prev => {
      const newScenes = [...prev];
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voice_over: value,
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          text: value
        }
      };
      return newScenes;
    });
    setHasChanges(true);
  };

  const handleLanguageChange = (sceneIndex, languageCode) => {
    setScenes(prev => {
      const newScenes = [...prev];
      const voices = VOICE_OPTIONS[languageCode] || [];
      const defaultVoice = voices[0]?.id || 'vi-VN-Wavenet-A';
      
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          language: languageCode,
          voice_id: defaultVoice
        }
      };
      return newScenes;
    });
    setHasChanges(true);
  };

  const handleVoiceIdChange = (sceneIndex, value) => {
    setScenes(prev => {
      const newScenes = [...prev];
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          voice_id: value
        }
      };
      return newScenes;
    });
    setHasChanges(true);
  };

  const handleVoiceSpeedChange = (sceneIndex, value) => {
    setScenes(prev => {
      const newScenes = [...prev];
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          speed: value
        }
      };
      return newScenes;
    });
    setHasChanges(true);
  };

  // Hàm tạo lại voice cho một scene
  const handleRegenerateVoice = async (sceneIndex) => {
    try {
      setRegeneratingScene(sceneIndex);
      const scene = scenes[sceneIndex];
      
      if (scene.voiceSettings.option === 'generate') {
        const response = await voiceAPI.textToSpeech({
          text: scene.voice_over,
          ...scene.voiceSettings
        });
        
        setGeneratedVoices(prev => ({
          ...prev,
          [sceneIndex + 1]: response.data
        }));
        
        setPreviewAudios(prev => ({
          ...prev,
          [sceneIndex + 1]: `data:audio/mp3;base64,${response.data.audio_base64}`
        }));
      }
    } catch (error) {
      console.error('Error regenerating voice:', error);
      showError(`Cannot regenerate voice for scene ${sceneIndex + 1}`);
    } finally {
      setRegeneratingScene(null);
    }
  };

  // Các hàm xử lý ảnh
  const handleVisualElementsChange = (sceneIndex, value) => {
    setScenes(prev => {
      const newScenes = [...prev];
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        visual_elements: value
      };
      return newScenes;
    });
    setHasChanges(true); 
  };

  const handleNext = async () => {
    try {
      // Kiểm tra xem tất cả scene đã có đủ content chưa
      const isComplete = scenes.every((scene, index) => {
        const hasVoice = generatedVoices[index + 1] || scene.voiceSettings.option === 'upload';
        const hasImage = generatedImages[index + 1];
        return hasVoice && hasImage;
      });
      
      if (!isComplete) {
        showError('Please ensure all scenes have complete voice and image content');
        return;
      }

      // Nếu đã có cover_image thì bỏ qua upload
      if (!script.cover_image) {
        setIsUploadingCover(true); // Bắt đầu loading
        try {
          // Lấy thông tin ảnh của scene đầu tiên
          const firstImage = generatedImages[1];
          if (!firstImage || !firstImage.url) {
            showError('Không tìm thấy ảnh của scene đầu tiên để làm cover image!');
            setIsUploadingCover(false);
            return;
          }

          // Gọi API backend để upload ảnh này lên cloud storage
          const uploadResponse = await videoScriptAPI.uploadImagesFromUrls(script.id);
          const coverImageUrl = uploadResponse?.data?.cover_image;
          if (coverImageUrl) {
            showSuccess('Cover image uploaded successfully!');
          } else {
            showError('Cannot get cover image URL after upload!');
            setIsUploadingCover(false);
            return;
          }
        } catch (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          showError('Error uploading cover image to cloud storage. Please try again.');
          setIsUploadingCover(false);
          return;
        }
        setIsUploadingCover(false); // Kết thúc loading
      }
      // --- Kết thúc xử lý cover image ---

      const processedScenes = await Promise.all(scenes.map(async (scene, index) => {
        const voiceData = generatedVoices[index + 1];
        const imageData = generatedImages[index + 1];
        
        // Xử lý voice data
        let voiceInfo = null;
        
        if (scene.voiceFile) {
          // Nếu có file upload, chuyển thành base64
          try {
            const base64Audio = await convertFileToBase64(scene.voiceFile);
            voiceInfo = {
              audio_base64: base64Audio,
              voice_id: 'uploaded_file',
              speed: 1.0,
              file_name: scene.voiceFile.name
            };
          } catch (error) {
            console.error('Error converting audio file to base64:', error);
            showError(`Cannot process audio file for scene ${index + 1}`);
            return null;
          }
        } else if (voiceData) {
          // Nếu dùng voice AI
          voiceInfo = {
            audio_base64: voiceData.audio_base64,
            voice_id: scene.voiceSettings.voice_id,
            speed: scene.voiceSettings.speed
          };
        }
        
        return {
          id: scene.id,
          scene_number: index + 1,
          voice_over: scene.voice_over,
          visual_elements: scene.visual_elements,
          voice: voiceInfo,
          image: imageData ? {
            id: imageData.id,
            url: imageData.url,
            prompt: imageData.prompt,
            width: imageData.width,
            height: imageData.height
          } : undefined
        };
      }));
      
      // Kiểm tra nếu có scene nào bị lỗi
      if (processedScenes.some(scene => scene === null)) {
        showError('Please ensure all scenes have complete voice and image content');
        return;
      }
      
      onNext(processedScenes);
    } catch (err) {
      console.error('Error processing data:', err);
      showError('Error processing data: ' + (err?.message || err));
    }
  };

  // Hàm chuyển file thành base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Lấy phần base64 từ data URL (bỏ qua phần "data:audio/...;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full px-8 py-8 space-y-8">
      

      {/* Project Summary */}
      {script && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-600/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Project Information</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Title</label>
                <p className="text-white font-medium text-lg">{script.title || 'No title'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Description</label>
                <p className="text-slate-300 text-sm leading-relaxed">{script.description || 'No description'}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-400">Scene Count</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold text-xl">{script.scenes?.length || 0}</span>
                  <span className="text-slate-400 text-sm">scenes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenes List */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/20">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white">Content Generation</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
        </div>
        
        <div className="space-y-8 overflow-y-auto pr-2">
          {scenes.map((scene, index) => (
            <div key={index} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-slate-600/30 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="relative p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <h4 className="text-xl font-semibold text-white">
                      Scene {index + 1}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    {generatedVoices[index + 1] && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-sm rounded-full border border-green-400/20 backdrop-blur-sm">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Voice Ready
                      </span>
                    )}
                    {generatedImages[index + 1] && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 text-sm rounded-full border border-blue-400/20 backdrop-blur-sm">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Image Ready
                      </span>
                    )}
                    {!generatedVoices[index + 1] && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-sm rounded-full border border-yellow-400/20 backdrop-blur-sm">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Voice Needed
                      </span>
                    )}
                    {!generatedImages[index + 1] && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 text-sm rounded-full border border-yellow-400/20 backdrop-blur-sm">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Image Needed
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Voice */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/20">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      <h5 className="text-white font-semibold text-lg">Voice Generation</h5>
                    </div>
                    <VoiceOptionsEditor
                      voiceSettings={scene.voiceSettings}
                      voiceOptions={VOICE_OPTIONS[scene.voiceSettings.language] || []}
                      currentLanguage={scene.voiceSettings.language}
                      voiceFile={scene.voiceFile}
                      onVoiceIdChange={value => handleVoiceIdChange(index, value)}
                      onSpeedChange={value => handleVoiceSpeedChange(index, value)}
                      onFileChange={file => {
                              setScenes(prev => {
                                const newScenes = [...prev];
                                newScenes[index].voiceFile = file;
                          // If file exists, set upload option, otherwise set generate
                          newScenes[index].voiceSettings.option = file ? 'upload' : 'generate';
                                return newScenes;
                              });
                            }}
                      onTextChange={value => handleVoiceOverChange(index, value)}
                      onLanguageChange={value => handleLanguageChange(index, value)}
                      onRegenerateVoice={() => handleRegenerateVoice(index)}
                      isRegeneratingVoice={regeneratingScene === index}
                      aiVoicePreviewSrc={previewAudios[index + 1]}
                    />
                  </div>

                  {/* Right Column - Image */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/20">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h5 className="text-white font-semibold text-lg">Image Generation</h5>
                    </div>
                    <SceneImage
                      sceneImage={generatedImages[index + 1]}
                      sceneNumber={index + 1}
                      isRegenerating={regeneratingScene === index + 1}
                    />
                    <SceneEditor
                      sceneNumber={index + 1}
                      prompt={scene.visual_elements}
                      onPromptChange={(value) => handleVisualElementsChange(index, value)}
                      onRegenerate={(sceneNumber, prompt) => handleRegenerateImage(sceneNumber, prompt)}
                      isRegenerating={regeneratingScene === index + 1}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
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
          onClick={handleNext}
          disabled={isUploadingCover || !scenes.some((scene, index) => {
            const hasVoice = generatedVoices[index + 1] || scene.voiceSettings.option === 'upload';
            const hasImage = generatedImages[index + 1];
            return hasVoice && hasImage;
          })}
          className="group flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 border border-blue-400/20 backdrop-blur-sm"
        >
          {isUploadingCover ? (
            <>
              <svg className="w-5 h-5 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span>Đang upload ảnh bìa...</span>
            </>
          ) : (
            <>
              <span className="font-medium">Continue to Video Creation</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 group-disabled:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContentGenerator; 