import React, { useCallback, useEffect } from "react";
import BackgroundMusicSelector from "./BackgroundMusicSelector";

const VideoSettingsPanel = ({ videoSettings, setVideoSettings, ffmpeg }) => {
  // Debug log để kiểm tra background music enabled
  console.log(
    "VideoSettings backgroundMusicEnabled:",
    videoSettings.backgroundMusicEnabled
  );

  // Sử dụng useCallback để tránh re-create function
  const handleToggleBackgroundMusic = useCallback(
    (enabled) => {
      console.log("Background music toggle:", enabled);
      setVideoSettings((prev) => {
        console.log("Previous state:", prev.backgroundMusicEnabled);
        const newState = { ...prev, backgroundMusicEnabled: enabled };
        console.log("New state:", newState.backgroundMusicEnabled);
        return newState;
      });
    },
    [setVideoSettings]
  );

  // Monitor state changes
  useEffect(() => {
    console.log(
      "VideoSettings backgroundMusicEnabled changed to:",
      videoSettings.backgroundMusicEnabled
    );
  }, [videoSettings.backgroundMusicEnabled]);

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-medium text-white flex items-center">
          <span className="mr-2">⚙️</span>
          Video settings
        </h4>
      </div>
      {/* Basic Settings - Luôn hiển thị */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {/* Resolution */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Resolution
          </label>
          <select
            value={videoSettings.resolution}
            onChange={(e) =>
              setVideoSettings((prev) => ({
                ...prev,
                resolution: e.target.value,
              }))
            }
            className="w-full bg-gray-700 text-white rounded p-1.5 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="1920x1080">1080p</option>
            <option value="1280x720">720p</option>
            <option value="854x480">480p</option>
          </select>
        </div>
        {/* FPS */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            FPS
          </label>
          <select
            value={videoSettings.fps}
            onChange={(e) =>
              setVideoSettings((prev) => ({
                ...prev,
                fps: Number(e.target.value),
              }))
            }
            className="w-full bg-gray-700 text-white rounded p-1.5 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="24">24</option>
            <option value="30">30</option>
            <option value="60">60</option>
          </select>
        </div>
        {/* Preset */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Preset
          </label>
          <select
            value={videoSettings.preset}
            onChange={(e) =>
              setVideoSettings((prev) => ({ ...prev, preset: e.target.value }))
            }
            className="w-full bg-gray-700 text-white rounded p-1.5 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="ultrafast">Fast</option>
            <option value="medium">Medium</option>
            <option value="veryslow">Slow</option>
          </select>
        </div>
        {/* CRF */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Quality ({videoSettings.crf})
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="51"
              value={videoSettings.crf}
              onChange={(e) =>
                setVideoSettings((prev) => ({
                  ...prev,
                  crf: Number(e.target.value),
                }))
              }
              className="flex-1"
            />
            <span className="text-xs text-gray-300 min-w-[2rem] text-center">
              {videoSettings.crf}
            </span>
          </div>
        </div>
      </div>
      {/* Background Music Section */}
      <div className="space-y-4">
        {videoSettings.backgroundMusicEnabled && (
          <div className="space-y-4">
            <BackgroundMusicSelector
              isEnabled={videoSettings.backgroundMusicEnabled}
              selectedMusic={videoSettings.backgroundMusic}
              volume={videoSettings.backgroundMusicVolume}
              onMusicSelect={(music) => {
                setVideoSettings((prev) => ({
                  ...prev,
                  backgroundMusic: music,
                }));
              }}
              onVolumeChange={(volume) => {
                setVideoSettings((prev) => ({
                  ...prev,
                  backgroundMusicVolume: volume,
                }));
              }}
              onToggleEnabled={(enabled) => {
                setVideoSettings((prev) => ({
                  ...prev,
                  backgroundMusicEnabled: enabled,
                }));
              }}
            />
          </div>
        )}

        {/* Hiển thị BackgroundMusicSelector ngay cả khi disabled để có thể bật */}
        {!videoSettings.backgroundMusicEnabled && (
          <BackgroundMusicSelector
            isEnabled={videoSettings.backgroundMusicEnabled}
            selectedMusic={videoSettings.backgroundMusic}
            volume={videoSettings.backgroundMusicVolume}
            onMusicSelect={(music) => {
              setVideoSettings((prev) => ({
                ...prev,
                backgroundMusic: music,
              }));
            }}
            onVolumeChange={(volume) => {
              setVideoSettings((prev) => ({
                ...prev,
                backgroundMusicVolume: volume,
              }));
            }}
            onToggleEnabled={(enabled) => {
              setVideoSettings((prev) => ({
                ...prev,
                backgroundMusicEnabled: enabled,
              }));
            }}
          />
        )}
      </div>

      {/* Overlay - Luôn hiển thị */}
      <div className="space-y-3 mt-3">
        {/* Text Overlay */}
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={videoSettings.textOverlay}
                onChange={(e) =>
                  setVideoSettings((prev) => ({
                    ...prev,
                    textOverlay: e.target.checked,
                  }))
                }
                className="form-checkbox w-4 h-4"
              />
              <span className="text-sm text-white font-medium">Subtitle</span>
            </div>
          </div>
          {videoSettings.textOverlay && (
            <div className="space-y-3">
              {/* Vị trí và màu sắc cơ bản */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Position
                  </label>
                  <select
                    value={videoSettings.textPosition}
                    onChange={(e) =>
                      setVideoSettings((prev) => ({
                        ...prev,
                        textPosition: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 text-white rounded p-1.5 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Text color
                  </label>
                  <input
                    type="color"
                    value={videoSettings.textColor}
                    onChange={(e) =>
                      setVideoSettings((prev) => ({
                        ...prev,
                        textColor: e.target.value,
                      }))
                    }
                    className="w-full h-8 rounded cursor-pointer border border-gray-600"
                  />
                </div>
              </div>
              {/* Kích thước */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Size ({videoSettings.textSize}px)
                </label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={videoSettings.textSize}
                  onChange={(e) =>
                    setVideoSettings((prev) => ({
                      ...prev,
                      textSize: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
              {/* Background cho text */}
              <div className="border-t border-gray-600 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">Background</label>
                  <input
                    type="checkbox"
                    checked={videoSettings.textBackground}
                    onChange={(e) =>
                      setVideoSettings((prev) => ({
                        ...prev,
                        textBackground: e.target.checked,
                      }))
                    }
                    className="form-checkbox w-3 h-3"
                  />
                </div>
                {videoSettings.textBackground && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={videoSettings.textBackgroundColor}
                        onChange={(e) =>
                          setVideoSettings((prev) => ({
                            ...prev,
                            textBackgroundColor: e.target.value,
                          }))
                        }
                        className="w-full h-6 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Opacity
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={videoSettings.textBackgroundOpacity}
                        onChange={(e) =>
                          setVideoSettings((prev) => ({
                            ...prev,
                            textBackgroundOpacity: Number(e.target.value),
                          }))
                        }
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">
                        {videoSettings.textBackgroundOpacity}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Outline cho text */}
              <div className="border-t border-gray-600 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">Outline</label>
                  <input
                    type="checkbox"
                    checked={videoSettings.textOutline}
                    onChange={(e) =>
                      setVideoSettings((prev) => ({
                        ...prev,
                        textOutline: e.target.checked,
                      }))
                    }
                    className="form-checkbox w-3 h-3"
                  />
                </div>
                {videoSettings.textOutline && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Outline color
                      </label>
                      <input
                        type="color"
                        value={videoSettings.textOutlineColor}
                        onChange={(e) =>
                          setVideoSettings((prev) => ({
                            ...prev,
                            textOutlineColor: e.target.value,
                          }))
                        }
                        className="w-full h-6 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Width
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={videoSettings.textOutlineWidth}
                        onChange={(e) =>
                          setVideoSettings((prev) => ({
                            ...prev,
                            textOutlineWidth: Number(e.target.value),
                          }))
                        }
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">
                        {videoSettings.textOutlineWidth}px
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* Shadow cho text */}
              <div className="border-t border-gray-600 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">Shadow</label>
                  <input
                    type="checkbox"
                    checked={videoSettings.textShadow}
                    onChange={(e) =>
                      setVideoSettings((prev) => ({
                        ...prev,
                        textShadow: e.target.checked,
                      }))
                    }
                    className="form-checkbox w-3 h-3"
                  />
                </div>
                {videoSettings.textShadow && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Shadow color
                        </label>
                        <input
                          type="color"
                          value={videoSettings.textShadowColor}
                          onChange={(e) =>
                            setVideoSettings((prev) => ({
                              ...prev,
                              textShadowColor: e.target.value,
                            }))
                          }
                          className="w-full h-6 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Opacity
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={videoSettings.textShadowOpacity}
                          onChange={(e) =>
                            setVideoSettings((prev) => ({
                              ...prev,
                              textShadowOpacity: Number(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                        <span className="text-xs text-gray-400">
                          {videoSettings.textShadowOpacity}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          X position
                        </label>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          value={videoSettings.textShadowX}
                          onChange={(e) =>
                            setVideoSettings((prev) => ({
                              ...prev,
                              textShadowX: Number(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                        <span className="text-xs text-gray-400">
                          {videoSettings.textShadowX}px
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Y position
                        </label>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          value={videoSettings.textShadowY}
                          onChange={(e) =>
                            setVideoSettings((prev) => ({
                              ...prev,
                              textShadowY: Number(e.target.value),
                            }))
                          }
                          className="w-full"
                        />
                        <span className="text-xs text-gray-400">
                          {videoSettings.textShadowY}px
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSettingsPanel;
