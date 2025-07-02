import React from "react";
import ModalPortal from "../ModalPortal";

const ImageOverlayControlsModal = ({
  show,
  onClose,
  editingImageOverlay,
  handleUpdateImageOverlay,
  audioRefs,
  selectedScene,
}) => {
  if (!show || !editingImageOverlay) return null;
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
          Edit Image Overlay
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Scale
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={editingImageOverlay.scale}
              onChange={e => handleUpdateImageOverlay({ scale: parseFloat(e.target.value) })}
              onMouseDown={e => e.stopPropagation()}
              onMouseUp={e => e.stopPropagation()}
              className="w-full"
            />
            <span className="text-white">
              {editingImageOverlay.scale}
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
              value={editingImageOverlay.rotation}
              onChange={e => handleUpdateImageOverlay({ rotation: parseInt(e.target.value) })}
              onMouseDown={e => e.stopPropagation()}
              onMouseUp={e => e.stopPropagation()}
              className="w-full"
            />
            <span className="text-white">
              {editingImageOverlay.rotation}°
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
              value={editingImageOverlay.opacity}
              onChange={e => handleUpdateImageOverlay({ opacity: parseFloat(e.target.value) })}
              onMouseDown={e => e.stopPropagation()}
              onMouseUp={e => e.stopPropagation()}
              className="w-full"
            />
            <span className="text-white">
              {editingImageOverlay.opacity}
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
                value={editingImageOverlay.timing.start}
                onChange={e => handleUpdateImageOverlay({ timing: { ...editingImageOverlay.timing, start: parseFloat(e.target.value) } })}
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
                value={editingImageOverlay.timing.end}
                onChange={e => handleUpdateImageOverlay({ timing: { ...editingImageOverlay.timing, end: parseFloat(e.target.value) } })}
                className="w-full bg-gray-700 text-white rounded p-2"
              />
            </div>
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
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

export default ImageOverlayControlsModal; 