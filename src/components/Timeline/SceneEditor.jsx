import React, { useState, useRef } from 'react';
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import ZIndexManager from '../ZIndexFix.jsx';
import DraggableElement from './DraggableElement';
import DraggableImageOverlay from './DraggableImageOverlay';
import CustomSlider from './CustomSlider';

// // Draggable Element Component
// const DraggableElement = ({ 
//   id, 
//   type, 
//   children, 
//   position, 
//   style: elementStyle, 
//   zIndex = 0,
//   onDelete,
//   onEdit,
//   onZIndexChange
// }) => {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//     id: `${type}-${id}`,
//     data: { type, id }
//   });

//   const handleDelete = (e) => {
//     e.stopPropagation();
//     onDelete(id, type);
//   };

//   const handleEdit = (e) => {
//     e.stopPropagation();
//     onEdit(id, type);
//   };

//   const handleZIndexChange = (direction) => {
//     onZIndexChange(id, type, direction);
//   };

//   const style = {
//     ...elementStyle,
//     transform: CSS.Translate.toString(transform ? {
//       x: transform.x,
//       y: transform.y
//     } : { x: 0, y: 0 }),
//     position: 'absolute',
//     left: `${position.x}%`,
//     top: `${position.y}%`,
//     cursor: 'move',
//     zIndex: 1000 + (zIndex || 0) // Base z-index 1000 + overlay z-index
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
//       <div className="relative group">
//         {type === 'label' ? (
//           <span style={{
//             color: elementStyle.color,
//             fontSize: `${elementStyle.fontSize}px`,
//             fontFamily: elementStyle.fontFamily
//           }}>
//             {children}
//           </span>
//         ) : (
//           children
//         )}
//         <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
//           <div className="flex flex-col gap-1">
//             <div className="flex gap-1">
//               <button
//                 onClick={handleDelete}
//                 className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                 title="Xóa"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                 </svg>
//               </button>
//               {type === 'label' && (
//                 <button
//                   onClick={handleEdit}
//                   className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600"
//                   title="Chỉnh sửa"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//                     <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                   </svg>
//                 </button>
//               )}
//             </div>
//             <div className="bg-black bg-opacity-75 text-white text-xs px-1 rounded text-center font-bold">
//               Z: {zIndex || 0}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const SceneEditor = ({
  content,
  selectedScene,
  sceneElements,
  setSceneElements,
  previewRef,
  showTextModal,
  setShowTextModal,
  setShowImageModal,
  setEditingTextId,
  setTextInput,
  textStyle,
  setTextStyle,
  audioRefs,
  handleImageOverlayClick,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const scene = content.find(s => s.scene_number === selectedScene);
  const elements = sceneElements[selectedScene];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    })
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const [type, id] = active.id.split('-');
    const previewRect = previewRef.current.getBoundingClientRect();
    const previewWidth = previewRect.width;
    const previewHeight = previewRect.height;
    
    if (!sceneElements[selectedScene].scenePreviewDimensions) {
      setSceneElements(prev => ({
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          scenePreviewDimensions: {
            width: previewWidth,
            height: previewHeight
          }
        }
      }));
    }

    if (type === 'imageOverlay') {
      const currentElement = elements.imageOverlays.find(el => el.id === parseInt(id));
      if (!currentElement) return;

      const overlayPercentX = Math.max(0, Math.min(100, 
        currentElement.position.x + (delta.x / previewRect.width) * 100
      ));
      const overlayPercentY = Math.max(0, Math.min(100, 
        currentElement.position.y + (delta.y / previewRect.height) * 100
      ));

      setSceneElements(prev => ({
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          imageOverlays: prev[selectedScene].imageOverlays.map(el => 
            el.id === parseInt(id)
              ? { ...el, position: { x: overlayPercentX, y: overlayPercentY } }
              : el
          )
        }
      }));
      return;
    }

    const currentElement = elements[type === 'sticker' ? 'stickers' : 'labels']
      .find(el => el.id === parseInt(id));

    if (!currentElement) return;

    const elementPercentX = Math.max(0, Math.min(100, 
      currentElement.position.x + (delta.x / previewRect.width) * 100
    ));
    const elementPercentY = Math.max(0, Math.min(100, 
      currentElement.position.y + (delta.y / previewRect.height) * 100
    ));

    setSceneElements(prev => ({
      ...prev,
      [selectedScene]: {
        ...prev[selectedScene],
        [type === 'sticker' ? 'stickers' : 'labels']: prev[selectedScene][type === 'sticker' ? 'stickers' : 'labels']
          .map(el => el.id === parseInt(id)
            ? { ...el, position: { x: elementPercentX, y: elementPercentY } }
            : el
          )
      }
    }));
  };

  const handleDeleteElement = (id, type) => {
    setSceneElements(prev => ({
      ...prev,
      [selectedScene]: {
        ...prev[selectedScene],
        [type === 'sticker' ? 'stickers' : 'labels']: prev[selectedScene][type === 'sticker' ? 'stickers' : 'labels']
          .filter(el => el.id !== id)
      }
    }));
  };

  const handleEditElement = (id, type) => {
    // This will be handled by parent component
    if (type === 'label') {
      const label = elements.labels.find(el => el.id === id);
      setTextInput(label.text);
      setTextStyle(label.style);
    }
  };

  const handleZIndexChange = (id, type, direction) => {
    setSceneElements(prev => {
      const currentOverlays = [
        ...(prev[selectedScene]?.labels || []),
        ...(prev[selectedScene]?.stickers || []),
        ...(prev[selectedScene]?.imageOverlays || [])
      ];
      
      const currentElement = currentOverlays.find(el => el.id === id);
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
      
      const arrayName = type === 'sticker' ? 'stickers' : 'labels';
      
      return {
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          [arrayName]: prev[selectedScene][arrayName].map(el =>
            el.id === id ? { ...el, zIndex: newZIndex } : el
          )
        }
      };
    });
  };

  if (!selectedScene || !elements) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm bg-gray-800/30 rounded-lg">
        <span>Chọn một scene để chỉnh sửa</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={previewRef}
          className="relative aspect-video bg-black rounded-lg overflow-hidden"
        >
          {scene?.image?.url && (
            <img
              src={scene.image.url}
              alt="Preview"
              className="w-full h-full object-contain"
              style={{
                filter: `brightness(${elements.image.brightness + 1}) \
                        contrast(${elements.image.contrast}) \
                        saturate(${elements.image.saturation})`,
                transform: `scale(${elements.image.scale}) rotate(${elements.image.rotation}deg)`,
              }}
            />
          )}
          {elements && (
            <>
              {elements.labels
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((label) => (
                  <DraggableElement
                    key={label.id}
                    id={label.id}
                    type="label"
                    position={label.position}
                    zIndex={label.zIndex}
                    style={
                      showTextModal && label.id === setEditingTextId
                        ? textStyle
                        : label.style
                    }
                    setSceneElements={setSceneElements}
                    selectedScene={selectedScene}
                    sceneElements={sceneElements}
                    setShowTextModal={setShowTextModal}
                    setEditingTextId={setEditingTextId}
                    setTextInput={setTextInput}
                  >
                    {label.text}
                  </DraggableElement>
                ))}
              {elements.imageOverlays?.map((overlay) => (
                <DraggableImageOverlay
                  key={overlay.id}
                  overlay={overlay}
                  onDelete={(overlayId) => {
                    setSceneElements((prev) => {
                      return {
                        ...prev,
                        [selectedScene]: {
                          ...prev[selectedScene],
                          imageOverlays: prev[selectedScene].imageOverlays.filter(
                            (el) => el.id !== overlayId
                          ),
                        },
                      };
                    });
                  }}
                  onClick={() => handleImageOverlayClick(overlay)}
                />
              ))}
            </>
          )}
        </div>
      </DndContext>
      <div className="bg-gray-800/50 rounded-lg border border-gray-600">
        <div className="flex border-b border-gray-600">
          <button
            onClick={() =>
              setSceneElements((prev) => ({
                ...prev,
                [selectedScene]: {
                  ...prev[selectedScene],
                  activeTab: "image",
                },
              }))
            }
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              elements.activeTab === "image"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            🖼️ Edit Image
          </button>
          <button
            onClick={() =>
              setSceneElements((prev) => ({
                ...prev,
                [selectedScene]: {
                  ...prev[selectedScene],
                  activeTab: "elements",
                },
              }))
            }
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              elements.activeTab === "elements"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            ✨ Elements
          </button>
        </div>
        <div className="p-4">
          {elements.activeTab === "image" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Scale ({elements.image.scale})
                  </label>
                  <div className="flex items-center space-x-2">
                    <CustomSlider
                      min={0.5}
                      max={2}
                      step={0.2}
                      value={elements.image.scale}
                      onChange={(e) =>
                        setSceneElements((prev) => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: {
                              ...prev[selectedScene].image,
                              scale: parseFloat(e.target.value),
                            },
                          },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[2rem] text-center">
                      {elements.image.scale}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Rotation ({elements.image.rotation}°)
                  </label>
                  <div className="flex items-center space-x-2">
                    <CustomSlider
                      min={-180}
                      max={180}
                      step={1}
                      value={elements.image.rotation}
                      onChange={(e) =>
                        setSceneElements((prev) => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: {
                              ...prev[selectedScene].image,
                              rotation: parseInt(e.target.value),
                            },
                          },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[3rem] text-center">
                      {elements.image.rotation}°
                    </span>
                  </div>
                </div> */}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Brightness ({elements.image.brightness})
                  </label>
                  <div className="flex items-center space-x-2">
                    <CustomSlider
                      min={-1}
                      max={1}
                      step={0.1}
                      value={elements.image.brightness}
                      onChange={(e) =>
                        setSceneElements((prev) => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: {
                              ...prev[selectedScene].image,
                              brightness: parseFloat(e.target.value),
                            },
                          },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[2rem] text-center">
                      {elements.image.brightness}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Contrast ({elements.image.contrast})
                  </label>
                  <div className="flex items-center space-x-2">
                    <CustomSlider
                      min={0}
                      max={2}
                      step={0.1}
                      value={elements.image.contrast}
                      onChange={(e) =>
                        setSceneElements((prev) => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: {
                              ...prev[selectedScene].image,
                              contrast: parseFloat(e.target.value),
                            },
                          },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[2rem] text-center">
                      {elements.image.contrast}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Saturation ({elements.image.saturation})
                  </label>
                  <div className="flex items-center space-x-2">
                    <CustomSlider
                      min={0}
                      max={2}
                      step={0.1}
                      value={elements.image.saturation}
                      onChange={(e) =>
                        setSceneElements((prev) => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: {
                              ...prev[selectedScene].image,
                              saturation: parseFloat(e.target.value),
                            },
                          },
                        }))
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[2rem] text-center">
                      {elements.image.saturation}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {elements.activeTab === "elements" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowTextModal(true)}
                  className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📝</span>
                  <span className="text-sm">Add Text Overlay</span>
                </button>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🖼️</span>
                  <span className="text-sm">Add Image Overlay</span>
                </button>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-300 mb-2">
                  Current elements:
                </h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Text:</span>
                    <span>{elements.labels?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Image Overlays:</span>
                    <span>{elements.imageOverlays?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneEditor; 