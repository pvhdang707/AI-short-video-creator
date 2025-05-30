// pages/CreateVideo/Step1_Script.jsx
import React, { useState, useEffect } from 'react';
import StepProgress from '../../components/StepProgress/StepProgress';
import PromptInput from '../../components/PromptInput/PromptInput';
import { videoScriptAPI } from '../../services/api';
//import { VIDEO_STEPS } from '../../constants';
//import { generateScript } from '../../services/scriptService';

const Step1_Script = ({ onNext, initialScript }) => {
    const [script, setScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [formData, setFormData] = useState({
      topic: '',
      target_audience: 'Người dùng các mạng xã hội',
      duration: 0, // Thời lượng mặc định 
    });
    const [error, setError] = useState(null);
    const [generatedScript, setGeneratedScript] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalScript, setOriginalScript] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
  
    // Khôi phục script khi quay lại bước này
    useEffect(() => {
        if (initialScript) {
            setGeneratedScript(initialScript);
            const formattedScript = formatScriptForDisplay(initialScript);
            setScript(formattedScript);
            setOriginalScript(formattedScript);
        }
    }, [initialScript]);

    const handlePromptChange = (e) => {
      if (e && e.target) {
        setPrompt(e.target.value);
        // Cập nhật topic khi người dùng nhập idea
        setFormData(prev => ({
          ...prev,
          topic: e.target.value
        }));
      }
    };

    const handleGenerate = async () => {
      if (!prompt) return;
      
      setIsGenerating(true);
      setError(null);

      try {
        const response = await videoScriptAPI.generateScript(formData);
        setGeneratedScript(response.data);
        // Format script để hiển thị
        const formattedScript = formatScriptForDisplay(response.data);
        setScript(formattedScript);
      } catch (err) {
        setError(err.response?.data?.detail || 'Có lỗi xảy ra khi tạo kịch bản');
      } finally {
        setIsGenerating(false);
      }
    };

    const formatScriptForDisplay = (scriptData) => {
        if (!scriptData) return '';

        // in id
        console.log(scriptData.id);
        
        let formattedText = `Tiêu đề: ${scriptData.title}\n\n`;
        formattedText += `Mô tả: ${scriptData.description}\n\n`;
        formattedText += `Thời lượng: ${scriptData.total_duration} giây\n\n`;
        formattedText += `Các cảnh:\n\n`;

        scriptData.scenes.forEach((scene, index) => {
            formattedText += `Cảnh ${index + 1}:\n`;
            formattedText += `- Mô tả: ${scene.description}\n`;
            formattedText += `- Thời lượng: ${scene.duration} giây\n`;
            formattedText += `- Giọng đọc: ${scene.voice_over}\n`;
            formattedText += `- Yếu tố hình ảnh: ${scene.visual_elements}\n`;
            formattedText += `- Nhạc nền: ${scene.background_music}\n\n`;
        });

        return formattedText;
    };

    const handleScriptEdit = (e) => {
        setScript(e.target.value);
        setHasChanges(e.target.value !== originalScript);
    };

    const parseEditedScript = (editedText) => {
        try {
            const lines = editedText.split('\n');
            const updatedScript = { ...generatedScript };
            
            // Parse tiêu đề
            const titleMatch = lines[0].match(/Tiêu đề: (.*)/);
            if (titleMatch) updatedScript.title = titleMatch[1];

            // Parse mô tả
            const descMatch = lines[2].match(/Mô tả: (.*)/);
            if (descMatch) updatedScript.description = descMatch[1];

            // Parse thời lượng
            const durationMatch = lines[4].match(/Thời lượng: (\d+) giây/);
            if (durationMatch) updatedScript.total_duration = parseInt(durationMatch[1]);

            // Parse các cảnh
            const scenes = [];
            let currentScene = null;
            let sceneIndex = 0;

            for (let i = 6; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.startsWith('Cảnh')) {
                    if (currentScene) scenes.push(currentScene);
                    currentScene = {
                        description: '',
                        duration: 0,
                        voice_over: '',
                        visual_elements: '',
                        background_music: ''
                    };
                    sceneIndex++;
                } else if (currentScene) {
                    if (line.startsWith('- Mô tả:')) {
                        currentScene.description = line.replace('- Mô tả:', '').trim();
                    } else if (line.startsWith('- Thời lượng:')) {
                        const durationMatch = line.match(/- Thời lượng: (\d+) giây/);
                        if (durationMatch) currentScene.duration = parseInt(durationMatch[1]);
                    } else if (line.startsWith('- Giọng đọc:')) {
                        currentScene.voice_over = line.replace('- Giọng đọc:', '').trim();
                    } else if (line.startsWith('- Yếu tố hình ảnh:')) {
                        currentScene.visual_elements = line.replace('- Yếu tố hình ảnh:', '').trim();
                    } else if (line.startsWith('- Nhạc nền:')) {
                        currentScene.background_music = line.replace('- Nhạc nền:', '').trim();
                    }
                }
            }
            if (currentScene) scenes.push(currentScene);
            
            updatedScript.scenes = scenes;
            return updatedScript;
        } catch (error) {
            console.error('Lỗi khi parse script:', error);
            return generatedScript;
        }
    };

    const handleNext = () => {
        if (generatedScript) {
            if (hasChanges) {
                const updatedScript = parseEditedScript(script);
                onNext(updatedScript);
            } else {
                onNext(generatedScript);
            }
        }
    };

    const handleReset = () => {
        setScript(originalScript);
        setHasChanges(false);
    };

    const handleSaveChanges = async () => {
        if (!hasChanges) return;
        
        setIsSaving(true);
        setSaveSuccess(false);
        
        try {
            const updatedScript = parseEditedScript(script);
            // Cập nhật generatedScript với phiên bản mới
            setGeneratedScript(updatedScript);
            setOriginalScript(script);
            setHasChanges(false);
            setSaveSuccess(true);
            
            // Tự động ẩn thông báo thành công sau 3 giây
            setTimeout(() => {
                setSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Lỗi khi lưu thay đổi:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEnhance = async () => {
        if (!generatedScript) return;
        
        setIsEnhancing(true);
        setError(null);

        try {
            const response = await videoScriptAPI.enhanceScript(generatedScript);
            const enhancedScript = response.data;
            setGeneratedScript(enhancedScript);
            const formattedScript = formatScriptForDisplay(enhancedScript);
            setScript(formattedScript);
            setOriginalScript(formattedScript);
            setHasChanges(false);
        } catch (err) {
            setError(err.response?.data?.detail || 'Có lỗi xảy ra khi cải thiện kịch bản');
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-[90rem] mx-auto space-y-8">
                {/* Header với Step Progress */}
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
                    <StepProgress currentStep={1} />
                    <h1 className="text-2xl font-bold mt-4 text-center">Create Video Script</h1>
                    <p className="text-gray-400 text-center mt-2">
                        The system will automatically generate a script based on your idea
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-gray-800/50 rounded-xl p-8 shadow-lg">
                    <div className="space-y-6">
                        {/* Prompt Input */}
                        <div className="space-y-4">
                            <PromptInput
                                value={prompt}
                                onChange={handlePromptChange}
                                placeholder="Enter your video idea..."
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleGenerate}
                                    disabled={!prompt || isGenerating}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                             hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Generating script...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>Generate Script</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Generated Script */}
                        {script && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold text-blue-400">Generated Script:</h3>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleEnhance}
                                            disabled={isEnhancing}
                                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg 
                                                     hover:bg-purple-700 transition-colors disabled:opacity-50
                                                     flex items-center gap-2"
                                        >
                                            {isEnhancing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Enhancing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    <span>Enhance Script</span>
                                                </>
                                            )}
                                        </button>
                                        {hasChanges && (
                                            <>
                                                <button
                                                    onClick={handleReset}
                                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <span>Restore Original</span>
                                                </button>
                                                <button
                                                    onClick={handleSaveChanges}
                                                    disabled={isSaving}
                                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg 
                                                             hover:bg-green-700 transition-colors disabled:opacity-50
                                                             flex items-center gap-2"
                                                >
                                                    {isSaving ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            <span>Saving...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                            </svg>
                                                            <span>Save Changes</span>
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-900/50 p-6 rounded-lg">
                                    <textarea
                                        value={script}
                                        onChange={handleScriptEdit}
                                        className="w-full h-[500px] p-6 bg-gray-800/50 border border-gray-700 rounded-lg 
                                                 text-gray-300 font-mono text-base resize-y focus:ring-2 focus:ring-blue-500 
                                                 focus:border-transparent leading-relaxed"
                                        placeholder="Kịch bản sẽ được hiển thị ở đây..."
                                    />
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="text-sm text-gray-500">
                                            You can edit the script or use the "Enhance" button to make the script more detailed
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {hasChanges && (
                                                <span className="text-sm text-yellow-400">
                                                    Unsaved changes
                                                </span>
                                            )}
                                            {saveSuccess && (
                                                <span className="text-sm text-green-400 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                                              d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Saved successfully
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end">
                    <button 
                        onClick={handleNext}
                        disabled={!script}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    >
                        <span>Continue</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step1_Script;