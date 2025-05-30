import React from 'react';
import PromptInput from '../PromptInput/PromptInput'

const SceneEditor = ({ 
    sceneNumber, 
    prompt, 
    onPromptChange, 
    onRegenerate, 
    isRegenerating 
}) => {
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Edit Image</h4>
            <div className="space-y-3">
                <PromptInput
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    placeholder="Enter new description to regenerate image..."
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                    onClick={() => onRegenerate(sceneNumber, prompt)}
                    disabled={!prompt || isRegenerating}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                             hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {isRegenerating ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Regenerating image...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Regenerate Image</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SceneEditor; 