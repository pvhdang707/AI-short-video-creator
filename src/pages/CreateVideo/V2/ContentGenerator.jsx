import React, { useState, useEffect } from 'react';
import { videoScriptAPI, voiceAPI, imageAPI } from '../../../services/api';
import SceneVoiceEditor from '../../../components/VoiceEditor/SceneVoiceEditor';
import VoiceOptionsEditor from '../../../components/VoiceEditor/VoiceOptionsEditor';
import SceneImage from '../../../components/ImageGenerator/SceneImage';
import SceneInfo from '../../../components/ImageGenerator/SceneInfo';
import SceneEditor from '../../../components/ImageGenerator/SceneEditor';
import LoadingState from '../../../components/ImageGenerator/LoadingState';
import ErrorMessage from '../../../components/ImageGenerator/ErrorMessage';
import { detectLanguage, getDefaultVoiceForLanguage } from '../../../utils/languageUtils';

const VOICE_OPTIONS = [
  // Giọng tiếng Việt - Wavenet (Ưu tiên cao)
  { id: 'vi-VN-Wavenet-A', name: 'Female Voice 1 (Vietnam) - Wavenet', gender: 'female', language: 'vi-VN', priority: 1 },
  { id: 'vi-VN-Wavenet-B', name: 'Male Voice 1 (Vietnam) - Wavenet', gender: 'male', language: 'vi-VN', priority: 1 },
  { id: 'vi-VN-Wavenet-C', name: 'Female Voice 2 (Vietnam) - Wavenet', gender: 'female', language: 'vi-VN', priority: 1 },
  { id: 'vi-VN-Wavenet-D', name: 'Male Voice 2 (Vietnam) - Wavenet', gender: 'male', language: 'vi-VN', priority: 1 },

  // Giọng tiếng Việt - Standard
  { id: 'vi-VN-Standard-A', name: 'Female Voice 1 (Vietnam) - Standard', gender: 'female', language: 'vi-VN', priority: 1 },
  { id: 'vi-VN-Standard-B', name: 'Male Voice 1 (Vietnam) - Standard', gender: 'male', language: 'vi-VN', priority: 1 },
  { id: 'vi-VN-Standard-C', name: 'Female Voice 2 (Vietnam) - Standard', gender: 'female', language: 'vi-VN', priority: 1 },
  { id: 'vi-VN-Standard-D', name: 'Male Voice 2 (Vietnam) - Standard', gender: 'male', language: 'vi-VN', priority: 1 },

  // Giọng tiếng Anh - Wavenet
  { id: 'en-US-Wavenet-A', name: 'Male Voice 1 (US) - Wavenet', gender: 'male', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-B', name: 'Male Voice 2 (US) - Wavenet', gender: 'male', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-C', name: 'Female Voice 1 (US) - Wavenet', gender: 'female', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-D', name: 'Male Voice 3 (US) - Wavenet', gender: 'male', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-E', name: 'Female Voice 2 (US) - Wavenet', gender: 'female', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-F', name: 'Female Voice 3 (US) - Wavenet', gender: 'female', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-G', name: 'Female Voice 4 (US) - Wavenet', gender: 'female', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-H', name: 'Female Voice 5 (US) - Wavenet', gender: 'female', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-I', name: 'Male Voice 4 (US) - Wavenet', gender: 'male', language: 'en-US', priority: 2 },
  { id: 'en-US-Wavenet-J', name: 'Male Voice 5 (US) - Wavenet', gender: 'male', language: 'en-US', priority: 2 },

  // Giọng tiếng Trung
  { id: 'cmn-CN-Wavenet-A', name: 'Female Voice 1 (China)', gender: 'female', language: 'zh-CN', priority: 3 },
  { id: 'cmn-CN-Wavenet-B', name: 'Male Voice 1 (China)', gender: 'male', language: 'zh-CN', priority: 3 },
  { id: 'cmn-CN-Wavenet-C', name: 'Female Voice 2 (China)', gender: 'female', language: 'zh-CN', priority: 3 },
  { id: 'cmn-CN-Wavenet-D', name: 'Male Voice 2 (China)', gender: 'male', language: 'zh-CN', priority: 3 },

  // Giọng tiếng Nhật
  { id: 'ja-JP-Wavenet-A', name: 'Female Voice 1 (Japan)', gender: 'female', language: 'ja-JP', priority: 3 },
  { id: 'ja-JP-Wavenet-B', name: 'Male Voice 1 (Japan)', gender: 'male', language: 'ja-JP', priority: 3 },
  { id: 'ja-JP-Wavenet-C', name: 'Female Voice 2 (Japan)', gender: 'female', language: 'ja-JP', priority: 3 },
  { id: 'ja-JP-Wavenet-D', name: 'Male Voice 2 (Japan)', gender: 'male', language: 'ja-JP', priority: 3 },

  // Giọng tiếng Hàn
  { id: 'ko-KR-Wavenet-A', name: 'Female Voice 1 (Korea)', gender: 'female', language: 'ko-KR', priority: 3 },
  { id: 'ko-KR-Wavenet-B', name: 'Male Voice 1 (Korea)', gender: 'male', language: 'ko-KR', priority: 3 },
  { id: 'ko-KR-Wavenet-C', name: 'Female Voice 2 (Korea)', gender: 'female', language: 'ko-KR', priority: 3 },
  { id: 'ko-KR-Wavenet-D', name: 'Male Voice 2 (Korea)', gender: 'male', language: 'ko-KR', priority: 3 },

  // Giọng tiếng Pháp
  { id: 'fr-FR-Wavenet-A', name: 'Female Voice 1 (France)', gender: 'female', language: 'fr-FR', priority: 3 },
  { id: 'fr-FR-Wavenet-B', name: 'Male Voice 1 (France)', gender: 'male', language: 'fr-FR', priority: 3 },
  { id: 'fr-FR-Wavenet-C', name: 'Female Voice 2 (France)', gender: 'female', language: 'fr-FR', priority: 3 },
  { id: 'fr-FR-Wavenet-D', name: 'Male Voice 2 (France)', gender: 'male', language: 'fr-FR', priority: 3 },

  // Giọng tiếng Đức
  { id: 'de-DE-Wavenet-A', name: 'Female Voice 1 (Germany)', gender: 'female', language: 'de-DE', priority: 3 },
  { id: 'de-DE-Wavenet-B', name: 'Male Voice 1 (Germany)', gender: 'male', language: 'de-DE', priority: 3 },
  { id: 'de-DE-Wavenet-C', name: 'Female Voice 2 (Germany)', gender: 'female', language: 'de-DE', priority: 3 },
  { id: 'de-DE-Wavenet-D', name: 'Male Voice 2 (Germany)', gender: 'male', language: 'de-DE', priority: 3 },

  // Giọng tiếng Tây Ban Nha
  { id: 'es-ES-Wavenet-A', name: 'Female Voice 1 (Spain)', gender: 'female', language: 'es-ES', priority: 3 },
  { id: 'es-ES-Wavenet-B', name: 'Male Voice 1 (Spain)', gender: 'male', language: 'es-ES', priority: 3 },
  { id: 'es-ES-Wavenet-C', name: 'Female Voice 2 (Spain)', gender: 'female', language: 'es-ES', priority: 3 },
  { id: 'es-ES-Wavenet-D', name: 'Male Voice 2 (Spain)', gender: 'male', language: 'es-ES', priority: 3 },

  // Giọng tiếng Ý
  { id: 'it-IT-Wavenet-A', name: 'Female Voice 1 (Italy)', gender: 'female', language: 'it-IT', priority: 3 },
  { id: 'it-IT-Wavenet-B', name: 'Male Voice 1 (Italy)', gender: 'male', language: 'it-IT', priority: 3 },
  { id: 'it-IT-Wavenet-C', name: 'Female Voice 2 (Italy)', gender: 'female', language: 'it-IT', priority: 3 },
  { id: 'it-IT-Wavenet-D', name: 'Male Voice 2 (Italy)', gender: 'male', language: 'it-IT', priority: 3 },

  // Giọng tiếng Bồ Đào Nha
  { id: 'pt-BR-Wavenet-A', name: 'Female Voice 1 (Portugal)', gender: 'female', language: 'pt-BR', priority: 3 },
  { id: 'pt-BR-Wavenet-B', name: 'Male Voice 1 (Portugal)', gender: 'male', language: 'pt-BR', priority: 3 },
  { id: 'pt-BR-Wavenet-C', name: 'Female Voice 2 (Portugal)', gender: 'female', language: 'pt-BR', priority: 3 },
  { id: 'pt-BR-Wavenet-D', name: 'Male Voice 2 (Portugal)', gender: 'male', language: 'pt-BR', priority: 3 },

  // Giọng tiếng Nga
  { id: 'ru-RU-Wavenet-A', name: 'Female Voice 1 (Russia)', gender: 'female', language: 'ru-RU', priority: 3 },
  { id: 'ru-RU-Wavenet-B', name: 'Male Voice 1 (Russia)', gender: 'male', language: 'ru-RU', priority: 3 },
  { id: 'ru-RU-Wavenet-C', name: 'Female Voice 2 (Russia)', gender: 'female', language: 'ru-RU', priority: 3 },
  { id: 'ru-RU-Wavenet-D', name: 'Male Voice 2 (Russia)', gender: 'male', language: 'ru-RU', priority: 3 },

  // Giọng tiếng Hindi
  { id: 'hi-IN-Wavenet-A', name: 'Female Voice 1 (Hindi)', gender: 'female', language: 'hi-IN', priority: 3 },
  { id: 'hi-IN-Wavenet-B', name: 'Male Voice 1 (Hindi)', gender: 'male', language: 'hi-IN', priority: 3 },
  { id: 'hi-IN-Wavenet-C', name: 'Female Voice 2 (Hindi)', gender: 'female', language: 'hi-IN', priority: 3 },
  { id: 'hi-IN-Wavenet-D', name: 'Male Voice 2 (Hindi)', gender: 'male', language: 'hi-IN', priority: 3 },

  // Giọng tiếng Ả Rập
  { id: 'ar-XA-Wavenet-A', name: 'Female Voice 1 (Arabic)', gender: 'female', language: 'ar-XA', priority: 3 },
  { id: 'ar-XA-Wavenet-B', name: 'Male Voice 1 (Arabic)', gender: 'male', language: 'ar-XA', priority: 3 },
  { id: 'ar-XA-Wavenet-C', name: 'Female Voice 2 (Arabic)', gender: 'female', language: 'ar-XA', priority: 3 },
  { id: 'ar-XA-Wavenet-D', name: 'Male Voice 2 (Arabic)', gender: 'male', language: 'ar-XA', priority: 3 },

  // Giọng tiếng Thái
  { id: 'th-TH-Wavenet-A', name: 'Female Voice 1 (Thai)', gender: 'female', language: 'th-TH', priority: 3 },
  { id: 'th-TH-Wavenet-B', name: 'Male Voice 1 (Thai)', gender: 'male', language: 'th-TH', priority: 3 },
  { id: 'th-TH-Wavenet-C', name: 'Female Voice 2 (Thai)', gender: 'female', language: 'th-TH', priority: 3 },
  { id: 'th-TH-Wavenet-D', name: 'Male Voice 2 (Thai)', gender: 'male', language: 'th-TH', priority: 3 },

  // Giọng tiếng Indonesia
  { id: 'id-ID-Wavenet-A', name: 'Female Voice 1 (Indonesia)', gender: 'female', language: 'id-ID', priority: 3 },
  { id: 'id-ID-Wavenet-B', name: 'Male Voice 1 (Indonesia)', gender: 'male', language: 'id-ID', priority: 3 },
  { id: 'id-ID-Wavenet-C', name: 'Female Voice 2 (Indonesia)', gender: 'female', language: 'id-ID', priority: 3 },
  { id: 'id-ID-Wavenet-D', name: 'Male Voice 2 (Indonesia)', gender: 'male', language: 'id-ID', priority: 3 },
];

const ContentGenerator = ({ script, onNext, onBack, initialContent }) => {
  const [scenes, setScenes] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewAudios, setPreviewAudios] = useState({});
  const [isPreviewing, setIsPreviewing] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [generatedImages, setGeneratedImages] = useState({});
  const [generatedVoices, setGeneratedVoices] = useState({});
  const [regeneratingScene, setRegeneratingScene] = useState(null);

  // Hàm tạo voice cho toàn bộ script
  const generateVoicesForScript = async () => {
    if (!scenes.length) return false;
    
    setIsGeneratingAll(true);
    const newGeneratedVoices = {};
    const newPreviewAudios = {};

    try {
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        
        // Kiểm tra xem voice đã được generate chưa
        if (generatedVoices[i + 1] && 
            scene.voiceSettings.voice_id === generatedVoices[i + 1].voice_id &&
            scene.voiceSettings.speed === generatedVoices[i + 1].speed) {
          continue;
        }
        
        if (scene.voiceSettings.option === 'generate') {
          const response = await voiceAPI.textToSpeech({
            text: scene.voice_over,
            ...scene.voiceSettings
          });
          newGeneratedVoices[i + 1] = response.data;
          newPreviewAudios[i + 1] = `data:audio/mp3;base64,${response.data.audio_base64}`;
        }
      }

      setGeneratedVoices(prev => ({...prev, ...newGeneratedVoices}));
      setPreviewAudios(prev => ({...prev, ...newPreviewAudios}));
      return true;
    } catch (error) {
      console.error('Error generating voices:', error);
      setError('Có lỗi xảy ra khi tạo giọng đọc cho video');
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
        response.data.forEach((image, index) => {
          const scene = script.scenes[index];
          console.log('scene', scene);
          if (scene) {
            const imageData = {
              id: image.id,
              url: image.image_url,
              prompt: image.prompt,
              width: image.width,
              height: image.height,
              created_at: image.created_at,
              scene_id: image.scene_id
            };
            
            // Cập nhật state ngay khi có kết quả cho một scene
            setGeneratedImages(prev => ({
              ...prev,
              [index + 1]: imageData
            }));
            console.log('Generated images:', generatedImages);
          }
        });
        return true;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      setError('Có lỗi xảy ra khi tạo ảnh cho video');
      return false;
    }
  };

  // Hàm tạo nội dung song song
  const generateContentForScript = async () => {
    setIsGeneratingAll(true);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Bắt đầu tạo nội dung...');
      
      // Chạy song song 2 hàm generate
      generateVoicesForScript().then( result => {
      
        generateImagesForScript().then( result => {
          setIsGeneratingAll(false);
      setLoading(false);
        });
      });

      console.log('Tạo nội dung thành công');
    } catch (error) {
      console.error('Lỗi khi tạo nội dung:', error);
      setError('Có lỗi xảy ra khi tạo nội dung cho video');
    } finally {
      setIsGeneratingAll(false);
      setLoading(false);
    }
  };

  // Khởi tạo scenes và tạo nội dung khi component mount
  useEffect(() => {
    if (script && Object.keys(generatedImages).length === 0) {
      const initialScenes = script.scenes.map(scene => {
        // Nhận diện ngôn ngữ từ nội dung giọng đọc
        const detectedLanguage = detectLanguage(scene.voice_over);
        
        // Lấy giọng đọc mặc định cho ngôn ngữ đã nhận diện
        const defaultVoice = getDefaultVoiceForLanguage(VOICE_OPTIONS, detectedLanguage);
        
        return {
          ...scene,
          voiceSettings: {
            voice_id: defaultVoice?.id || 'vi-VN-Wavenet-A',
            speed: 1.0,
            option: 'generate',
            text: scene.voice_over,
            language: detectedLanguage
          }
        };
      });
      setScenes(initialScenes);
      
      console.log('Scenes initialized:', initialScenes);

      // Tự động tạo nội dung khi chuyển từ bước 1 sang bước 2 
      generateContentForScript();
      
    }
  }, [script]);

  useEffect(() => {
    if (initialContent) {
      const processedContent = initialContent.map(scene => ({
        ...scene,
        voiceSettings: scene.voiceSettings || {
          voice_id: 'vi-VN-Wavenet-A',
          speed: 1.0,
          option: 'generate',
          text: scene.voice_over,
          language: detectLanguage(scene.voice_over)
        }
      }));
      setScenes(processedContent);
      setLoading(false);
    }
  }, [initialContent]);

  // Cập nhật voice settings khi nội dung giọng đọc thay đổi
  const handleVoiceOverChange = (sceneIndex, value) => {
    setScenes(prev => {
      const newScenes = [...prev];
      const detectedLanguage = detectLanguage(value);
      
      // Lọc các giọng đọc phù hợp với ngôn ngữ
      const compatibleVoices = VOICE_OPTIONS.filter(voice => voice.language === detectedLanguage);
      
      // Lấy giọng đọc mặc định cho ngôn ngữ
      const defaultVoice = getDefaultVoiceForLanguage(compatibleVoices, detectedLanguage);
      
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voice_over: value,
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          voice_id: defaultVoice?.id || 'vi-VN-Wavenet-A',
          text: value,
          language: detectedLanguage
        }
      };
      return newScenes;
    });
    setHasChanges(true);
  };

  // Cập nhật voice settings khi thay đổi giọng đọc
  const handleVoiceIdChange = (sceneIndex, value) => {
    setScenes(prev => {
      const newScenes = [...prev];
      const selectedVoice = VOICE_OPTIONS.find(voice => voice.id === value);
      
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          voice_id: value,
          language: selectedVoice?.language || 'vi-VN'
        }
      };
      return newScenes;
    });
    setHasChanges(true);
  };

  // Cập nhật voice settings khi thay đổi tốc độ đọc
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

  // Cập nhật voice settings khi thay đổi option (generate/upload)
  const handleVoiceOptionChange = (sceneIndex, value) => {
    setScenes(prev => {
      const newScenes = [...prev];
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          option: value
        }
      };
      return newScenes;
    });
    setHasChanges(true);
  };

  // Hàm xử lý file upload
  const handleFileUpload = (sceneIndex, file) => {
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.type.startsWith('audio/')) {
      setError('Vui lòng chọn file âm thanh hợp lệ (mp3, wav, etc.)');
      return;
    }

    // Kiểm tra kích thước file (giới hạn 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 10MB');
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [sceneIndex]: file
    }));

    setScenes(prev => {
      const newScenes = [...prev];
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voiceFile: file,
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          option: 'upload'
        }
      };
      return newScenes;
    });

    // Tạo URL preview và cập nhật vào previewAudios
    const audioUrl = URL.createObjectURL(file);
    setPreviewAudios(prev => ({
      ...prev,
      [sceneIndex + 1]: audioUrl
    }));

    // Cập nhật generatedVoices để hiển thị file đã upload
    setGeneratedVoices(prev => ({
      ...prev,
      [sceneIndex + 1]: {
        audio_base64: audioUrl,
        is_uploaded: true
      }
    }));

    setHasChanges(true);
  };

  // Hàm xử lý xóa file đã upload
  const handleRemoveUploadedFile = (sceneIndex) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[sceneIndex];
      return newFiles;
    });

    setScenes(prev => {
      const newScenes = [...prev];
      newScenes[sceneIndex] = {
        ...newScenes[sceneIndex],
        voiceFile: null,
        voiceSettings: {
          ...newScenes[sceneIndex].voiceSettings,
          option: 'generate'
        }
      };
      return newScenes;
    });

    // Xóa preview audio
    setPreviewAudios(prev => {
      const newAudios = { ...prev };
      delete newAudios[sceneIndex + 1];
      return newAudios;
    });

    // Xóa generated voice
    setGeneratedVoices(prev => {
      const newVoices = { ...prev };
      delete newVoices[sceneIndex + 1];
      return newVoices;
    });

    setHasChanges(true);
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
      setError(`Không thể tạo lại giọng đọc cho scene ${sceneIndex + 1}`);
    } finally {
      setRegeneratingScene(null);
    }
  };

  // Hàm tạo lại ảnh cho một scene
  const handleRegenerateImage = async (sceneNumber, prompt) => {
    try {
      setRegeneratingScene(sceneNumber);
      const newImage = await generateImageForScene(sceneNumber, prompt);
      console.log('New image data:', newImage);
      
      setGeneratedImages(prev => {
        const updatedImages = { ...prev };
        updatedImages[sceneNumber] = {
          id: newImage.id,
          url: newImage.image_url,
          prompt: newImage.prompt,
          width: newImage.width,
          height: newImage.height,
          created_at: newImage.created_at,
          scene_id: newImage.scene_id
        };
        console.log('Updated images:', updatedImages);
        return updatedImages;
      });

      console.log(`Đã tạo lại ảnh cho scene ${sceneNumber + 1} thành công`);
    } catch (error) {
      console.error('Lỗi khi tạo lại ảnh:', error);
      setError(`Không thể tạo lại ảnh cho scene ${sceneNumber + 1}: ${error.message}`);
    } finally {
      setRegeneratingScene(null);
    }
  };

  const generateImageForScene = async (sceneNumber, prompt) => {
    const existingImage = generatedImages[sceneNumber];
    if (!existingImage || !existingImage.scene_id) {
        console.error('Image not found or missing id:', existingImage);
        throw new Error('Không tìm thấy thông tin scene');
    }

    console.log('Generating image for scene:', {
        scene_id: existingImage.scene_id,
        prompt: prompt,
        width: 1024,
        height: 768
    });

    const response = await imageAPI.generateImage({
        scene_id: existingImage.scene_id,
        prompt: prompt,
        width: 1024,
        height: 768
    });
    console.log('API response:', response.data);
    return response.data;
}
  // Hàm preview voice
  const handlePreview = async (sceneIndex) => {
    const scene = scenes[sceneIndex];
    setIsPreviewing(prev => ({ ...prev, [sceneIndex]: true }));
    setError(null);

    try {
      if (scene.voiceSettings.option === 'generate') {
        const response = await voiceAPI.textToSpeech({
          text: scene.voice_over,
          ...scene.voiceSettings
        });
        
        const audioUrl = `data:audio/mp3;base64,${response.data.audio_base64}`;
        setPreviewAudios(prev => ({
          ...prev,
          [sceneIndex]: audioUrl
        }));
      } else if (scene.voiceFile) {
        const audioUrl = URL.createObjectURL(scene.voiceFile);
        setPreviewAudios(prev => ({
          ...prev,
          [sceneIndex]: audioUrl
        }));
      }
    } catch (err) {
      setError(`Không thể tạo bản xem trước cho cảnh ${sceneIndex + 1}`);
    } finally {
      setIsPreviewing(prev => ({ ...prev, [sceneIndex]: false }));
    }
  };

  const handleNext = () => {
    // Chuẩn bị dữ liệu scenes với đầy đủ thông tin cần thiết
    const processedScenes = scenes.map((scene, index) => {
      // Lấy thông tin voice từ generatedVoices
      const voiceData = generatedVoices[index + 1];
      
      // Lấy thông tin image từ generatedImages
      const imageData = generatedImages[index + 1];

      // Kiểm tra xem scene có đủ dữ liệu không
      if (!voiceData || !imageData) {
        throw new Error(`Scene ${index + 1} chưa có đủ dữ liệu voice hoặc image`);
      }

      return {
        id: scene.id,
        scene_number: index + 1,
        voice_over: scene.voice_over,
        visual_elements: scene.visual_elements,
        voice: {
          audio_base64: voiceData.audio_base64,
          voice_id: scene.voiceSettings.voice_id,
          speed: scene.voiceSettings.speed
        },
        image: {
          id: imageData.id,
          url: imageData.url,
          prompt: imageData.prompt,
          width: imageData.width,
          height: imageData.height
        }
      };
    });

    // Kiểm tra xem tất cả scenes đã có đủ dữ liệu chưa
    const isComplete = processedScenes.every(scene => 
      scene.voice && scene.image && scene.voice_over && scene.visual_elements
    );

    if (!isComplete) {
      setError('Vui lòng đảm bảo tất cả các scene đã có đầy đủ giọng đọc và hình ảnh');
      return;
    }

    // Gọi callback với dữ liệu đã xử lý
    onNext(processedScenes);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Scenes List */}
        <h3 className="text-xl font-semibold text-white mb-4">Các cảnh</h3>
        <div className="space-y-6  overflow-y-auto pr-4 ">
          {scenes.map((scene, index) => (
            <div key={index} className="bg-gray-800/50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium text-white">
                  Cảnh {index + 1}
                </h4>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Scene Info and Voice */}
                <div className="space-y-4">
                  {/* <SceneInfo scene={scene} /> */}
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Giọng đọc</h5>
                    <div className="space-y-4">
                      <div className="bg-gray-900/50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Nội dung đọc
                        </label>
                        <textarea
                          value={scene.voice_over}
                          onChange={(e) => handleVoiceOverChange(index, e.target.value)}
                          className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white 
                                   placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nhập nội dung cần đọc..."
                        />
                      </div>

                      <VoiceOptionsEditor
                        voiceSettings={scene.voiceSettings}
                        onOptionChange={(value) => handleVoiceOptionChange(index, value)}
                        onVoiceIdChange={(value) => handleVoiceIdChange(index, value)}
                        onSpeedChange={(value) => handleVoiceSpeedChange(index, value)}
                        onFileChange={(file) => handleFileUpload(index, file)}
                        voiceOptions={VOICE_OPTIONS}
                        currentLanguage={scene.voiceSettings?.language || 'vi-VN'}
                        uploadedFile={scene.voiceFile}
                      />

                      <div className="mt-4">
                        <button
                          onClick={() => handleRegenerateVoice(index)}
                          disabled={regeneratingScene === index}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                   hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          {regeneratingScene === index ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Đang tạo lại giọng đọc...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Tạo lại giọng đọc</span>
                            </>
                          )}
                        </button>
                        {generatedVoices[index + 1] && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                              <audio
                                src={previewAudios[index + 1]}
                                controls
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image */}
                <div>
                  <h5 className="text-white font-medium mb-2">Hình ảnh</h5>
                  <div className="space-y-4">
                    <SceneImage
                      sceneImage={generatedImages[index + 1]}
                      sceneNumber={index + 1}
                      isRegenerating={regeneratingScene === index}
                    />
                    <SceneEditor
                      sceneNumber={index + 1}
                      prompt={scene.visual_elements}
                      onPromptChange={(value) => handleVisualElementsChange(index, value)}
                      onRegenerate={() => handleRegenerateImage(index)}
                      isRegenerating={regeneratingScene === index}
                    />
                  </div>
                </div>
              </div>

              {scene.error && (
                <p className="text-red-500 mt-4">{scene.error}</p>
              )}
            </div>
          ))}
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
          onClick={handleNext}
          disabled={!scenes.some((scene, index) => {
            const hasVoice = generatedVoices[index + 1] || scene.voiceSettings.option === 'upload';
            const hasImage = generatedImages[index + 1];
            return hasVoice && hasImage;
          })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700"
        >
          Tiếp tục
        </button>
      </div>

      <ErrorMessage message={error} />
    </div>
  );
};

export default ContentGenerator; 