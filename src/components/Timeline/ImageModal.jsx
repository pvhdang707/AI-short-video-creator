import React from "react";
import ModalPortal from "../ModalPortal";

const ImageModal = ({
  show,
  onClose,
  onSubmit,
  selectedImage,
  setSelectedImage,
  imageOverlaySettings,
  setImageOverlaySettings,
  handleImageUpload,
  audioRefs,
  selectedScene,
}) => {
  if (!show) return null;
  return (
    <ModalPortal>
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99998]"
      style={{ zIndex: 99998 }}
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 p-6 rounded-lg w-96 z-[99999]"
        style={{ zIndex: 99999 }}
        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
      >
        <h3 className="text-white text-lg font-medium mb-4">
          Add Image Overlay
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Select image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              onClick={e => e.stopPropagation()}
              className="w-full bg-gray-700 text-white rounded p-2"
            />
          </div>
          {selectedImage && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Scale
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={imageOverlaySettings.scale}
                  onChange={e => setImageOverlaySettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                  onMouseDown={e => e.stopPropagation()}
                  onMouseUp={e => e.stopPropagation()}
                  className="w-full"
                />
                <span className="text-white">
                  {imageOverlaySettings.scale}
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Rotation
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={imageOverlaySettings.rotation}
                  onChange={e => setImageOverlaySettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                  onMouseDown={e => e.stopPropagation()}
                  onMouseUp={e => e.stopPropagation()}
                  className="w-full"
                />
                <span className="text-white">
                  {imageOverlaySettings.rotation}°
                </span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={imageOverlaySettings.opacity}
                  onChange={e => setImageOverlaySettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                  onMouseDown={e => e.stopPropagation()}
                  onMouseUp={e => e.stopPropagation()}
                  className="w-full"
                />
                <span className="text-white">
                  {imageOverlaySettings.opacity}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Start time (s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={audioRefs.current[`voice_${selectedScene}`]?.duration || 5}
                    step="0.1"
                    value={imageOverlaySettings.startTime}
                    onChange={e => setImageOverlaySettings(prev => ({ ...prev, startTime: parseFloat(e.target.value) }))}
                    onFocus={e => e.stopPropagation()}
                    onBlur={e => e.stopPropagation()}
                    className="w-full bg-gray-700 text-white rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    End time (s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={audioRefs.current[`voice_${selectedScene}`]?.duration || 5}
                    step="0.1"
                    value={imageOverlaySettings.endTime}
                    onChange={e => setImageOverlaySettings(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 text-white rounded p-2"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={onSubmit}
            disabled={!selectedImage}
            className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={onClose}
            className="flex-1 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default ImageModal; 