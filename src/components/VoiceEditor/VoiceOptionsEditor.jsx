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
    uploadedFile
}) => {
    const [filteredVoices, setFilteredVoices] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (currentLanguage && voiceOptions) {
            const voices = filterVoicesByLanguage(voiceOptions, currentLanguage);
            setFilteredVoices(voices);
        }
    }, [currentLanguage, voiceOptions]);

    const handleFileChange = (file) => {
        setSelectedFile(file);
        onFileChange(file);
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-blue-400">Voice Options</h4>
                {currentLanguage && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Compatible voices:</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                            {filteredVoices.length} voices
                        </span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => onOptionChange('generate')}
                    className={`p-3 rounded-lg transition-colors duration-200 ${
                        voiceSettings.option === 'generate' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                >
                    Generate voice
                </button>
                <button 
                    onClick={() => onOptionChange('upload')}
                    className={`p-3 rounded-lg transition-colors duration-200 ${
                        voiceSettings.option === 'upload' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                >
                    Upload file
                </button>
            </div>

            {voiceSettings.option === 'generate' ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Voice
                        </label>
                        <select
                            value={voiceSettings.voice_id}
                            onChange={(e) => onVoiceIdChange(e.target.value)}
                            className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {filteredVoices.map(voice => (
                                <option key={voice.id} value={voice.id}>
                                    {voice.name}
                                </option>
                            ))}
                        </select>
                        {filteredVoices.length === 0 && (
                            <p className="mt-2 text-sm text-red-400">
                                No compatible voices for {getLanguageName(currentLanguage)}
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
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {!selectedFile ? (
                        <FileUploader
                            accept="audio/*"
                            onFileChange={handleFileChange}
                            label="Choose voice file"
                        />
                    ) : (
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
                                    onFileChange(null);
                                }}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                                Change
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VoiceOptionsEditor; 