import React from "react";

const TransitionSelector = ({
  fromScene,
  toScene,
  transition,
  onUpdate,
  isExpanded,
  onToggleExpanded,
}) => {
  const availableTransitions = [
    { value: "none", label: "Không có", icon: "—", description: "Không có hiệu ứng chuyển cảnh" },
    { value: "fade", label: "Fade", icon: "✨", description: "Mờ dần từ scene này sang scene khác" },
    { value: "slide", label: "Slide", icon: "➡️", description: "Trượt từ trái sang phải" },
    { value: "zoom", label: "Zoom", icon: "🔍", description: "Phóng to/thu nhỏ khi chuyển cảnh" },
    { value: "blur", label: "Blur", icon: "🌫️", description: "Làm mờ chuyển đổi" },
    { value: "wipe", label: "Wipe", icon: "🧹", description: "Quét từ phải sang trái" },
    { value: "dissolve", label: "Dissolve", icon: "💫", description: "Hòa tan chuyển đổi" },
    { value: "smoothleft", label: "Smooth Left", icon: "⬅️", description: "Trượt mượt sang trái" },
    { value: "smoothright", label: "Smooth Right", icon: "➡️", description: "Trượt mượt sang phải" },
    { value: "smoothup", label: "Smooth Up", icon: "⬆️", description: "Trượt mượt lên trên" },
    { value: "smoothdown", label: "Smooth Down", icon: "⬇️", description: "Trượt mượt xuống dưới" },
  ];

  const currentTransition = availableTransitions.find(
    (t) => t.value === transition.type
  );

  // Preset durations cho transition
  const presetDurations = [
    { value: 0.3, label: "Nhanh", icon: "⚡" },
    { value: 0.6, label: "Trung bình", icon: "⏱️" },
    { value: 1.0, label: "Chậm", icon: "🐌" },
    { value: 1.5, label: "Rất chậm", icon: "🕐" },
  ];

  return (
    <div
      className="flex items-center justify-center py-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-600/50 p-4 w-full max-w-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {fromScene}
              </div>
              <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {toScene}
              </div>
            </div>
            <span className="text-sm text-gray-300 font-medium">Transition</span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleExpanded();
            }}
            className="text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-lg hover:bg-gray-700/50 hover:scale-105"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>
        {/* Current Transition Display */}
        <div className="flex items-center justify-between mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600/50">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentTransition?.icon}</span>
            <div>
              <div className="text-sm font-medium text-white">
                {currentTransition?.label}
              </div>
              <div className="text-xs text-gray-400">
                {currentTransition?.description}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-blue-400">
              {transition.duration}s
            </div>
            <div className="text-xs text-gray-500">Duration</div>
          </div>
        </div>
        {/* Expandable Content */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-4 pt-3 border-t border-gray-600/50">
            {/* Transition Type Selection */}
            <div>
              <label className="block text-sm text-gray-300 font-medium mb-3 flex items-center">
                <span className="mr-2">🎬</span>
                Loại transition
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableTransitions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onUpdate({ type: option.value });
                    }}
                    className={`p-3 rounded-lg text-xs transition-all duration-200 hover:scale-105 group ${
                      transition.type === option.value
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white border border-gray-600/50"
                    }`}
                    title={option.description}
                  >
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform duration-200">
                      {option.icon}
                    </div>
                    <div className="font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Duration Controls - Chỉ hiển thị khi có transition */}
            {transition.type !== "none" && (
              <div className="space-y-3">
                {/* Custom Duration Slider */}
                <div>
                  <label className="block text-sm text-gray-300 font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="mr-2">🎚️</span>
                      Tùy chỉnh thời lượng
                    </span>
                    <span className="text-lg font-bold text-blue-400 bg-blue-900/30 px-3 py-1 rounded-lg">
                      {transition.duration}s
                    </span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={transition.duration}
                      onChange={(e) => {
                        e.stopPropagation();
                        onUpdate({ duration: Number(e.target.value) });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                          ((transition.duration - 0.1) / 4.9) * 100
                        }%, #374151 ${
                          ((transition.duration - 0.1) / 4.9) * 100
                        }%, #374151 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransitionSelector; 