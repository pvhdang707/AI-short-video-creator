// pages/CreateVideo/Step2_Voice.jsx
import React, { useState, useEffect } from 'react';
import StepProgress from '../../components/StepProgress/StepProgress';
import VoiceOptions from '../../components/VoiceOptions/VoiceOptions';
import FileUploader from '../../components/FileUploader/FileUploader';
import { voiceAPI } from '../../services/api';
//import { VIDEO_STEPS } from '../../constants';

const VOICE_OPTIONS = [
    // Giọng tiếng Việt - Ưu tiên
    { id: 'vi-VN-Wavenet-A', name: 'Giọng nữ 1 (Việt Nam)', gender: 'female', language: 'vi-VN', priority: 1 },
    { id: 'vi-VN-Wavenet-B', name: 'Giọng nam 1 (Việt Nam)', gender: 'male', language: 'vi-VN', priority: 1 },
    { id: 'vi-VN-Wavenet-C', name: 'Giọng nữ 2 (Việt Nam)', gender: 'female', language: 'vi-VN', priority: 1 },
    { id: 'vi-VN-Wavenet-D', name: 'Giọng nam 2 (Việt Nam)', gender: 'male', language: 'vi-VN', priority: 1 },
    { id: 'vi-VN-Wavenet-E', name: 'Giọng nữ 3 (Việt Nam)', gender: 'female', language: 'vi-VN', priority: 1 },
    { id: 'vi-VN-Wavenet-F', name: 'Giọng nam 3 (Việt Nam)', gender: 'male', language: 'vi-VN', priority: 1 },
    { id: 'vi-VN-Wavenet-G', name: 'Giọng nữ 4 (Việt Nam)', gender: 'female', language: 'vi-VN', priority: 1 },
    { id: 'vi-VN-Wavenet-H', name: 'Giọng nam 4 (Việt Nam)', gender: 'male', language: 'vi-VN', priority: 1 },

    // Giọng tiếng Anh - Wavenet
    { id: 'en-US-Wavenet-C', name: 'Giọng nữ 1 (Mỹ)', gender: 'female', language: 'en-US', priority: 2 },
    { id: 'en-US-Wavenet-A', name: 'Giọng nam 1 (Mỹ)', gender: 'male', language: 'en-US', priority: 2 },
    { id: 'en-US-Wavenet-E', name: 'Giọng nữ 2 (Mỹ)', gender: 'female', language: 'en-US', priority: 2 },
    { id: 'en-US-Wavenet-B', name: 'Giọng nam 2 (Mỹ)', gender: 'male', language: 'en-US', priority: 2 },
    { id: 'en-US-Wavenet-F', name: 'Giọng nữ 3 (Mỹ)', gender: 'female', language: 'en-US', priority: 2 },
    { id: 'en-US-Wavenet-D', name: 'Giọng nam 3 (Mỹ)', gender: 'male', language: 'en-US', priority: 2 },
    { id: 'en-US-Wavenet-G', name: 'Giọng nữ 4 (Mỹ)', gender: 'female', language: 'en-US', priority: 2 },
    { id: 'en-US-Wavenet-I', name: 'Giọng nam 4 (Mỹ)', gender: 'male', language: 'en-US', priority: 2 },

    
];

const Step2_Voice = ({ script, onNext, onBack }) => {
    const [editedScenes, setEditedScenes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewAudios, setPreviewAudios] = useState({});
    const [formattedScript, setFormattedScript] = useState('');
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState({});
    const [generatedVoiceFiles, setGeneratedVoiceFiles] = useState(null);
    const [isPreviewingAll, setIsPreviewingAll] = useState(false);
    const [previewAllAudio, setPreviewAllAudio] = useState(null);

    // Format script để hiển thị
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
            // Khởi tạo state cho từng scene với các tùy chọn mặc định
            setEditedScenes(script.scenes.map(scene => ({
                ...scene,
                voiceSettings: {
                    voice_id: 'vi-VN-Wavenet-A',
                    speed: 1.0,
                    option: 'generate' // 'generate' hoặc 'upload'
                },
                voiceFile: null
            })));
        } catch (error) {
            console.error('Error formatting script:', error);
            setFormattedScript('Có lỗi xảy ra khi định dạng kịch bản');
            setEditedScenes([]);
        }
    }, [script]);

    // Tự động tạo giọng đọc khi component được mount
    useEffect(() => {
        const generateInitialVoices = async () => {
            if (!editedScenes.length) return;
            
            setIsGeneratingAll(true);
            const generatedFiles = [];
            const newPreviewAudios = {};

            for (let i = 0; i < editedScenes.length; i++) {
                const scene = editedScenes[i];
                
                try {
                    if (scene.voiceSettings.option === 'generate') {
                        const response = await voiceAPI.textToSpeech({
                            text: scene.voice_over,
                            ...scene.voiceSettings
                        });
                        generatedFiles.push(response.data);
                        // Tạo URL preview cho scene này
                        newPreviewAudios[i] = `data:audio/mp3;base64,${response.data.audio_base64}`;
                    }
                } catch (error) {
                    console.error(`Lỗi khi tạo giọng đọc cho scene ${i + 1}:`, error);
                    setError(`Không thể tạo giọng đọc cho scene ${i + 1}`);
                }
            }

            setGeneratedVoiceFiles(generatedFiles);
            setPreviewAudios(newPreviewAudios);
            setIsGeneratingAll(false);
        };

        generateInitialVoices();
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

    const handleGenerateAll = async () => {
        try {
            setIsGeneratingAll(true);
            const generatedFiles = [];
            const newPreviewAudios = {};

            for (let i = 0; i < editedScenes.length; i++) {
                const scene = editedScenes[i];
                
                try {
                    if (scene.voiceSettings.option === 'generate') {
                        const response = await voiceAPI.textToSpeech({
                            text: scene.voice_over,
                            ...scene.voiceSettings
                        });
                        generatedFiles.push(response.data);
                        // Tạo URL preview cho scene này
                        newPreviewAudios[i] = `data:audio/mp3;base64,${response.data.audio_base64}`;
                    } else if (scene.voiceFile) {
                        // Xử lý file upload
                        generatedFiles.push({
                            scene_id: scene.id,
                            audio_file: scene.voiceFile
                        });
                        // Tạo URL preview cho file upload
                        newPreviewAudios[i] = URL.createObjectURL(scene.voiceFile);
                    }
                } catch (error) {
                    console.error(`Lỗi khi tạo giọng đọc cho scene ${i + 1}:`, error);
                    setError(`Không thể tạo giọng đọc cho scene ${i + 1}`);
                }
            }

            setGeneratedVoiceFiles(generatedFiles);
            setPreviewAudios(newPreviewAudios);
        } catch (error) {
            console.error('Error generating all voices:', error);
            setError('Có lỗi xảy ra khi tạo giọng đọc cho toàn bộ video');
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
                    <h1 className="text-2xl font-bold mt-4 text-center">Tạo giọng đọc cho video</h1>
                    <p className="text-gray-400 text-center mt-2">
                        Hệ thống sẽ tự động tạo giọng đọc dựa trên kịch bản của bạn
                    </p>
                </div>

                {/* Script Preview */}
                <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">Kịch bản:</h3>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                            {formattedScript}
                        </pre>
                    </div>
                </div>

                {/* Voice Generation Section */}
                <div className="space-y-6">
                    {editedScenes.map((scene, index) => (
                        <div key={scene.id || index} className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-blue-400">
                                        Cảnh {index + 1}
                                    </h3>
                                    {isGeneratingAll && (
                                        <span className="text-sm text-gray-400">
                                            Đang tạo giọng đọc...
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Phần nội dung và cài đặt */}
                                    <div className="space-y-6">
                                        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                                            <h4 className="text-lg font-semibold text-blue-400">Nội dung giọng đọc</h4>
                                            <textarea
                                                value={scene.voice_over}
                                                onChange={(e) => handleSceneEdit(index, 'voice_over', e.target.value)}
                                                className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                rows={3}
                                                placeholder="Nhập nội dung giọng đọc cho cảnh này..."
                                            />
                                        </div>

                                        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                                            <h4 className="text-lg font-semibold text-blue-400">Tùy chọn giọng đọc</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button 
                                                    onClick={() => handleSceneEdit(index, 'voiceSettings.option', 'generate')}
                                                    className={`p-3 rounded-lg transition-colors duration-200 ${
                                                        scene.voiceSettings.option === 'generate' 
                                                            ? 'bg-blue-600 text-white' 
                                                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                                                    }`}
                                                >
                                                    Tạo giọng đọc
                                                </button>
                                                <button 
                                                    onClick={() => handleSceneEdit(index, 'voiceSettings.option', 'upload')}
                                                    className={`p-3 rounded-lg transition-colors duration-200 ${
                                                        scene.voiceSettings.option === 'upload' 
                                                            ? 'bg-blue-600 text-white' 
                                                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                                                    }`}
                                                >
                                                    Upload file
                                                </button>
                                            </div>

                                            {scene.voiceSettings.option === 'generate' ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                                            Giọng đọc
                                                        </label>
                                                        <select
                                                            value={scene.voiceSettings.voice_id}
                                                            onChange={(e) => handleSceneEdit(index, 'voiceSettings.voice_id', e.target.value)}
                                                            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        >
                                                            {VOICE_OPTIONS.map(voice => (
                                                                <option key={voice.id} value={voice.id}>
                                                                    {voice.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                                            Tốc độ đọc: {scene.voiceSettings.speed}x
                                                        </label>
                                                        <input
                                                            type="range"
                                                            min="0.5"
                                                            max="2"
                                                            step="0.1"
                                                            value={scene.voiceSettings.speed}
                                                            onChange={(e) => handleSceneEdit(index, 'voiceSettings.speed', parseFloat(e.target.value))}
                                                            className="w-full accent-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <FileUploader
                                                    accept="audio/*"
                                                    onFileChange={(file) => handleSceneEdit(index, 'voiceFile', file)}
                                                    label="Chọn file giọng đọc"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Phần preview */}
                                    <div className="space-y-6">
                                        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                                            <h4 className="text-lg font-semibold text-blue-400">Nghe thử</h4>
                                            <button
                                                onClick={() => handlePreview(index)}
                                                disabled={isPreviewing[index]}
                                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                                         hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                                            >
                                                {isPreviewing[index] ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        <span>Đang tạo...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Nghe thử</span>
                                                    </>
                                                )}
                                            </button>

                                            {previewAudios[index] && (
                                                <div className="mt-4">
                                                    <audio 
                                                        controls 
                                                        className="w-full"
                                                        key={previewAudios[index]}
                                                    >
                                                        <source src={previewAudios[index]} type="audio/mpeg" />
                                                        Trình duyệt của bạn không hỗ trợ phát audio
                                                    </audio>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                        Quay lại
                    </button>
                    <button 
                        onClick={() => onNext(generatedVoiceFiles)}
                        disabled={!generatedVoiceFiles || isGeneratingAll}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        {isGeneratingAll ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Đang tạo giọng đọc...</span>
                            </>
                        ) : (
                            <>
                                <span>Tiếp tục</span>
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