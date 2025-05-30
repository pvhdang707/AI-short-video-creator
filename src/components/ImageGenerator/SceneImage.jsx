import React from 'react';

const SceneImage = ({ sceneImage, sceneNumber, isRegenerating }) => {
    return (
        <div className="space-y-4">
            <div className="relative group">
                {sceneImage ? (
                    <div className="aspect-video overflow-hidden rounded-lg bg-gray-900">
                        <img 
                            src={sceneImage.url} 
                            alt={`Scene ${sceneNumber}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isRegenerating && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                            <p className="text-gray-400">Generating image...</p>
                        </div>
                    </div>
                )}
            </div>

            {sceneImage && (
                <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Prompt:</h4>
                        <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">{sceneImage.prompt}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Size: {sceneImage.width}x{sceneImage.height}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SceneImage; 