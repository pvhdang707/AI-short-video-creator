import React, { useState, useEffect } from 'react';
import { videoScriptAPI } from '../../../services/api';

const SCRIPT_STYLES = [
  { id: 'action', name: 'Hành động', description: 'Phù hợp cho video năng động, kịch tính' },
  { id: 'romantic', name: 'Lãng mạn', description: 'Phù hợp cho video tình cảm, mơ mộng' },
  { id: 'educational', name: 'Giáo dục', description: 'Phù hợp cho video hướng dẫn, giảng dạy' },
  { id: 'story', name: 'Kể chuyện', description: 'Phù hợp cho video kể chuyện, cổ tích' },
  { id: 'comedy', name: 'Hài hước', description: 'Phù hợp cho video giải trí, hài hước' }
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 giây' },
  { value: 60, label: '1 phút' },
  { value: 90, label: '1 phút 30 giây' },
  { value: 120, label: '2 phút' }
];

const ScriptGenerator = ({ onNext, initialScript }) => {
  const [idea, setIdea] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [duration, setDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedScript, setGeneratedScript] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalScript, setOriginalScript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [script, setScript] = useState('');

  useEffect(() => {
    if (initialScript) {
      setGeneratedScript(initialScript);
      const formattedScript = formatScriptForDisplay(initialScript);
      setScript(formattedScript);
      setOriginalScript(formattedScript);
    }
  }, [initialScript]);

  const handleGenerate = async () => {
    if (!idea || !selectedStyle) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await videoScriptAPI.generateScript({
        topic: idea + '\nstyle: ' + selectedStyle.id,
        style: selectedStyle.id,
        target_audience: 'Người dùng các mạng xã hội',
        duration: duration
      });

      setGeneratedScript(response.data);
      const formattedScript = formatScriptForDisplay(response.data);
      setScript(formattedScript);
      setOriginalScript(formattedScript);
    } catch (err) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi tạo kịch bản');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatScriptForDisplay = (scriptData) => {
    if (!scriptData) return '';

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

  const parseEditedScript = (editedText) => {
    const lines = editedText.split('\n');
    const script = {
      title: '',
      description: '',
      total_duration: 0,
      scenes: []
    };

    let currentScene = null;
    let currentKey = '';

    for (const line of lines) {
      if (line.startsWith('Tiêu đề:')) {
        script.title = line.replace('Tiêu đề:', '').trim();
      } else if (line.startsWith('Mô tả:')) {
        script.description = line.replace('Mô tả:', '').trim();
      } else if (line.startsWith('Thời lượng:')) {
        script.total_duration = parseInt(line.replace('Thời lượng:', '').replace('giây', '').trim());
      } else if (line.startsWith('Cảnh')) {
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
      } else if (line.startsWith('- Mô tả:')) {
        currentScene.description = line.replace('- Mô tả:', '').trim();
      } else if (line.startsWith('- Thời lượng:')) {
        currentScene.duration = parseInt(line.replace('- Thời lượng:', '').replace('giây', '').trim());
      } else if (line.startsWith('- Giọng đọc:')) {
        currentScene.voice_over = line.replace('- Giọng đọc:', '').trim();
      } else if (line.startsWith('- Yếu tố hình ảnh:')) {
        currentScene.visual_elements = line.replace('- Yếu tố hình ảnh:', '').trim();
      } else if (line.startsWith('- Nhạc nền:')) {
        currentScene.background_music = line.replace('- Nhạc nền:', '').trim();
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
    if (!hasChanges) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const updatedScript = parseEditedScript(script);
      setGeneratedScript(updatedScript);
      setOriginalScript(script);
      setHasChanges(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi lưu thay đổi:', error);
    } finally {
      setIsSaving(false);
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

  return (
    <div className="space-y-6">
      {/* Idea Input */}
      <div className="space-y-4">
        <label className="block text-white font-medium">
          Ý tưởng video của bạn
        </label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Nhập ý tưởng cho video của bạn..."
          className="w-full h-32 bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Duration Selection */}
      <div className="space-y-4">
        <label className="block text-white font-medium">
          Thời lượng mong muốn
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setDuration(option.value)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                duration === option.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
              }`}
            >
              <span className="text-white">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style Selection */}
      <div className="space-y-4">
        <label className="block text-white font-medium">
          Chọn phong cách kịch bản
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCRIPT_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectedStyle?.id === style.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
              }`}
            >
              <h3 className="text-lg font-medium text-white">{style.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={!idea || !selectedStyle || isGenerating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Đang tạo kịch bản...</span>
            </>
          ) : (
            'Tạo kịch bản'
          )}
        </button>
      </div>

      {/* Generated Script */}
      {generatedScript && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Kịch bản đã tạo</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges || isSaving}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>

          <textarea
            value={script}
            onChange={handleScriptEdit}
            className="w-full h-96 bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm"
          />

          {saveSuccess && (
            <p className="text-green-500">Đã lưu thay đổi thành công!</p>
          )}

          {error && (
            <p className="text-red-500">{error}</p>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!generatedScript}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptGenerator; 