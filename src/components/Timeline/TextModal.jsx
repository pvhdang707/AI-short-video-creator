import React from "react";
import ModalPortal from '../ModalPortal';
import { visibleFontList } from '../../utils/fontList.js';

const TextModal = ({
  show,
  onClose,
  onSubmit,
  textInput,
  setTextInput,
  textStyle,
  setTextStyle,
  editingTextId,
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
          className="bg-gray-800 p-6 rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto z-[99999]"
          style={{ zIndex: 99999 }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); }}
        >
          <h3 className="text-white text-lg font-medium mb-4">
            {editingTextId ? "Edit Text" : "Add Text"}
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[75vh]">
            {/* Nội dung text */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Content</label>
              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                className="w-full bg-gray-700 text-white rounded p-2 min-h-[60px] resize-none"
                placeholder="Enter content..."
                rows={3}
              />
            </div>
            {/* Màu sắc & Kích thước */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Color</label>
                <input
                  type="color"
                  value={textStyle.color}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setTextStyle(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-12 p-1 bg-gray-700 rounded cursor-pointer"
                />
                <span className="text-white text-xs">{textStyle.color}</span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Size ({textStyle.fontSize}px)</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={textStyle.fontSize}
                  onChange={e => setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
            {/* Font chữ */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Font</label>
              <select
                value={textStyle.fontFamily}
                onChange={e => setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded p-2"
              >
                {visibleFontList.map(font => (
                  <option key={font.file} value={font.file}>{font.name}</option>
                ))}
              </select>
            </div>
            {/* Background cho text */}
            <div className="border-t border-gray-600 pt-3">
              <label className="text-sm text-gray-400 mb-2 block">Background</label>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Background color</label>
                  <input
                    type="color"
                    onClick={e => e.stopPropagation()}  
                    value={textStyle.backgroundColor || "#000000"}
                    onChange={e => setTextStyle(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={textStyle.backgroundOpacity }
                    onChange={e => setTextStyle(prev => ({ ...prev, backgroundOpacity: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{(textStyle.backgroundOpacity ).toFixed(1)}</span>
                </div>
              </div>
            </div>
            {/* Viền text */}
            <div className="border-t border-gray-600 pt-3">
              <label className="text-sm text-gray-400 mb-2 block">Outline</label>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Outline color</label>
                  <input
                    type="color"
                    onClick={e => e.stopPropagation()}  
                    value={textStyle.outlineColor || "#000000"}
                    onChange={e => setTextStyle(prev => ({ ...prev, outlineColor: e.target.value }))}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Width</label>
                  <input
                    type="range"
                    min="0"
                    step="0.5"
                    max="10"
                    value={textStyle.outlineWidth }
                    onChange={e => setTextStyle(prev => ({ ...prev, outlineWidth: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{textStyle.outlineWidth }px</span>
                </div>
              </div>
            </div>
            {/* Đổ bóng */}
            <div className="border-t border-gray-600 pt-3">
              <label className="text-sm text-gray-400 mb-2 block">Shadow</label>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Shadow color</label>
                  <input
                    type="color"
                    onClick={e => e.stopPropagation()}  
                    value={textStyle.shadowColor || "#000000"}
                    onChange={e => setTextStyle(prev => ({ ...prev, shadowColor: e.target.value }))}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={textStyle.shadowOpacity }
                    onChange={e => setTextStyle(prev => ({ ...prev, shadowOpacity: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{(textStyle.shadowOpacity ).toFixed(1)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center mt-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">X position</label>
                  <input
                    type="range"
                    min="-10"
                    step="0.5"
                    max="10"
                    value={textStyle.shadowX }
                    onChange={e => setTextStyle(prev => ({ ...prev, shadowX: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{textStyle.shadowX }px</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Y position</label>
                  <input
                    type="range"
                    min="-10"
                    step="0.5"
                    max="10"
                    value={textStyle.shadowY }
                    onChange={e => setTextStyle(prev => ({ ...prev, shadowY: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{textStyle.shadowY }px</span>
                </div>
              </div>
            </div>
            {/* Thời gian */}
            <div className="border-t border-gray-600 pt-3">
              <h4 className="text-sm text-gray-300 mb-2">Time</h4>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={audioRefs.current[`voice_${selectedScene}`]?.duration || 60}
                    step="1"
                    value={textStyle.startTime}
                    onChange={e => setTextStyle(prev => ({ ...prev, startTime: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 text-white rounded p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={audioRefs.current[`voice_${selectedScene}`]?.duration || 5}
                    step="0.1"
                    value={textStyle.endTime}
                    onChange={e => setTextStyle(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 text-white rounded p-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={onSubmit}
              className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingTextId ? "Update" : "Add"}
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

export default TextModal; 