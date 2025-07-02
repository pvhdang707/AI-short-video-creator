import React from "react";
import TransitionSelector from "./TransitionSelector";

const SceneList = ({
  content,
  selectedScene,
  setSelectedScene,
  sceneElements,
  videoSettings,
  setVideoSettings,
  expandedTransitions,
  setExpandedTransitions,
}) => {
  const updateTransition = (index, updates) => {
    setVideoSettings((prev) => ({
      ...prev,
      individualTransitions: prev.individualTransitions.map((transition, i) =>
        i === index ? { ...transition, ...updates } : transition
      ),
    }));
  };

  const toggleTransitionExpanded = (index) => {
    setExpandedTransitions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-3">
      {content.map((scene, index) => (
        <div key={index} className="space-y-2">
          {/* Scene Item */}
          <div
            className={`bg-gray-900/50 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
              selectedScene === scene.scene_number
                ? "ring-2 ring-blue-500 border-blue-400 bg-blue-900/20"
                : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/50"
            }`}
            onClick={() => setSelectedScene(scene.scene_number)}
          >
            <div className="flex items-start space-x-3">
              {/* Scene Number Badge */}
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedScene === scene.scene_number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {scene.scene_number}
                </div>
              </div>
              {/* Scene Content */}
              <div className="flex-1 min-w-0">
                {/* Scene Preview */}
                <div className="relative h-20 w-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                  {scene.image && scene.image.url ? (
                    <img
                      src={scene.image.url}
                      alt={`Scene ${scene.scene_number}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-500 text-xs flex items-center">
                      <span className="mr-1">🖼️</span>
                      Không có ảnh
                    </div>
                  )}
                </div>
                {/* Scene Info */}
                <div className="space-y-1">
                  {/* Voice Over Text */}
                  <div className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {scene.voice_over || "Không có nội dung"}
                  </div>
                  {/* Scene Stats */}
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className="mr-1">🎵</span>
                      {scene.voice?.audio_base64 ? "Có audio" : "Không audio"}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">📝</span>
                      {sceneElements[scene.scene_number]?.labels?.length || 0} text
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">🖼️</span>
                      {sceneElements[scene.scene_number]?.imageOverlays?.length || 0} overlay
                    </span>
                  </div>
                </div>
              </div>
              {/* Selection Indicator */}
              {selectedScene === scene.scene_number && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          {/* Transition Selector - Đặt giữa 2 scene */}
          {index < content.length - 1 &&
            videoSettings.individualTransitions[index] && (
              <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-2 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  {/* Line bên trái */}
                  <div className="flex-1 h-px bg-gray-600"></div>
                  {/* Transition Selector */}
                  <TransitionSelector
                    fromScene={scene.scene_number}
                    toScene={content[index + 1].scene_number}
                    transition={videoSettings.individualTransitions[index]}
                    onUpdate={(updates) => updateTransition(index, updates)}
                    isExpanded={expandedTransitions[index] || false}
                    onToggleExpanded={() => toggleTransitionExpanded(index)}
                  />
                  {/* Line bên phải */}
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>
              </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default SceneList; 