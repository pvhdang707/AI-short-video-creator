import React, { useState, useEffect } from 'react';
import { videoScriptAPI, scriptAPI } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';

const SCRIPT_STYLES = [
  { id: 'basic', name: 'Basic', description: 'Suitable for basic videos' },
  { id: 'information', name: 'Informational', description: 'Suitable for informational videos' },
  { id: 'action', name: 'Action', description: 'Suitable for dynamic, dramatic videos' },
  { id: 'romantic', name: 'Romantic', description: 'Suitable for emotional, dreamy videos' },
  { id: 'educational', name: 'Educational', description: 'Suitable for tutorial, teaching videos' },
  { id: 'story', name: 'Storytelling', description: 'Suitable for storytelling, fairy tale videos' },
  { id: 'comedy', name: 'Comedy', description: 'Suitable for entertainment, humorous videos' },
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 45, label: '45 seconds' },
  { value: 60, label: '1 minute' }
];

const ScriptGenerator = ({ onNext, initialScript, initialIdea }) => {
  const [idea, setIdea] = useState(initialIdea || '');
  const [selectedStyle, setSelectedStyle] = useState(SCRIPT_STYLES[0]);
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedScript, setGeneratedScript] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalScript, setOriginalScript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [script, setScript] = useState('');
  
  // Use custom toast hook
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (initialScript) {
      setGeneratedScript(initialScript);
      const formattedScript = formatScriptForDisplay(initialScript);
      setScript(formattedScript);
      setOriginalScript(formattedScript);
    }
    // Nếu có initialIdea thì set vào idea
    if (initialIdea) {
      setIdea(initialIdea.idea || initialIdea.title || initialIdea);
    }
  }, [initialScript, initialIdea]);

  const handleGenerate = async () => {
    if (!idea || !selectedStyle) {
      showError('Please enter complete information');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {

      const response = await videoScriptAPI.generateScript({
        topic: idea,
        style: selectedStyle.id,
        target_audience: 'Social media users',
        duration: duration
      });


      setGeneratedScript(response.data);
      const formattedScript = formatScriptForDisplay(response.data);
      setScript(formattedScript);
      setOriginalScript(formattedScript);
      showSuccess('Script created successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'An error occurred while generating script';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = async () => {
    if (!generatedScript?.id) {
      showError('No script found to enhance');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await videoScriptAPI.enhanceScript(generatedScript.id);

      setGeneratedScript(response.data);
      const formattedScript = formatScriptForDisplay(response.data);
      setScript(formattedScript);
      setOriginalScript(formattedScript);
      showSuccess('Script enhanced successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'An error occurred while enhancing script';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatScriptForDisplay = (scriptData) => {
    if (!scriptData) return '';

    let formattedText = `Title: ${scriptData.title}\n\n`;
    formattedText += `Description: ${scriptData.description}\n\n`;
    formattedText += `Duration: ${scriptData.total_duration} seconds\n\n`;
    formattedText += `Scenes:\n\n`;

    scriptData.scenes.forEach((scene, index) => {
      formattedText += `Scene ${index + 1}:\n`;
      formattedText += `- Description: ${scene.description}\n`;
      formattedText += `- Duration: ${scene.duration} seconds\n`;
      formattedText += `- Voice Over: ${scene.voice_over}\n`;
      formattedText += `- Visual Elements: ${scene.visual_elements}\n`;
      formattedText += `- Background Music: ${scene.background_music}\n\n`;
    });

    return formattedText;
  };

  const parseEditedScript = (editedText) => {
    const lines = editedText.split('\n');
    const script = {
      title: '',
      description: '',
      total_duration: 0,
      scenes: []
    };

    let currentScene = null;

    for (const line of lines) {
      if (line.startsWith('Title:')) {
        script.title = line.replace('Title:', '').trim();
      } else if (line.startsWith('Description:')) {
        script.description = line.replace('Description:', '').trim();
      } else if (line.startsWith('Duration:')) {
        script.total_duration = parseInt(line.replace('Duration:', '').replace('seconds', '').trim());
      } else if (line.startsWith('Scene')) {
        if (currentScene) {
          script.scenes.push(currentScene);
        }
        currentScene = {
          description: '',
          duration: 0,
          voice_over: '',
          visual_elements: '',
          background_music: ''
        };
      } else if (line.startsWith('- Description:')) {
        currentScene.description = line.replace('- Description:', '').trim();
      } else if (line.startsWith('- Duration:')) {
        currentScene.duration = parseInt(line.replace('- Duration:', '').replace('seconds', '').trim());
      } else if (line.startsWith('- Voice Over:')) {
        currentScene.voice_over = line.replace('- Voice Over:', '').trim();
      } else if (line.startsWith('- Visual Elements:')) {
        currentScene.visual_elements = line.replace('- Visual Elements:', '').trim();
      } else if (line.startsWith('- Background Music:')) {
        currentScene.background_music = line.replace('- Background Music:', '').trim();
      }
    }

    if (currentScene) {
      script.scenes.push(currentScene);
    }

    return script;
  };

  const handleScriptEdit = (e) => {
    setScript(e.target.value);
    setHasChanges(e.target.value !== originalScript);
  };

  const handleSaveChanges = async () => {
    if (!hasChanges || !generatedScript?.id) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const updatedScript = parseEditedScript(script);
      // Lọc bỏ các scene rỗng hoặc thiếu nội dung
      const filteredScenes = updatedScript.scenes.filter(scene => scene && scene.description && scene.description.trim() !== '');
      // Cập nhật thông tin cơ bản
      const basicUpdateData = {
        title: updatedScript.title,
        description: updatedScript.description,
        total_duration: updatedScript.total_duration,
        target_audience: 'Social media users'
      };
      
      // Cập nhật thông tin cơ bản
      const basicResponse = await scriptAPI.updateScript(generatedScript.id, basicUpdateData);
      
      // Cập nhật scenes
      const scenesUpdateData = {
        scenes: filteredScenes.map((scene, index) => ({
          // id: scene.id, // Không cần gửi id vì backend sẽ tạo lại toàn bộ
          scene_number: index + 1,
          description: scene.description,
          duration: scene.duration,
          visual_elements: scene.visual_elements,
          background_music: scene.background_music,
          voice_over: scene.voice_over
        }))
      };
      
      // Cập nhật scenes
      const scenesResponse = await scriptAPI.updateScriptScenes(generatedScript.id, scenesUpdateData);

      // Cập nhật lại generatedScript với dữ liệu mới
      setGeneratedScript(scenesResponse.data);
      setOriginalScript(script);
      setHasChanges(false);
      setSaveSuccess(true);
      showSuccess('Changes saved successfully!');
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      showError(error.response?.data?.detail || 'An error occurred while saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (generatedScript) {
      if (hasChanges) {
        const updatedScript = parseEditedScript(script);
        onNext(updatedScript);
      } else {
        // Nếu script chưa có creator_id thì gọi API để cập nhật
        if (!generatedScript.creator_id) {
          try {
            await videoScriptAPI.saveScript(generatedScript.id);
          } catch (err) {
            
          }
        }
        onNext(generatedScript);
      }
    }
  };

  return (
    <div className="w-full px-8 py-8 space-y-8">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] w-full h-full min-h-[600px] gap-8">
        {/* Left Column - Input Section */}
        <div className="space-y-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 py-8 px-6 rounded-xl h-full flex flex-col flex-1 w-full">
          {/* Section Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Script Configuration</h2>
          </div>

          {/* Idea Input */}
          <div className="space-y-3">
            <label className="block text-white font-semibold text-lg flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Your Video Idea</span>
            </label>
            <div className="relative">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your video concept in detail. What story do you want to tell? What message do you want to convey?"
                className="w-full h-[200px] bg-gray-700/50 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 focus:border-blue-500/50 rounded-xl p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none text-base transition-all duration-300"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                {idea.length}/500
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <label className="block text-white font-semibold text-base flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Desired Duration</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`group relative px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                    duration === option.value
                      ? 'border-green-500/50 bg-gradient-to-r from-green-600/20 to-green-700/20 text-green-400 shadow-lg shadow-green-600/20'
                      : 'border-gray-600/30 bg-gray-700/30 hover:border-gray-500/50 hover:bg-gray-600/30 text-gray-300 hover:text-white'
                  }`}
                >
                  {duration === option.value && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-700/10 to-green-600/10 rounded-xl"></div>
                  )}
                  <span className="relative z-10">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Selection */}
          <div className="space-y-3 flex-1">
            <label className="block text-white font-semibold text-base flex items-center space-x-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              <span>Choose Script Style</span>
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {SCRIPT_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-2 rounded-md border text-sm font-medium whitespace-nowrap transition-all duration-200 min-w-[110px] text-left
                    ${selectedStyle?.id === style.id
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 text-white'}
                  `}
                  title={style.description}
                >
                  <span className="font-semibold">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-4 pt-4">
            {generatedScript && (
              <button
                onClick={handleEnhance}
                disabled={isGenerating}
                className="px-6 py-3 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 text-base font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Enhance Script
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={!idea || !selectedStyle || isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 text-base font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating script...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Generate Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Generated Script */}
        {generatedScript && (
          <div className="bg-gray-800/50 py-6 px-3 rounded-xl h-full flex flex-col flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Generated Script</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || isSaving}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 flex items-center gap-2 text-base font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <textarea
              value={script}
              onChange={handleScriptEdit}
              className="w-full h-[600px] bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-white font-mono text-base resize-none"
            />

            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-500 text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Changes saved successfully!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                disabled={!generatedScript || hasChanges}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 flex items-center gap-2 text-base font-medium"
              >
                <span>Continue</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptGenerator;