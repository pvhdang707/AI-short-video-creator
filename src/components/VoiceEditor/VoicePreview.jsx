import React from 'react';

const VoicePreview = ({ onPreview, isPreviewing, previewAudio }) => {
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Preview</h4>
            <button
                onClick={onPreview}
                disabled={isPreviewing}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 
                         hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
            >
                {isPreviewing ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Preview</span>
                    </>
                )}
            </button>

            {previewAudio && (
                <div className="mt-4">
                    <audio 
                        controls 
                        className="w-full"
                        key={previewAudio}
                    >
                        <source src={previewAudio} type="audio/mpeg" />
                        Your browser does not support audio playback
                    </audio>
                </div>
            )}
        </div>
    );
};

export default VoicePreview; 