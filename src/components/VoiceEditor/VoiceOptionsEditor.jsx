import React, { useEffect, useState } from 'react';
import FileUploader from '../FileUploader/FileUploader';
import { filterVoicesByLanguage, getLanguageName } from '../../utils/languageUtils';

const VoiceOptionsEditor = ({ 
    voiceSettings, 
    onOptionChange, 
    onVoiceIdChange, 
    onSpeedChange, 
    onFileChange,
    voiceOptions = [],
    currentLanguage,
    uploadedFile,
    onVoiceSettingsChange,
    voiceFile,
    onVoiceFileChange,
    onTextChange,
    onLanguageChange,
    onRegenerateVoice,
    isRegeneratingVoice,
    aiVoicePreviewSrc
}) => {
    const [filteredVoices, setFilteredVoices] = useState([]);
    const [selectedFile, setSelectedFile] = useState(voiceFile || null);
    const [activeTab, setActiveTab] = useState(voiceFile ? 'upload' : 'generate');
    const [text, setText] = useState(voiceSettings?.text || '');
    const [language, setLanguage] = useState(voiceSettings?.language || currentLanguage || 'vi-VN');

    useEffect(() => {
        if (language && voiceOptions) {
            const voices = filterVoicesByLanguage(voiceOptions, language);
            setFilteredVoices(voices);
        }
    }, [language, voiceOptions]);

    useEffect(() => {
        if (onVoiceSettingsChange) {
            onVoiceSettingsChange({ ...voiceSettings, text, language });
        }
        // eslint-disable-next-line
    }, [text, language]);

    const handleFileChange = (file) => {
        setSelectedFile(file);
        if (onFileChange) onFileChange(file);
        if (onVoiceFileChange) onVoiceFileChange(file);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'generate') {
            setSelectedFile(null);
            if (onFileChange) onFileChange(null);
            if (onVoiceFileChange) onVoiceFileChange(null);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700/40 via-slate-700/20 to-slate-800/40 backdrop-blur-lg border border-slate-600/30 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"></div>
            <div className="relative space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/20">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-white">Voice Configuration</h4>
                    </div>
                    {language && (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-400">Available voices:</span>
                            <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full text-sm border border-green-400/20">
                                {filteredVoices.length}
                            </span>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center space-x-1 p-1 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <button
                        onClick={() => handleTabChange('generate')}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                            activeTab === 'generate'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>AI Generate</span>
                    </button>
                    <button
                        onClick={() => handleTabChange('upload')}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                            activeTab === 'upload'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        <span>Upload File</span>
                    </button>
                </div>

                {/* Content Sections */}
                {activeTab === 'generate' ? (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-300">
                                Content to Read
                            </label>
                        <textarea
                            value={text}
                            onChange={e => {
                                setText(e.target.value);
                                if (onTextChange) onTextChange(e.target.value);
                            }}
                            className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter content to read..."
                            disabled={!!selectedFile}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Language
                        </label>
                        <select
                            value={language}
                            onChange={e => {
                                setLanguage(e.target.value);
                                if (onLanguageChange) onLanguageChange(e.target.value);
                            }}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-white"
                            disabled={!!selectedFile}
                        >
                            <option value="vi-VN">Vietnamese</option>
                            <option value="en-US">English (US)</option>
                            <option value="zh-CN">Chinese</option>
                            <option value="ja-JP">Japanese</option>
                            <option value="ko-KR">Korean</option>
                            <option value="fr-FR">French</option>
                            
                            
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Voice
                        </label>
                        <select
                            value={voiceSettings.voice_id}
                            onChange={(e) => onVoiceIdChange(e.target.value)}
                            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!!selectedFile}
                        >
                            {filteredVoices.map(voice => (
                                <option key={voice.id} value={voice.id}>
                                    {voice.name}
                                </option>
                            ))}
                        </select>
                        {filteredVoices.length === 0 && (
                            <p className="mt-2 text-sm text-red-400">
                                No compatible voices for {getLanguageName(language)}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Speed: {voiceSettings.speed}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={voiceSettings.speed}
                            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                            disabled={!!selectedFile}
                        />
                    </div>
                    {!selectedFile && (
                        <div className="mt-4">
                            <button
                                onClick={onRegenerateVoice}
                                disabled={isRegeneratingVoice}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                                         hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                {isRegeneratingVoice ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Regenerating voice...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Generate Voice</span>
                                    </>
                                )}
                            </button>
                            {aiVoicePreviewSrc && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <audio
                                            src={aiVoicePreviewSrc}
                                            controls
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {!selectedFile ? (
                        <FileUploader
                            accept="audio/*"
                            onFileChange={handleFileChange}
                            label="Upload Audio File"
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    <span className="text-gray-300 truncate max-w-[200px]">{selectedFile.name}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        if (onFileChange) onFileChange(null);
                                        if (onVoiceFileChange) onVoiceFileChange(null);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Đổi file
                                </button>
                            </div>
                            <audio controls src={selectedFile ? URL.createObjectURL(selectedFile) : undefined} className="w-full mt-2" />
                        </div>
                    )}
                </div>
            )}
            </div>
        </div>
    );
};

export default VoiceOptionsEditor; 