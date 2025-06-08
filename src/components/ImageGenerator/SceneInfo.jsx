import React from 'react';

const SceneInfo = ({ scene }) => {
    return (
        <div className="bg-gray-900/50 p-4 rounded-lg space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Scene Information</h4>
            <div className="space-y-3">
                <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-1">Description:</h5>
                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded">{scene.description}</p>
                </div>
                
                {/* <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-1">Voice Over:</h5>
                    <p className="text-gray-300 bg-gray-800/50 p-3 rounded">{scene.voice_over}</p>
                </div> */}
            </div>
        </div>
    );
};

export default SceneInfo; 