import React, { useState, useEffect } from 'react';
import VoiceContentEditor from './VoiceContentEditor';
import VoiceOptionsEditor from './VoiceOptionsEditor';
import VoicePreview from './VoicePreview';
import { detectLanguage, filterVoicesByLanguage } from '../../utils/languageUtils';

const SceneVoiceEditor = ({
    scene,
    index,
    onSceneEdit,
    onPreview,
    isPreviewing,
    previewAudio,
    voiceOptions
}) => {
    const [currentLanguage, setCurrentLanguage] = useState('vi-VN');
    const [isInitialized, setIsInitialized] = useState(false);
    const [localPreviewAudio, setLocalPreviewAudio] = useState(previewAudio);

    // Cập nhật local preview audio khi prop thay đổi
    useEffect(() => {
        setLocalPreviewAudio(previewAudio);
    }, [previewAudio]);

    // Nhận diện ngôn ngữ khi scene được khởi tạo
    useEffect(() => {
        if (scene.voice_over && !isInitialized) {
            const detectedLang = detectLanguage(scene.voice_over);
            setCurrentLanguage(detectedLang);
            
            // Chỉ tự động chọn giọng đọc khi khởi tạo lần đầu
            const voicesForLanguage = filterVoicesByLanguage(voiceOptions, detectedLang);
            if (voicesForLanguage.length > 0 && !scene.voiceSettings.voice_id) {
                // Ưu tiên chọn giọng nữ đầu tiên
                const selectedVoice = voicesForLanguage.find(voice => voice.gender === 'female') || voicesForLanguage[0];
                handleVoiceSettingsChange('voice_id', selectedVoice.id);
            }
            setIsInitialized(true);
        }
    }, [scene.voice_over, isInitialized]);

    const handleVoiceSettingsChange = (field, value) => {
        onSceneEdit(index, `voiceSettings.${field}`, value);
    };

    const handleLanguageDetected = (language) => {
        if (language !== currentLanguage) {
            setCurrentLanguage(language);
            
            // Chỉ lọc giọng đọc phù hợp, không tự động chọn
            const voicesForLanguage = filterVoicesByLanguage(voiceOptions, language);
            if (voicesForLanguage.length > 0) {
                // Nếu giọng đọc hiện tại không phù hợp với ngôn ngữ mới
                const currentVoice = voiceOptions.find(v => v.id === scene.voiceSettings.voice_id);
                if (!currentVoice || currentVoice.language !== language) {
                    // Ưu tiên chọn giọng nữ đầu tiên
                    const selectedVoice = voicesForLanguage.find(voice => voice.gender === 'female') || voicesForLanguage[0];
                    handleVoiceSettingsChange('voice_id', selectedVoice.id);
                }
            }
        }
    };

    const handleFileChange = (file) => {
        onSceneEdit(index, 'voiceFile', file);
        if (file) {
            // Tự động tạo preview URL khi có file mới
            const audioUrl = URL.createObjectURL(file);
            setLocalPreviewAudio(audioUrl);
        } else {
            setLocalPreviewAudio(null);
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-400">
                        Cảnh {index + 1}
                    </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Cột 1: Nội dung giọng đọc */}
                    <VoiceContentEditor
                        content={scene.voice_over}
                        onChange={(value) => onSceneEdit(index, 'voice_over', value)}
                        onLanguageDetected={handleLanguageDetected}
                    />

                    {/* Cột 2: Tùy chọn và nghe thử */}
                    <div className="space-y-6">
                        <VoiceOptionsEditor
                            voiceSettings={scene.voiceSettings}
                            onOptionChange={(value) => handleVoiceSettingsChange('option', value)}
                            onVoiceIdChange={(value) => handleVoiceSettingsChange('voice_id', value)}
                            onSpeedChange={(value) => handleVoiceSettingsChange('speed', value)}
                            onFileChange={handleFileChange}
                            voiceOptions={voiceOptions}
                            currentLanguage={currentLanguage}
                            uploadedFile={scene.voiceFile}
                        />

                        <VoicePreview
                            onPreview={() => onPreview(index)}
                            isPreviewing={isPreviewing}
                            previewAudio={localPreviewAudio}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SceneVoiceEditor; 