import React from 'react';

// Component để hiển thị và quản lý z-index
export const ZIndexManager = ({ sceneElements, selectedScene, setSceneElements }) => {
  const handleZIndexChange = (elementId, type, direction) => {
    setSceneElements(prev => {
      const currentOverlays = [
        ...(prev[selectedScene]?.labels || []),
        ...(prev[selectedScene]?.stickers || []),
        ...(prev[selectedScene]?.imageOverlays || [])
      ];
      
      const currentElement = currentOverlays.find(el => el.id === elementId);
      if (!currentElement) return prev;
      
      const currentZIndex = currentElement.zIndex || 0;
      let newZIndex = currentZIndex;
      
      if (direction === 'up') {
        // Bring to front
        const maxZIndex = currentOverlays.reduce((max, overlay) => 
          Math.max(max, overlay.zIndex || 0), 0);
        newZIndex = maxZIndex + 1;
      } else if (direction === 'down') {
        // Send to back
        const minZIndex = currentOverlays.reduce((min, overlay) => 
          Math.min(min, overlay.zIndex || 0), 0);
        newZIndex = Math.max(0, minZIndex - 1);
      }
      
      const arrayName = type === 'sticker' ? 'stickers' : type === 'label' ? 'labels' : 'imageOverlays';
      
      return {
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          [arrayName]: prev[selectedScene][arrayName].map(el =>
            el.id === elementId ? { ...el, zIndex: newZIndex } : el
          )
        }
      };
    });
  };

  const getAllOverlays = () => {
    if (!sceneElements[selectedScene]) return [];
    
    const overlays = [
      ...(sceneElements[selectedScene].labels || []).map(label => ({ ...label, type: 'label' })),
      ...(sceneElements[selectedScene].stickers || []).map(sticker => ({ ...sticker, type: 'sticker' })),
      ...(sceneElements[selectedScene].imageOverlays || []).map(image => ({ ...image, type: 'image' }))
    ];
    
    // Sắp xếp theo z-index
    return overlays.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  };

  const overlays = getAllOverlays();

  if (overlays.length === 0) {
    return (
      <div className="bg-gray-700/50 p-3 rounded-lg">
        <p className="text-xs text-gray-400">No overlays in this scene</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700/50 p-3 rounded-lg">
      <h4 className="text-sm text-white font-medium mb-3">📋 Display Order Management (Z-index)</h4>
      <div className="space-y-2">
        {overlays.map((overlay, index) => (
          <div 
            key={`${overlay.type}-${overlay.id}`}
            className="flex items-center justify-between bg-gray-800/50 p-2 rounded border border-gray-600"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                {overlay.zIndex || 0}
              </div>
              <div className="flex-1">
                <div className="text-xs text-white font-medium">
                  {overlay.type === 'label' ? '📝 Text' : overlay.type === 'sticker' ? '😊 Sticker' : '🖼️ Image'}
                </div>
                <div className="text-xs text-gray-400">
                  {overlay.type === 'label' ? overlay.text : overlay.type === 'sticker' ? overlay.content : 'Image overlay'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleZIndexChange(overlay.id, overlay.type, 'down')}
                disabled={index === 0}
                className={`p-1 rounded text-xs ${
                  index === 0 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
                title="Send to back"
              >
                ⬇️
              </button>
              <button
                onClick={() => handleZIndexChange(overlay.id, overlay.type, 'up')}
                disabled={index === overlays.length - 1}
                className={`p-1 rounded text-xs ${
                  index === overlays.length - 1 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title="Bring to front"
              >
                ⬆️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-600">
        <p className="text-xs text-gray-400">
          💡 <strong>Higher Z-index</strong> will display <strong>above</strong> other overlays
        </p>
        <p className="text-xs text-gray-400">
          💡 Use ⬆️⬇️ buttons to change display order
        </p>
      </div>
    </div>
  );
};

export default ZIndexManager; 