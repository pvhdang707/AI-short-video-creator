import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { generateScript } from '../../../utils/scriptGenerator';
import ZIndexManager from '../../../components/ZIndexFix.jsx';




const TimelineUI = React.forwardRef(({ content = [], onExportScript, ffmpeg, scriptId }, ref) => {
  // Debug log để kiểm tra scriptId
  console.log('TimelineUI received scriptId:', scriptId);
  console.log('TimelineUI received content:', content);

  // Add a function to generate script that can be called from a button click in VideoGenerator
  const generateScriptForVideo = async () => {
    if (!videoSettings) {
      console.error('Video settings is undefined');
      return null;
    }

    // Kiểm tra xem content và sceneElements có hợp lệ không
    if (!content || content.length === 0) {
      console.error('No content available to create script');
      return null;
    }

    if (!sceneElements) {
      console.error('Scene elements is undefined');
      return null;
    }

    try {
      console.log('=== SCRIPT GENERATION DEBUG ===');
      console.log('Creating script with FFmpeg:', !!ffmpeg);
      console.log('VideoSettings:', videoSettings);
      console.log('IndividualTransitions:', videoSettings.individualTransitions);
      console.log('IndividualTransitions length:', videoSettings.individualTransitions?.length);
      console.log('Content length:', content?.length);
      
      // Log chi tiết từng individual transition
      if (videoSettings.individualTransitions) {
        console.log('=== INDIVIDUAL TRANSITIONS DETAIL ===');
        videoSettings.individualTransitions.forEach((transition, index) => {
          console.log(`Transition ${index}:`, {
            id: transition.id,
            fromScene: transition.fromScene,
            toScene: transition.toScene,
            type: transition.type,
            duration: transition.duration,
            isActive: transition.type !== 'none'
          });
        });
      }
      
      // Truyền ffmpeg vào hàm generateScript nếu có
      const script = await generateScript(content, videoSettings, sceneElements, ffmpeg);
      
      console.log('=== GENERATED SCRIPT DEBUG ===');
      console.log('Script global transitions:', script.global?.transitions);
      console.log('Script individual transitions:', script.global?.transitions?.individualTransitions);
      console.log('Script scenes count:', script.scenes?.length);
      
      // Cập nhật scriptId nếu có
      if (scriptId) {
        script.id = scriptId;
        console.log('Updated script ID:', scriptId);
        console.log('Script after updating ID:', script);
      } else {
        console.log('No scriptId to update');
      }
      
      // Gọi callback để đưa script về parent
      if (onExportScript) {
        onExportScript(script);
      }
      
      return script;
    } catch (error) {
      console.error('Error creating script:', error);
      return null;
    }
  };
  const [selectedScene, setSelectedScene] = useState(null);
  const [sceneElements, setSceneElements] = useState({});
  const audioRefs = useRef({});
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textStyle, setTextStyle] = useState({
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Arial',
    startTime: 0,
    endTime: 5
  });
  const previewRef = useRef(null);
  const [stickerSettings, setStickerSettings] = useState({
    startTime: 0,
    endTime: 5
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageOverlaySettings, setImageOverlaySettings] = useState({
    startTime: 0,
    endTime: 5,
    scale: 1,
    rotation: 0,
    opacity: 1
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingImageOverlay, setEditingImageOverlay] = useState(null);
  const [showImageOverlayControls, setShowImageOverlayControls] = useState(false);

 

  // Thêm state cho các tùy chỉnh video
  const [videoSettings, setVideoSettings] = useState({
    resolution: '854x480',
    fps: 24,
    preset: 'medium',
    crf: 23,
    fadeIn: 0,
    fadeOut: 0,
    zoomEffect: false,
    brightness: 0,
    contrast: 1,
    saturation: 1,
    hue: 0,
    blur: 0,
    transition: 'none',
    transitionDuration: 1,
    backgroundColor: 'black',
    textOverlay: false,
    textPosition: 'bottom',
    textColor: 'white',
    textSize: 24,
    textBackground: false,
    textBackgroundColor: '#000000',
    textBackgroundOpacity: 0.5,
    textOutline: false,
    textOutlineColor: '#000000',
    textOutlineWidth: 2,
    textShadow: false,
    textShadowColor: '#000000',
    textShadowX: 2,
    textShadowY: 2,
    textShadowOpacity: 0.4,
    watermark: false,
    watermarkPosition: 'bottom-right',
    watermarkOpacity: 0.5,
    audioEffects: {
      volume: 1,
      fadeIn: 0,
      fadeOut: 0,
      normalize: false,
      bass: 0,
      treble: 0
    },
    // Thêm cấu hình transition riêng lẻ cho từng scene
    individualTransitions: [],
    showAdvanced: false,
    activeTab: 'effects',
    // Thêm state cho các menu dropdown mới
    showEffects: false,
    showColor: false
  });

  // Khởi tạo scene elements
  useEffect(() => {
    const initialElements = {};
    content.forEach((scene) => {
      initialElements[scene.scene_number] = {
        stickers: [],
        labels: [],
        imageOverlays: [], // Thêm imageOverlays
        effects: [],
        transitions: {
          type: 'none',
          duration: 1
        },
        audio: {
          volume: 1,
          fadeIn: 0,
          fadeOut: 0
        },
        image: {
          scale: 1,
          position: { x: 0, y: 0 },
          rotation: 0,
          brightness: 0,
          contrast: 1,
          saturation: 1
        },
        activeTab: 'audio' // Thêm activeTab mặc định
      };
    });
    setSceneElements(initialElements);
  }, [content]);

  // Cập nhật individualTransitions khi content thay đổi
  useEffect(() => {
    if (content && content.length > 1) {
      const transitions = [];
      for (let i = 0; i < content.length - 1; i++) {
        transitions.push({
          id: i,
          fromScene: content[i].scene_number,
          toScene: content[i + 1].scene_number,
          type: 'none',
          duration: 1
        });
      }
      console.log('Initializing individualTransitions:', transitions);
      setVideoSettings(prev => ({
        ...prev,
        individualTransitions: transitions
      }));
    } else if (content && content.length <= 1) {
      // Reset individualTransitions nếu chỉ có 1 scene hoặc không có scene
      setVideoSettings(prev => ({
        ...prev,
        individualTransitions: []
      }));
    }
  }, [content]);

  // Scene List Component
  const SceneList = () => {
    const updateTransition = (index, updates) => {
      setVideoSettings(prev => ({
        ...prev,
        individualTransitions: prev.individualTransitions.map((transition, i) =>
          i === index ? { ...transition, ...updates } : transition
        )
      }));
    };

    return (
    <div className="space-y-2">
      {content.map((scene, index) => (
          <div key={index}>
        <div 
          className={`bg-gray-900/50 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
            selectedScene === scene.scene_number 
              ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-900/20' 
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
          }`}
          onClick={() => setSelectedScene(scene.scene_number)}
        >
          <div className="flex items-start space-x-3">
            {/* Scene Number Badge */}
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                selectedScene === scene.scene_number 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
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
                        No image
                      </div>
                )}
                
                
              </div>

              {/* Scene Info */}
              <div className="space-y-1">
                {/* Voice Over Text */}
                <div className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {scene.voice_over || 'No content'}
                </div>
                
                {/* Scene Stats */}
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center">
                    <span className="mr-1">🎵</span>
                    {scene.voice?.audio_base64 ? 'Has audio' : 'No audio'}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">📝</span>
                    {sceneElements[scene.scene_number]?.labels?.length || 0} text
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">😊</span>
                    {sceneElements[scene.scene_number]?.stickers?.length || 0} sticker
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

            {/* Transition Selector */}
            {index < content.length - 1 && videoSettings.individualTransitions[index] && (
              <TransitionSelector
                fromScene={scene.scene_number}
                toScene={content[index + 1].scene_number}
                transition={videoSettings.individualTransitions[index]}
                onUpdate={(updates) => updateTransition(index, updates)}
              />
            )}
        </div>
      ))}
    </div>
  );
  };

  // Draggable Element Component
  const DraggableElement = ({ id, type, children, position, style: elementStyle, zIndex = 0 }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: `${type}-${id}`,
      data: { type, id }
    });

    const handleDelete = (e) => {
      e.stopPropagation();
      setSceneElements(prev => ({
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          [type === 'sticker' ? 'stickers' : 'labels']: prev[selectedScene][type === 'sticker' ? 'stickers' : 'labels']
            .filter(el => el.id !== id)
        }
      }));
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      if (type === 'label') {
        const label = sceneElements[selectedScene].labels.find(el => el.id === id);
        setTextInput(label.text);
        setTextStyle(label.style);
        setEditingTextId(id);
        setShowTextModal(true);
      }
    };

    const handleZIndexChange = (direction) => {
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

    const style = {
      ...elementStyle,
      transform: CSS.Translate.toString(transform ? {
        x: transform.x,
        y: transform.y
      } : { x: 0, y: 0 }),
      position: 'absolute',
      left: `${position.x}%`,
      top: `${position.y}%`,
      cursor: 'move',
      zIndex: 1000 + (zIndex || 0) // Base z-index 1000 + overlay z-index
    };

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <div className="relative group">
          {type === 'label' ? (
            <span style={{
              color: elementStyle.color,
              fontSize: `${elementStyle.fontSize}px`,
              fontFamily: elementStyle.fontFamily
            }}>
              {children}
            </span>
          ) : (
            children
          )}
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Xóa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {type === 'label' && (
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600"
                    title="Chỉnh sửa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="bg-black bg-opacity-75 text-white text-xs px-1 rounded text-center font-bold">
                Z: {zIndex || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Scene Editor Component
  const SceneEditor = () => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const scene = content.find(s => s.scene_number === selectedScene);
    const elements = sceneElements[selectedScene];
    const previewRef = useRef(null);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 1,
        },
      })
    );

    // Hàm formatTime
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDragEnd = (event) => {
      const { active, delta } = event;
      const [type, id] = active.id.split('-');
      const previewRect = previewRef.current.getBoundingClientRect();

      // Lưu kích thước preview để sử dụng khi chuyển đổi tọa độ sang FFmpeg
      const previewWidth = previewRect.width;
      const previewHeight = previewRect.height;
      
      // Cập nhật thông tin kích thước preview cho scene
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

      // Xử lý cho image overlay
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

      // Xử lý cho các element khác (stickers, labels)
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

    return (
      <div className="space-y-4">

       
        {/* Preview */}
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
                  filter: `brightness(${elements.image.brightness + 1}) 
                          contrast(${elements.image.contrast}) 
                          saturate(${elements.image.saturation})`,
                  transform: `scale(${elements.image.scale}) rotate(${elements.image.rotation}deg)`
                }}
              />
            )}
            {/* Overlay Elements */}
            {elements && (
              <>
                {/* Stickers */}
                {elements.stickers
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)) // Sort by z-index
                  .map(sticker => (
                  <DraggableElement
                    key={sticker.id}
                    id={sticker.id}
                    type="sticker"
                    position={sticker.position}
                    zIndex={sticker.zIndex}
                    style={{
                      fontSize: '2rem',
                      transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`
                    }}
                  >
                    {sticker.content}
                  </DraggableElement>
                ))}
                {/* Labels */}
                {elements.labels
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)) // Sort by z-index
                  .map(label => (
                  <DraggableElement
                    key={label.id}
                    id={label.id}
                    type="label"
                    position={label.position}
                    zIndex={label.zIndex}
                    style={label.style}
                  >
                    {label.text}
                  </DraggableElement>
                ))}
                {elements.imageOverlays?.map(overlay => {
                  console.log(`[Preview Overlay ${overlay.id}] Rendering with:`, {
                    scaleInfo: overlay.scaleInfo,
                    displayDimensions: overlay.displayDimensions,
                    userScale: overlay.scale,
                    position: overlay.position
                  });
                  
                  return (
                    <DraggableElement
                      key={overlay.id}
                      id={overlay.id}
                      type="imageOverlay"
                      position={overlay.position}
                      style={{
                        // Chỉ opacity ở đây, scale và rotation sẽ áp dụng trong img
                        opacity: overlay.opacity,
                        width: `${overlay.displayDimensions.width}px`,
                        height: `${overlay.displayDimensions.height}px`,
                        position: 'absolute',
                        cursor: 'move'
                      }}
                    >
                      <div 
                        className="relative group w-full h-full"
                        onClick={() => handleImageOverlayClick(overlay)}
                      >
                        <img
                          src={overlay.source}
                          alt="Overlay"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            transform: `scale(${overlay.scale || 1}) rotate(${overlay.rotation}deg)`,
                            opacity: overlay.opacity
                          }}
                        />
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSceneElements(prev => ({
                              ...prev,
                              [selectedScene]: {
                                ...prev[selectedScene],
                                imageOverlays: prev[selectedScene].imageOverlays.filter(el => el.id !== overlay.id)
                              }
                            }));
                          }}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </DraggableElement>
                );
                })}
              </>
            )}
          </div>
        </DndContext>

        {/* Timeline */}
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-3 mb-3">
            <button
              onClick={() => {
                const audio = audioRefs.current[`voice_${selectedScene}`];
                if (audio) {
                  if (audio.paused) {
                    audio.currentTime = 0;
                    audio.play();
                  } else {
                    audio.pause();
                  }
                }
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={audioRefs.current[`voice_${selectedScene}`]?.duration || 0}
                value={currentTime}
                onChange={(e) => {
                  const audio = audioRefs.current[`voice_${selectedScene}`];
                  if (audio) {
                    audio.currentTime = parseFloat(e.target.value);
                    setCurrentTime(parseFloat(e.target.value));
                  }
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(audioRefs.current[`voice_${selectedScene}`]?.duration || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scene Controls with Tabs */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-600">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-600">
            <button
              onClick={() => setSceneElements(prev => ({
                ...prev,
                [selectedScene]: {
                  ...prev[selectedScene],
                  activeTab: 'audio'
                }
              }))}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                elements.activeTab === 'audio' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🎵 Âm thanh
            </button>
            <button
              onClick={() => setSceneElements(prev => ({
                ...prev,
                [selectedScene]: {
                  ...prev[selectedScene],
                  activeTab: 'image'
                }
              }))}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                elements.activeTab === 'image' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🖼️ Hình ảnh
            </button>
            <button
              onClick={() => setSceneElements(prev => ({
                ...prev,
                [selectedScene]: {
                  ...prev[selectedScene],
                  activeTab: 'elements'
                }
              }))}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                elements.activeTab === 'elements' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              ✨ Elements
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {/* Audio Tab */}
            {elements.activeTab === 'audio' && (
              <div className="space-y-3">
                {/* Audio Effects */}
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <h4 className="text-sm text-white font-medium mb-3">🎵 Audio Effects</h4>
                  <div className="grid grid-cols-2 gap-3">
                <div>
                      <label className="block text-xs text-gray-400 mb-1">Âm lượng ({videoSettings.audioEffects.volume})</label>
                  <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={videoSettings.audioEffects.volume}
                        onChange={(e) => setVideoSettings(prev => ({
                      ...prev,
                          audioEffects: {
                            ...prev.audioEffects,
                            volume: Number(e.target.value)
                      }
                    }))}
                        className="w-full"
                  />
                </div>
                
                <div>
                      <label className="block text-xs text-gray-400 mb-1">Fade In ({videoSettings.audioEffects.fadeIn}s)</label>
                    <input
                      type="range"
                      min="0"
                        max="5"
                      step="0.1"
                        value={videoSettings.audioEffects.fadeIn}
                        onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                          audioEffects: {
                            ...prev.audioEffects,
                            fadeIn: Number(e.target.value)
                        }
                      }))}
                        className="w-full"
                    />
                </div>
                
                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Fade Out ({videoSettings.audioEffects.fadeOut}s)</label>
                    <input
                        type="range"
                      min="0"
                      max="5"
                      step="0.1"
                        value={videoSettings.audioEffects.fadeOut}
                        onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                          audioEffects: {
                            ...prev.audioEffects,
                            fadeOut: Number(e.target.value)
                        }
                      }))}
                        className="w-full"
                    />
                  </div>

                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Bass ({videoSettings.audioEffects.bass})</label>
                    <input
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={videoSettings.audioEffects.bass}
                        onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                          audioEffects: {
                            ...prev.audioEffects,
                            bass: Number(e.target.value)
                        }
                      }))}
                        className="w-full"
                    />
                  </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Treble ({videoSettings.audioEffects.treble})</label>
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        step="1"
                        value={videoSettings.audioEffects.treble}
                        onChange={(e) => setVideoSettings(prev => ({
                          ...prev,
                          audioEffects: {
                            ...prev.audioEffects,
                            treble: Number(e.target.value)
                          }
                        }))}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={videoSettings.audioEffects.normalize}
                        onChange={(e) => setVideoSettings(prev => ({
                          ...prev,
                          audioEffects: {
                            ...prev.audioEffects,
                            normalize: e.target.checked
                          }
                        }))}
                        className="form-checkbox w-3 h-3"
                      />
                      <label className="text-xs text-gray-300">Normalize audio</label>
                    </div>
                  </div>
                </div>

                {/* Audio Quality */}
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <h4 className="text-sm text-white font-medium mb-3">🎚️ Audio Quality</h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>• Normalize: Tự động điều chỉnh âm lượng để đồng nhất</p>
                    <p>• Bass: Tăng/giảm âm trầm (-20 đến +20dB)</p>
                    <p>• Treble: Tăng/giảm âm cao (-20 đến +20dB)</p>
                    <p>• Fade In/Out: Hiệu ứng âm thanh mượt mà</p>
                  </div>
                </div>
              </div>
            )}

            {/* Image Tab */}
            {elements.activeTab === 'image' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Scale ({elements.image.scale})
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={elements.image.scale}
                        onChange={(e) => setSceneElements(prev => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: { ...prev[selectedScene].image, scale: parseFloat(e.target.value) }
                          }
                        }))}
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
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={elements.image.rotation}
                        onChange={(e) => setSceneElements(prev => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: { ...prev[selectedScene].image, rotation: parseInt(e.target.value) }
                          }
                        }))}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-300 min-w-[3rem] text-center">
                        {elements.image.rotation}°
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Brightness ({elements.image.brightness})
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={elements.image.brightness}
                        onChange={(e) => setSceneElements(prev => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: { ...prev[selectedScene].image, brightness: parseFloat(e.target.value) }
                          }
                        }))}
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
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={elements.image.contrast}
                        onChange={(e) => setSceneElements(prev => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: { ...prev[selectedScene].image, contrast: parseFloat(e.target.value) }
                          }
                        }))}
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
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={elements.image.saturation}
                        onChange={(e) => setSceneElements(prev => ({
                          ...prev,
                          [selectedScene]: {
                            ...prev[selectedScene],
                            image: { ...prev[selectedScene].image, saturation: parseFloat(e.target.value) }
                          }
                        }))}
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

            {/* Elements Tab */}
            {elements.activeTab === 'elements' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                  onClick={() => setShowImageModal(true)}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🖼️</span>
                  <span className="text-sm">Add Image Overlay</span>
                </button>
                  <button
                    onClick={() => setShowTextModal(true)}
                    className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>📝</span>
                    <span className="text-sm">Add Text</span>
                  </button>
                </div>
                
                

                {/* Z-Index Manager */}
                <ZIndexManager 
                  sceneElements={sceneElements}
                  selectedScene={selectedScene}
                  setSceneElements={setSceneElements}
                />

                {/* Elements Summary */}
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-300 mb-2">Current Elements:</h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Stickers:</span>
                      <span>{elements.stickers?.length || 0}</span>
                    </div>
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

  // Thêm hàm để xuất script
  // Function is now called automatically when needed
const generateAndExportScript = async () => {
    if (!videoSettings) {
      console.error('Video settings is undefined');
      return null;
    }

    // Kiểm tra xem content và sceneElements có hợp lệ không
    if (!content || content.length === 0) {
      console.error('Không có nội dung để tạo script');
      return null;
    }

    if (!sceneElements) {
      console.error('Scene elements is undefined');
      return null;
    }

    try {
      console.log('=== SCRIPT GENERATION DEBUG ===');
      console.log('Đang tạo script với FFmpeg:', !!ffmpeg);
      console.log('VideoSettings:', videoSettings);
      console.log('IndividualTransitions:', videoSettings.individualTransitions);
      console.log('IndividualTransitions length:', videoSettings.individualTransitions?.length);
      console.log('Content length:', content?.length);
      
      // Log chi tiết từng individual transition
      if (videoSettings.individualTransitions) {
        console.log('=== INDIVIDUAL TRANSITIONS DETAIL ===');
        videoSettings.individualTransitions.forEach((transition, index) => {
          console.log(`Transition ${index}:`, {
            id: transition.id,
            fromScene: transition.fromScene,
            toScene: transition.toScene,
            type: transition.type,
            duration: transition.duration,
            isActive: transition.type !== 'none'
          });
        });
      }
      
      // Truyền ffmpeg vào hàm generateScript nếu có
      const script = await generateScript(content, videoSettings, sceneElements, ffmpeg);
      
      console.log('=== GENERATED SCRIPT DEBUG ===');
      console.log('Script global transitions:', script.global?.transitions);
      console.log('Script individual transitions:', script.global?.transitions?.individualTransitions);
      console.log('Script scenes count:', script.scenes?.length);
      
      // Cập nhật scriptId nếu có
      if (scriptId) {
        script.id = scriptId;
        console.log('Đã cập nhật script ID:', scriptId);
        console.log('Script sau khi cập nhật ID:', script);
      } else {
        console.log('Không có scriptId để cập nhật');
      }
      
      // Gọi callback để đưa script về parent
      if (onExportScript) {
        onExportScript(script);
      }
      
      return script;
    } catch (error) {
      console.error('Lỗi khi tạo script:', error);
      return null;
    }
  };

  // Cập nhật hàm xử lý thêm text
  const handleAddText = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!textInput.trim()) return;
    
    // Get the current scene's duration
    const scene = content.find(s => s.scene_number === selectedScene);
    const sceneDuration = scene?.duration || 5;
    
    // Get preview container dimensions for proper positioning
    const previewContainer = previewRef.current;
    const previewDimensions = previewContainer ? {
      width: previewContainer.offsetWidth,
      height: previewContainer.offsetHeight
    } : { width: 854, height: 480 };
    
    if (editingTextId) {
      // When editing, ensure that the end time doesn't exceed scene duration
      const updatedEndTime = Math.min(textStyle.endTime, sceneDuration);
      
      setSceneElements(prev => ({
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          labels: prev[selectedScene].labels.map(label =>
            label.id === editingTextId
              ? { 
                  ...label, 
                  text: textInput, 
                  style: {...textStyle},
                  timing: {
                    start: textStyle.startTime,
                    end: updatedEndTime
                  },
                  previewDimensions
                }
              : label
          )
        }
      }));
      setEditingTextId(null);
    } else {
      // Get highest z-index in current scene
      const existingOverlays = [
        ...(sceneElements[selectedScene]?.labels || []),
        ...(sceneElements[selectedScene]?.stickers || []),
        ...(sceneElements[selectedScene]?.imageOverlays || [])
      ];
      const maxZIndex = existingOverlays.reduce((max, overlay) => 
        Math.max(max, overlay.zIndex || 0), 0);
      
      // Ensure the end time doesn't exceed scene duration
      const endTime = Math.min(textStyle.endTime, sceneDuration);
      
      const newLabel = {
        id: Date.now(),
        text: textInput,
        position: { 
          x: 50, // percentage
          y: 50, // percentage
          unit: 'percentage'
        },
        style: textStyle,
        timing: {
          start: textStyle.startTime,
          end: endTime
        },
        zIndex: maxZIndex + 1,
        previewDimensions
      };
      setSceneElements(prev => ({
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          labels: [...prev[selectedScene].labels, newLabel]
        }
      }));
    }
    
    setTextInput('');
    setShowTextModal(false);
  };

  // Cập nhật hàm xử lý thêm sticker
  const handleAddSticker = (sticker) => {
    // Get the current scene's duration
    const scene = content.find(s => s.scene_number === selectedScene);
    const sceneDuration = scene?.duration || 5;
    
    // Get preview container dimensions for proper positioning
    const previewContainer = previewRef.current;
    const previewDimensions = previewContainer ? {
      width: previewContainer.offsetWidth,
      height: previewContainer.offsetHeight
    } : { width: 854, height: 480 };
    
    // Get highest z-index in current scene
    const existingOverlays = [
      ...(sceneElements[selectedScene]?.labels || []),
      ...(sceneElements[selectedScene]?.stickers || []),
      ...(sceneElements[selectedScene]?.imageOverlays || [])
    ];
    const maxZIndex = existingOverlays.reduce((max, overlay) => 
      Math.max(max, overlay.zIndex || 0), 0);
    
    // Ensure the end time doesn't exceed scene duration
    const endTime = Math.min(stickerSettings.endTime, sceneDuration);
    
    const newSticker = {
      id: Date.now(),
      type: sticker.type,
      content: sticker.content,
      position: { 
        x: 50, // percentage
        y: 50, // percentage
        unit: 'percentage'
      },
      scale: 1,
      rotation: 0,
      timing: {
        start: stickerSettings.startTime,
        end: endTime
      },
      zIndex: maxZIndex + 1,
      previewDimensions
    };
    setSceneElements(prev => ({
      ...prev,
      [selectedScene]: {
        ...prev[selectedScene],
        stickers: [...prev[selectedScene].stickers, newSticker]
      }
    }));
    setShowStickerModal(false);
  };

  // Thêm hàm xử lý upload ảnh
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setSelectedImage({
            file: file,
            url: e.target.result,
            width: img.width,
            height: img.height
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm hàm tính toán tỷ lệ scale - sửa lại cho chính xác WYSIWYG
  const calculateOverlayScale = (overlayImage, scenePreview, userScale = 1) => {
    // Lấy kích thước output thực tế của video
    const [outputWidth, outputHeight] = videoSettings.resolution.split('x').map(Number);
    
    // Lấy kích thước preview của scene từ DOM element
    const previewWidth = scenePreview?.width || outputWidth;
    const previewHeight = scenePreview?.height || outputHeight;

    // Tính tỷ lệ giữa preview container và output video
    const previewToOutputScaleX = outputWidth / previewWidth;
    const previewToOutputScaleY = outputHeight / previewHeight;
    
    // Cho overlay image một kích thước cơ sở trong preview (ví dụ: 120px chiều rộng)
    const basePreviewWidth = 120;
    const aspectRatio = overlayImage.width / overlayImage.height;
    const basePreviewHeight = basePreviewWidth / aspectRatio;
    
    // Áp dụng user scale vào kích thước preview
    const targetPreviewWidth = basePreviewWidth * userScale;
    const targetPreviewHeight = basePreviewHeight * userScale;
    
    // Tính scale factor từ kích thước gốc sang kích thước preview cuối cùng (đã áp dụng user scale)
    const previewScale = targetPreviewWidth / overlayImage.width;
    
    // Tính scale factor cho output video (để giữ nguyên tỷ lệ kích thước)
    const outputScale = previewScale * previewToOutputScaleX;
    
    console.log(`[calculateOverlayScale] Detailed calculations:`, {
      originalSize: { width: overlayImage.width, height: overlayImage.height },
      previewContainer: { width: previewWidth, height: previewHeight },
      outputVideo: { width: outputWidth, height: outputHeight },
      basePreviewSize: { width: basePreviewWidth, height: basePreviewHeight },
      userScale: userScale,
      targetPreviewSize: { width: targetPreviewWidth, height: targetPreviewHeight },
      scales: {
        previewScale: previewScale,
        outputScale: outputScale,
        previewToOutputScaleX: previewToOutputScaleX,
        previewToOutputScaleY: previewToOutputScaleY
      }
    });

    return {
      previewScale, // Scale để hiển thị trong preview
      outputScale, // Scale để sử dụng trong FFmpeg
      previewToOutputScaleX,
      previewToOutputScaleY,
      displayDimensions: {
        width: basePreviewWidth, // Giữ kích thước base, user scale sẽ áp dụng vào transform
        height: basePreviewHeight
      }
    };
  };

  // Cập nhật hàm handleAddImageOverlay
  const handleAddImageOverlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedImage) return;
    
    // Get the current scene's duration
    const scene = content.find(s => s.scene_number === selectedScene);
    const sceneDuration = scene?.duration || 5;
    
    // Ensure the end time doesn't exceed scene duration
    const endTime = Math.min(imageOverlaySettings.endTime, sceneDuration);

    // Lấy kích thước preview của scene
    let scenePreview;
    if (previewRef.current) {
      const previewRect = previewRef.current.getBoundingClientRect();
      scenePreview = {
        width: previewRect.width,
        height: previewRect.height
      };
    } else {
      // Nếu previewRef chưa sẵn sàng, sử dụng kích thước từ videoSettings
      const [outputWidth, outputHeight] = videoSettings.resolution.split('x').map(Number);
      scenePreview = {
        width: outputWidth,
        height: outputHeight
      };
    }

    // Tính toán tỷ lệ scale
    const scaleInfo = calculateOverlayScale(selectedImage, scenePreview, imageOverlaySettings.scale);
    
    const newImageOverlay = {
      id: Date.now(),
      type: 'image',
      source: selectedImage.url,
      originalDimensions: {
        width: selectedImage.width,
        height: selectedImage.height
      },
      displayDimensions: scaleInfo.displayDimensions,
      position: { x: 50, y: 50, unit: 'percentage' }, // Vị trí mặc định ở giữa
      scale: imageOverlaySettings.scale, // Scale từ user input (1.0 = no change)
      rotation: imageOverlaySettings.rotation,
      opacity: imageOverlaySettings.opacity,
      scaleInfo: {
        previewScale: scaleInfo.previewScale,
        outputScale: scaleInfo.outputScale,
        previewToOutputScaleX: scaleInfo.previewToOutputScaleX,
        previewToOutputScaleY: scaleInfo.previewToOutputScaleY
      },
      timing: {
        start: imageOverlaySettings.startTime,
        end: endTime
      }
    };
    
    setSceneElements(prev => ({
      ...prev,
      [selectedScene]: {
        ...prev[selectedScene],
        imageOverlays: [...(prev[selectedScene].imageOverlays || []), newImageOverlay]
      }
    }));
    
    setSelectedImage(null);
    setShowImageModal(false);
  };

  // Đưa phương thức generateAndExportScript ra bên ngoài để VideoGenerator có thể gọi
  React.useImperativeHandle(ref, () => ({
    generateAndExportScript
  }));
  
  // Thêm phương thức vào DOM element để có thể truy cập từ bên ngoài
  // Điều này là cần thiết vì chúng ta không thể trực tiếp truy cập ref từ code ngoài component
  React.useEffect(() => {
    // Gắn method vào element DOM của component
    const timelineElement = document.querySelector('.timeline-component');
    if (timelineElement) {
      timelineElement.generateAndExportScript = generateAndExportScript;
    }
    return () => {
      // Cleanup khi unmount
      const element = document.querySelector('.timeline-component');
      if (element) {
        delete element.generateAndExportScript;
      }
    };
  }, [generateAndExportScript]); // Thêm dependency để đảm bảo luôn sử dụng phiên bản mới nhất của hàm

  // Thêm hàm xử lý click vào image overlay
  const handleImageOverlayClick = (overlay) => {
    setEditingImageOverlay(overlay);
    setShowImageOverlayControls(true);
  };

  // Thêm hàm cập nhật image overlay
  const handleUpdateImageOverlay = (updates) => {
    console.log('[TimelineUI] Updating image overlay:', { editingImageOverlay, updates });
    
    // Nếu scale thay đổi, cần tính lại scaleInfo
    let updatedOverlay = { ...editingImageOverlay, ...updates };
    
    if (updates.scale !== undefined && updates.scale !== editingImageOverlay.scale) {
      console.log('[TimelineUI] Scale changed, recalculating scaleInfo');
      
      // Lấy kích thước preview của scene
      let scenePreview;
      if (previewRef.current) {
        const previewRect = previewRef.current.getBoundingClientRect();
        scenePreview = {
          width: previewRect.width,
          height: previewRect.height
        };
      } else {
        // Nếu previewRef chưa sẵn sàng, sử dụng kích thước từ videoSettings
        const [outputWidth, outputHeight] = videoSettings.resolution.split('x').map(Number);
        scenePreview = {
          width: outputWidth,
          height: outputHeight
        };
      }
      
      // Tạo object image từ originalDimensions
      const overlayImage = {
        width: editingImageOverlay.originalDimensions.width,
        height: editingImageOverlay.originalDimensions.height
      };
      
      // Tính lại scaleInfo với user scale mới
      const newScaleInfo = calculateOverlayScale(overlayImage, scenePreview, updates.scale);
      
      updatedOverlay = {
        ...updatedOverlay,
        scaleInfo: newScaleInfo
      };
      
      console.log('[TimelineUI] Updated scaleInfo:', newScaleInfo);
    }
    
    setSceneElements(prev => ({
      ...prev,
      [selectedScene]: {
        ...prev[selectedScene],
        imageOverlays: prev[selectedScene].imageOverlays.map(el =>
          el.id === editingImageOverlay.id
            ? updatedOverlay
            : el
        )
      }
    }));
    setEditingImageOverlay(updatedOverlay);
    
    console.log('[TimelineUI] Updated imageOverlays for scene', selectedScene);
  };

  // Transition Selector Component
  const TransitionSelector = ({ fromScene, toScene, transition, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const availableTransitions = [
      { value: 'none', label: 'None', icon: '—', description: 'No transition effect' },
      { value: 'fade', label: 'Fade', icon: '✨', description: 'Fade from this scene to another' },
      { value: 'slide', label: 'Slide', icon: '➡️', description: 'Slide from left to right' },
      { value: 'zoom', label: 'Zoom', icon: '🔍', description: 'Zoom in/out when transitioning' },
      { value: 'blur', label: 'Blur', icon: '🌫️', description: 'Blur transition' },
      { value: 'wipe', label: 'Wipe', icon: '🧹', description: 'Wipe from right to left' },
      { value: 'dissolve', label: 'Dissolve', icon: '💫', description: 'Dissolve transition' },
      { value: 'smoothleft', label: 'Smooth Left', icon: '⬅️', description: 'Smooth slide to left' },
      { value: 'smoothright', label: 'Smooth Right', icon: '➡️', description: 'Smooth slide to right' },
      { value: 'smoothup', label: 'Smooth Up', icon: '⬆️', description: 'Smooth slide up' },
      { value: 'smoothdown', label: 'Smooth Down', icon: '⬇️', description: 'Smooth slide down' }
    ];

    const currentTransition = availableTransitions.find(t => t.value === transition.type);

    return (
      <div className="flex items-center justify-center py-3">
        <div className="bg-gray-800/70 rounded-lg border border-gray-600 p-3 w-full max-w-md transition-all duration-300 hover:border-gray-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-medium">Scene {fromScene} → {toScene}</span>
              <span className={`px-2 py-1 text-xs rounded transition-colors ${
                transition.type === 'none' 
                  ? 'bg-gray-600 text-gray-300' 
                  : 'bg-blue-600 text-white'
              }`}>
                {currentTransition?.icon} {currentTransition?.label}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="space-y-3 pt-2 border-t border-gray-600">
              {/* Transition Type */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium">Transition type</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTransitions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => onUpdate({ type: option.value })}
                      className={`p-2 rounded text-xs transition-all duration-200 hover:scale-105 ${
                        transition.type === option.value
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      title={option.description}
                    >
                      <div className="text-lg mb-1">{option.icon}</div>
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              {transition.type !== 'none' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-medium">
                    Duration ({transition.duration}s)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={transition.duration}
                      onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[2rem] text-center font-medium">
                      {transition.duration}
                    </span>
                  </div>
                </div>
              )}

              {/* Preview Info */}
              {transition.type !== 'none' && (
                <div className="bg-gray-900/50 p-3 rounded text-xs text-gray-300 border border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-400">ℹ️</span>
                    <span className="font-medium text-gray-200">Transition information</span>
                  </div>
                  <p>• Transition will occur at the end of Scene {fromScene}</p>
                  <p>• Transition time: {transition.duration} seconds</p>
                  <p>• Effect: {currentTransition?.label}</p>
                  <p>• Description: {currentTransition?.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 timeline-component">
       {/* Video Settings - Tối ưu hóa giao diện */}
       <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white">Video Settings</h4>
            </div>
            
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Resolution */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">
                Resolution
              </label>
              <select
                value={videoSettings.resolution}
                onChange={(e) => setVideoSettings(prev => ({
                  ...prev,
                  resolution: e.target.value
                }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
              >
                <option value="1920x1080">1080p (Full HD)</option>
                <option value="1280x720">720p (HD)</option>
                <option value="854x480">480p (SD)</option>
              </select>
            </div>

            {/* FPS */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">
                Frame Rate
              </label>
              <select
                value={videoSettings.fps}
                onChange={(e) => setVideoSettings(prev => ({
                  ...prev,
                  fps: Number(e.target.value)
                }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
              >
                <option value="24">24 FPS</option>
                <option value="30">30 FPS</option>
                <option value="60">60 FPS</option>
              </select>
            </div>

            {/* Preset */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">
                Encoding Speed
              </label>
              <select
                value={videoSettings.preset}
                onChange={(e) => setVideoSettings(prev => ({
                  ...prev,
                  preset: e.target.value
                }))}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
              >
                <option value="ultrafast">Fast (Lower Quality)</option>
                <option value="medium">Balanced</option>
                <option value="veryslow">Slow (Higher Quality)</option>
              </select>
            </div>

            {/* CRF */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-400">
                Quality ({videoSettings.crf}))
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="51"
                  value={videoSettings.crf}
                  onChange={(e) => setVideoSettings(prev => ({
                    ...prev,
                    crf: Number(e.target.value)
                  }))}
                  className="flex-1 h-2 bg-slate-600/50 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-slate-300 min-w-[2rem] text-center font-mono bg-slate-700/50 px-2 py-1 rounded">
                  {videoSettings.crf}
                </span>
              </div>
            </div>
          </div>

          {/* Text Overlay Settings - Moved from advanced tab */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={videoSettings.textOverlay}
                      onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                        textOverlay: e.target.checked
                      }))}
                        className="form-checkbox w-4 h-4"
                    />
                      <span className="text-sm text-white font-medium">Text overlay</span>
                  </div>
                  </div>
                  
                  {videoSettings.textOverlay && (
                    <div className="space-y-3">
                      {/* Vị trí và màu sắc cơ bản */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Vị trí</label>
                      <select
                        value={videoSettings.textPosition}
                        onChange={(e) => setVideoSettings(prev => ({
                          ...prev,
                          textPosition: e.target.value
                        }))}
                            className="w-full bg-gray-700 text-white rounded p-1.5 text-xs border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                        <option value="bottom">Bottom</option>
                      </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Màu chữ</label>
                      <input
                        type="color"
                        value={videoSettings.textColor}
                        onChange={(e) => setVideoSettings(prev => ({
                          ...prev,
                          textColor: e.target.value
                        }))}
                            className="w-full h-8 rounded cursor-pointer border border-gray-600"
                          />
                        </div>
                      </div>

                      {/* Kích thước */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Kích thước ({videoSettings.textSize}px)</label>
                        <input
                          type="range"
                          min="12"
                          max="48"
                          value={videoSettings.textSize}
                          onChange={(e) => setVideoSettings(prev => ({
                            ...prev,
                            textSize: Number(e.target.value)
                          }))}
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
                            onChange={(e) => setVideoSettings(prev => ({
                              ...prev,
                              textBackground: e.target.checked
                            }))}
                            className="form-checkbox w-3 h-3"
                          />
                        </div>
                        {videoSettings.textBackground && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Màu</label>
                              <input
                                type="color"
                                value={videoSettings.textBackgroundColor}
                                onChange={(e) => setVideoSettings(prev => ({
                                  ...prev,
                                  textBackgroundColor: e.target.value
                                }))}
                                className="w-full h-6 rounded cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Độ trong suốt</label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoSettings.textBackgroundOpacity}
                                onChange={(e) => setVideoSettings(prev => ({
                                  ...prev,
                                  textBackgroundOpacity: Number(e.target.value)
                                }))}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-400">{videoSettings.textBackgroundOpacity}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Outline cho text */}
                      <div className="border-t border-gray-600 pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-gray-400">Viền text</label>
                          <input
                            type="checkbox"
                            checked={videoSettings.textOutline}
                            onChange={(e) => setVideoSettings(prev => ({
                              ...prev,
                              textOutline: e.target.checked
                            }))}
                            className="form-checkbox w-3 h-3"
                          />
                        </div>
                        {videoSettings.textOutline && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Màu viền</label>
                              <input
                                type="color"
                                value={videoSettings.textOutlineColor}
                                onChange={(e) => setVideoSettings(prev => ({
                                  ...prev,
                                  textOutlineColor: e.target.value
                                }))}
                                className="w-full h-6 rounded cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Độ dày</label>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={videoSettings.textOutlineWidth}
                                onChange={(e) => setVideoSettings(prev => ({
                                  ...prev,
                                  textOutlineWidth: Number(e.target.value)
                                }))}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-400">{videoSettings.textOutlineWidth}px</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Shadow cho text */}
                      <div className="border-t border-gray-600 pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-gray-400">Đổ bóng</label>
                          <input
                            type="checkbox"
                            checked={videoSettings.textShadow}
                            onChange={(e) => setVideoSettings(prev => ({
                              ...prev,
                              textShadow: e.target.checked
                            }))}
                            className="form-checkbox w-3 h-3"
                          />
                        </div>
                        {videoSettings.textShadow && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Màu bóng</label>
                                <input
                                  type="color"
                                  value={videoSettings.textShadowColor}
                                  onChange={(e) => setVideoSettings(prev => ({
                                    ...prev,
                                    textShadowColor: e.target.value
                                  }))}
                                  className="w-full h-6 rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Độ trong suốt</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={videoSettings.textShadowOpacity}
                                  onChange={(e) => setVideoSettings(prev => ({
                                    ...prev,
                                    textShadowOpacity: Number(e.target.value)
                                  }))}
                                  className="w-full"
                                />
                                <span className="text-xs text-gray-400">{videoSettings.textShadowOpacity}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Vị trí X</label>
                                <input
                                  type="range"
                                  min="-5"
                                  max="5"
                                  value={videoSettings.textShadowX}
                                  onChange={(e) => setVideoSettings(prev => ({
                                    ...prev,
                                    textShadowX: Number(e.target.value)
                                  }))}
                                  className="w-full"
                                />
                                <span className="text-xs text-gray-400">{videoSettings.textShadowX}px</span>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Vị trí Y</label>
                                <input
                                  type="range"
                                  min="-5"
                                  max="5"
                                  value={videoSettings.textShadowY}
                                  onChange={(e) => setVideoSettings(prev => ({
                                    ...prev,
                                    textShadowY: Number(e.target.value)
                                  }))}
                                  className="w-full"
                                />
                                <span className="text-xs text-gray-400">{videoSettings.textShadowY}px</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

          {/* Effects Settings - Moved from advanced tab */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <button
              onClick={() => setVideoSettings(prev => ({
                ...prev,
                showEffects: !prev.showEffects
              }))}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎬</span>
                <span className="text-sm text-white font-medium">Video Effects</span>
        </div> 
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${videoSettings.showEffects ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {videoSettings.showEffects && (
              <div className="space-y-3 mt-3 pt-3 border-t border-gray-600">
                {/* Individual Scene Transitions - Đã di chuyển vào giữa các scene */}
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-blue-400 text-lg mb-2">🎬</div>
                  <h4 className="text-sm text-white font-medium mb-2">Individual Scene Transitions</h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Transitions have been moved between scenes for easier use.
                  </p>
                  <div className="bg-gray-900/50 p-3 rounded text-xs text-gray-300">
                    <p>• Click the ▶ arrow between scenes to open transition settings</p>
                    <p>• Select transition type and duration for each scene pair</p>
                    <p>• Each scene pair can have a different transition</p>
        </div>
      </div>

                {/* Video Effects */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <h4 className="text-sm text-white font-medium mb-3">🎥 Video Effects</h4>
                  <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                        checked={videoSettings.zoomEffect}
                        onChange={(e) => setVideoSettings(prev => ({
                      ...prev, 
                          zoomEffect: e.target.checked
                    }))}
                        className="form-checkbox w-3 h-3"
                  />
                      <label className="text-xs text-gray-300">Zoom effect</label>
                </div>
                    
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Fade In ({videoSettings.fadeIn}s)</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={videoSettings.fadeIn}
                        onChange={(e) => setVideoSettings(prev => ({
                          ...prev, 
                          fadeIn: Number(e.target.value)
                        }))}
                        className="w-full"
                      />
              </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Fade Out ({videoSettings.fadeOut}s)</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={videoSettings.fadeOut}
                        onChange={(e) => setVideoSettings(prev => ({
                          ...prev, 
                          fadeOut: Number(e.target.value)
                        }))}
                        className="w-full"
                      />
              </div>

                      <div>
                      <label className="block text-xs text-gray-400 mb-1">Blur ({videoSettings.blur})</label>
                        <input
                          type="range"
                          min="0"
                        max="10"
                          step="0.1"
                        value={videoSettings.blur}
                        onChange={(e) => setVideoSettings(prev => ({
                            ...prev, 
                          blur: Number(e.target.value)
                          }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    </div>
                  </div>
                )}
              </div>

          {/* Color Settings - Moved from advanced tab */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <button
              onClick={() => setVideoSettings(prev => ({
                ...prev,
                showColor: !prev.showColor
              }))}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎨</span>
                <span className="text-sm text-white font-medium">Color Adjustments</span>
            </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${videoSettings.showColor ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {videoSettings.showColor && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-600">
              <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Brightness ({videoSettings.brightness})
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.1"
                      value={videoSettings.brightness}
                      onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                        brightness: Number(e.target.value)
                      }))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[2rem] text-center">
                      {videoSettings.brightness}
                    </span>
                  </div>
                  </div>
                  
                  <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Contrast ({videoSettings.contrast})
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={videoSettings.contrast}
                      onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                        contrast: Number(e.target.value)
                      }))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[2rem] text-center">
                      {videoSettings.contrast}
                    </span>
                  </div>
                  </div>
                  
                    <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Saturation ({videoSettings.saturation})
                  </label>
                  <div className="flex items-center space-x-2">
                      <input
                      type="range"
                        min="0"
                      max="2"
                        step="0.1"
                      value={videoSettings.saturation}
                      onChange={(e) => setVideoSettings(prev => ({
                          ...prev,
                        saturation: Number(e.target.value)
                        }))}
                      className="flex-1"
                      />
                    <span className="text-xs text-gray-300 min-w-[2rem] text-center">
                      {videoSettings.saturation}
                    </span>
                    </div>
                </div>

                    <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Hue ({videoSettings.hue})
                  </label>
                  <div className="flex items-center space-x-2">
                      <input
                      type="range"
                      min="-180"
                      max="180"
                      value={videoSettings.hue}
                      onChange={(e) => setVideoSettings(prev => ({
                          ...prev,
                        hue: Number(e.target.value)
                      }))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-300 min-w-[3rem] text-center">
                      {videoSettings.hue}°
                    </span>
            </div>
          </div>
        </div>
      )}
              </div>
              
          {/* Overlay Tab */}
          {videoSettings.activeTab === 'overlay' && (
            <div className="space-y-3">
              {/* Text Overlay - Removed, moved to main video settings */}
              
              </div>
          )}
                </div>
                </div>

        {/* Timeline and Scene Controls */}
        <div className="space-y-6">
        {/* Export button 
        <div className="flex justify-end mb-3">
              <button
            onClick={generateAndExportScript}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
          >
            <span>📄</span>
            <span>Xuất Script FFmpeg</span>
              </button>
            </div>
        */}
     
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scene List */}
        <div className="space-y-3">
          <h3 className="text-white font-medium mb-3 text-sm"> Scene</h3>
          <SceneList />
          </div>

        {/* Scene Editor */}
        <div className="space-y-3">
          <h3 className="text-white font-medium mb-3 text-sm">✏️ Scene Editor</h3>
          {selectedScene ? (
            <SceneEditor />
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm bg-gray-800/30 rounded-lg">
            <span>Choose a scene to edit</span>
        </div>
      )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
});

export default TimelineUI;