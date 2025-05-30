import React, { useEffect, useState } from 'react';
import { detectLanguage, getLanguageName } from '../../utils/languageUtils';

const VoiceContentEditor = ({ content, onChange, onLanguageDetected }) => {
    const [detectedLanguage, setDetectedLanguage] = useState(null);

    useEffect(() => {
        if (content) {
            const language = detectLanguage(content);
            setDetectedLanguage(language);
            onLanguageDetected(language);
        }
    }, [content, onLanguageDetected]);

    return (
        <div className="space-y-6">
            <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold text-blue-400">Voice Content</h4>
                    {detectedLanguage && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Language:</span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                                {getLanguageName(detectedLanguage)}
                            </span>
                        </div>
                    )}
                </div>
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={8}
                    placeholder="Enter voice content for this scene..."
                />
            </div>
        </div>
    );
};

export default VoiceContentEditor; 