// pages/CreateVideo/Step2_Voice.jsx
import React, { useState, useEffect, useRef } from 'react';
import StepProgress from '../../components/StepProgress/StepProgress';
import SceneVoiceEditor from '../../components/VoiceEditor/SceneVoiceEditor';
import { voiceAPI } from '../../services/api';
import { detectLanguage, getDefaultVoiceForLanguage } from '../../utils/languageUtils';
//import { VIDEO_STEPS } from '../../constants';

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

const Step2_Voice = ({ script, onNext, onBack }) => {
    const [editedScenes, setEditedScenes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewAudios, setPreviewAudios] = useState({});
    const [formattedScript, setFormattedScript] = useState('');
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState({});
    const [generatedVoiceFiles, setGeneratedVoiceFiles] = useState({});
    const [isPreviewingAll, setIsPreviewingAll] = useState(false);
    const [previewAllAudio, setPreviewAllAudio] = useState(null);
    const [updatedScript, setUpdatedScript] = useState(script);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const fileInputRefs = useRef({});

    // Format script và khởi tạo scenes với voice settings phù hợp
    useEffect(() => {
        if (!script || !script.scenes) {
            setFormattedScript('Chưa có kịch bản');
            setEditedScenes([]);
            return;
        }

        try {
            let formattedText = `Tiêu đề: ${script.title || 'Chưa có tiêu đề'}\n\n`;
            formattedText += `Mô tả: ${script.description || 'Chưa có mô tả'}\n\n`;
            formattedText += `Thời lượng: ${script.total_duration || 0} giây\n\n`;
            formattedText += `Các cảnh:\n\n`;

            script.scenes.forEach((scene, index) => {
                formattedText += `Cảnh ${index + 1}:\n`;
                formattedText += `- Mô tả: ${scene.description || 'Chưa có mô tả'}\n`;
                formattedText += `- Thời lượng: ${scene.duration || 0} giây\n`;
                formattedText += `- Giọng đọc: ${scene.voice_over || 'Chưa có giọng đọc'}\n`;
                formattedText += `- Yếu tố hình ảnh: ${scene.visual_elements || 'Chưa có yếu tố hình ảnh'}\n`;
                formattedText += `- Nhạc nền: ${scene.background_music || 'Chưa có nhạc nền'}\n\n`;
            });

            setFormattedScript(formattedText);

            // Khởi tạo scenes với voice settings phù hợp dựa trên ngôn ngữ
            const scenesWithVoiceSettings = script.scenes.map(scene => {
                const detectedLanguage = detectLanguage(scene.voice_over);
                const defaultVoice = getDefaultVoiceForLanguage(VOICE_OPTIONS, detectedLanguage);
                
                return {
                    ...scene,
                    voiceSettings: {
                        voice_id: defaultVoice?.id || 'vi-VN-Wavenet-A',
                        speed: 1.0,
                        option: 'generate'
                    },
                    voiceFile: null
                };
            });

            setEditedScenes(scenesWithVoiceSettings);
            setUpdatedScript(script);
        } catch (error) {
            console.error('Error formatting script:', error);
            setFormattedScript('Có lỗi xảy ra khi định dạng kịch bản');
            setEditedScenes([]);
        }
    }, [script]);

    // Generate voice sau khi đã có voice settings phù hợp
    useEffect(() => {
        const generateVoices = async () => {
            if (!editedScenes.length) return;
            
            setIsGeneratingAll(true);
            const newGeneratedFiles = {};
            const newPreviewAudios = {};

            for (let i = 0; i < editedScenes.length; i++) {
                const scene = editedScenes[i];
                
                // Kiểm tra xem voice đã được generate chưa
                if (generatedVoiceFiles[i] && 
                    scene.voiceSettings.voice_id === generatedVoiceFiles[i].voice_id &&
                    scene.voiceSettings.speed === generatedVoiceFiles[i].speed) {
                    continue;
                }
                
                try {
                    if (scene.voiceSettings.option === 'generate') {
                        const response = await voiceAPI.textToSpeech({
                            text: scene.voice_over,
                            ...scene.voiceSettings
                        });
                        newGeneratedFiles[i] = response.data;
                        newPreviewAudios[i] = `data:audio/mp3;base64,${response.data.audio_base64}`;
                    }
                } catch (error) {
                    console.error(`Lỗi khi tạo giọng đọc cho scene ${i + 1}:`, error);
                    setError(`Không thể tạo giọng đọc cho scene ${i + 1}`);
                }
            }

            setGeneratedVoiceFiles(prev => ({...prev, ...newGeneratedFiles}));
            setPreviewAudios(prev => ({...prev, ...newPreviewAudios}));
            setIsGeneratingAll(false);
        };

        generateVoices();
    }, [editedScenes]);

    const handleSceneEdit = (index, field, value) => {
        setEditedScenes(prev => {
            const newScenes = [...prev];
            if (field.startsWith('voiceSettings.')) {
                const settingField = field.split('.')[1];
                newScenes[index] = {
                    ...newScenes[index],
                    voiceSettings: {
                        ...newScenes[index].voiceSettings,
                        [settingField]: value
                    }
                };
                // Xóa voice đã generate khi thay đổi voice settings
                setGeneratedVoiceFiles(prev => {
                    const newFiles = {...prev};
                    delete newFiles[index];
                    return newFiles;
                });
            } else if (field === 'voiceFile') {
                newScenes[index] = {
                    ...newScenes[index],
                    voiceFile: value
                };
            } else {
                newScenes[index] = {
                    ...newScenes[index],
                    [field]: value
                };
            }
            return newScenes;
        });

        // Cập nhật script khi nội dung giọng đọc thay đổi
        if (field === 'voice_over') {
            setUpdatedScript(prev => {
                const newScript = { ...prev };
                newScript.scenes = prev.scenes.map((scene, i) => {
                    if (i === index) {
                        return { ...scene, voice_over: value };
                    }
                    return scene;
                });
                return newScript;
            });
            // Xóa voice đã generate khi thay đổi nội dung
            setGeneratedVoiceFiles(prev => {
                const newFiles = {...prev};
                delete newFiles[index];
                return newFiles;
            });
        }
    };

    const handlePreview = async (sceneIndex) => {
        const scene = editedScenes[sceneIndex];
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
                // Xử lý preview cho file upload
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

    // Hàm xử lý khi người dùng chọn file
    const handleFileUpload = (sceneIndex, event) => {
        const file = event.target.files[0];
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

        // Cập nhật state
        setUploadedFiles(prev => ({
            ...prev,
            [sceneIndex]: file
        }));

        // Cập nhật scene với file mới
        handleSceneEdit(sceneIndex, 'voiceFile', file);
        
        // Tạo URL preview
        const audioUrl = URL.createObjectURL(file);
        setPreviewAudios(prev => ({
            ...prev,
            [sceneIndex]: audioUrl
        }));

        // Cập nhật voice settings
        handleSceneEdit(sceneIndex, 'voiceSettings', {
            ...editedScenes[sceneIndex].voiceSettings,
            option: 'upload'
        });
    };

    // Hàm xử lý khi người dùng muốn xóa file đã upload
    const handleRemoveUploadedFile = (sceneIndex) => {
        // Xóa file khỏi state
        setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[sceneIndex];
            return newFiles;
        });

        // Reset scene về trạng thái generate
        handleSceneEdit(sceneIndex, 'voiceSettings', {
            ...editedScenes[sceneIndex].voiceSettings,
            option: 'generate'
        });
        handleSceneEdit(sceneIndex, 'voiceFile', null);

        // Xóa preview audio
        setPreviewAudios(prev => {
            const newAudios = { ...prev };
            delete newAudios[sceneIndex];
            return newAudios;
        });

        // Reset file input
        if (fileInputRefs.current[sceneIndex]) {
            fileInputRefs.current[sceneIndex].value = '';
        }
    };

    // Chỉnh sửa lại hàm handleGenerateAll để xử lý cả file upload
    const handleGenerateAll = async () => {
        try {
            setIsGeneratingAll(true);
            const newGeneratedFiles = {};
            const newPreviewAudios = {};

            for (let i = 0; i < editedScenes.length; i++) {
                const scene = editedScenes[i];
                
                try {
                    if (scene.voiceSettings.option === 'generate') {
                        const response = await voiceAPI.textToSpeech({
                            text: scene.voice_over,
                            ...scene.voiceSettings
                        });
                        newGeneratedFiles[i] = response.data;
                        newPreviewAudios[i] = `data:audio/mp3;base64,${response.data.audio_base64}`;
                    } else if (scene.voiceSettings.option === 'upload' && uploadedFiles[i]) {
                        // Xử lý file upload
                        newGeneratedFiles[i] = {
                            scene_id: scene.id,
                            audio_file: uploadedFiles[i]
                        };
                        newPreviewAudios[i] = URL.createObjectURL(uploadedFiles[i]);
                    }
                } catch (error) {
                    console.error(`Lỗi khi xử lý voice cho scene ${i + 1}:`, error);
                    setError(`Không thể xử lý voice cho scene ${i + 1}`);
                }
            }

            setGeneratedVoiceFiles(prev => ({...prev, ...newGeneratedFiles}));
            setPreviewAudios(prev => ({...prev, ...newPreviewAudios}));
        } catch (error) {
            console.error('Error processing voices:', error);
            setError('Có lỗi xảy ra khi xử lý voice cho video');
        } finally {
            setIsGeneratingAll(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header với Step Progress */}
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
                    <StepProgress currentStep={2} />
                    <h1 className="text-2xl font-bold mt-4 text-center">Generate Voice Over for Video</h1>
                    <p className="text-gray-400 text-center mt-2">
                        The system will automatically generate voice over based on your script
                    </p>
                </div>

                {/* Script Preview */}
                <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">Script:</h3>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                            {formattedScript}
                        </pre>
                    </div>
                </div>

                {/* Voice Generation Section */}
                <div className="space-y-6">
                    {editedScenes.map((scene, index) => (
                        <div key={scene.id || index} className="bg-gray-800/50 rounded-xl p-6 shadow-lg">
                            <SceneVoiceEditor
                                scene={scene}
                                index={index}
                                onSceneEdit={handleSceneEdit}
                                onPreview={handlePreview}
                                isPreviewing={isPreviewing[index]}
                                previewAudio={previewAudios[index]}
                                voiceOptions={VOICE_OPTIONS}
                            />
                            
                            
                        </div>
                    ))}
                </div>

                {/* Generate All Button */}
                {/* <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg">
                    <button
                        onClick={handleGenerateAll}
                        disabled={isGeneratingAll || !script}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                        {isGeneratingAll ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Đang tạo giọng đọc...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                <span>Tạo Giọng Đọc Cho Toàn Bộ Video</span>
                            </>
                        )}
                    </button>
                    
                    {isGeneratingAll && (
                        <div className="mt-4 text-center text-gray-400">
                            Đang tạo giọng đọc cho {editedScenes.length} cảnh...
                        </div>
                    )}
                </div> */}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <button 
                        onClick={onBack}
                        className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors duration-200
                                 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <button 
                        onClick={() => onNext({ voiceFiles: generatedVoiceFiles, updatedScript })}
                        disabled={!generatedVoiceFiles || isGeneratingAll}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        {isGeneratingAll ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg shadow-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Step2_Voice;