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




const TimelineUI = React.forwardRef(({ content = [], onExportScript, ffmpeg }, ref) => {
  // Add a function to generate script that can be called from a button click in VideoGenerator
  const generateScriptForVideo = async () => {
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
      console.log('Đang tạo script với FFmpeg:', !!ffmpeg);
      // Truyền ffmpeg vào hàm generateScript nếu có
      const script = await generateScript(content, videoSettings, sceneElements, ffmpeg);
      
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

  // Danh sách sticker đơn giản
  const availableStickers = [
    { type: 'emoji', content: '😊', name: 'Smile' },
    { type: 'emoji', content: '❤️', name: 'Heart' },
    { type: 'emoji', content: '👍', name: 'Thumbs Up' },
    { type: 'emoji', content: '🎉', name: 'Party' },
    { type: 'emoji', content: '⭐', name: 'Star' },
    { type: 'emoji', content: '🔥', name: 'Fire' },
    { type: 'emoji', content: '💯', name: '100' },
    { type: 'emoji', content: '👏', name: 'Clap' },
    { type: 'emoji', content: '🙌', name: 'Raise Hands' },
    { type: 'emoji', content: '✨', name: 'Sparkles' }
  ];

  // Thêm state cho các tùy chỉnh video
  const [videoSettings, setVideoSettings] = useState({
    resolution: '854x480',
    fps: 24,
    preset: 'medium',
    crf: 23,
    fadeIn: 0.5,
    fadeOut: 0.5,
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
    watermark: false,
    watermarkPosition: 'bottom-right',
    watermarkOpacity: 0.5
  });

  // Khởi tạo scene elements
  useEffect(() => {
    const initialElements = {};
    content.forEach((scene) => {
      initialElements[scene.scene_number] = {
        stickers: [],
        labels: [],
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
        }
      };
    });
    setSceneElements(initialElements);
  }, [content]);

  // Scene List Component
  const SceneList = () => (
    <div className="space-y-4">
      {content.map((scene, index) => (
        <div 
          key={index} 
          className={`bg-gray-900/50 p-4 rounded-lg cursor-pointer transition-colors ${
            selectedScene === scene.scene_number ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setSelectedScene(scene.scene_number)}
        >
          <div className="flex items-start space-x-4">
            {/* Scene Number */}
            <div className="w-16 flex-shrink-0">
              <span className="text-white font-medium">Scene {scene.scene_number}</span>
            </div>

            {/* Scene Preview */}
            <div className="flex-1">
              <div className="relative h-32 w-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                {scene.image && scene.image.url && (
                  <img
                    src={scene.image.url}
                    alt={`Scene ${scene.scene_number}`}
                    className="w-full h-full object-contain"
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                  />
                )}
              </div>
              <div className="mt-2 text-sm text-gray-400 whitespace-normal break-words">
                {scene.voice_over}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Draggable Element Component
  const DraggableElement = ({ id, type, children, position, style: elementStyle }) => {
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
      zIndex: 1000
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
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {type === 'label' && (
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
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

      const currentElement = elements[type === 'sticker' ? 'stickers' : 'labels']
        .find(el => el.id === parseInt(id));

      if (!currentElement) return;

      const percentX = Math.max(0, Math.min(100, 
        currentElement.position.x + (delta.x / previewRect.width) * 100
      ));
      const percentY = Math.max(0, Math.min(100, 
        currentElement.position.y + (delta.y / previewRect.height) * 100
      ));

      setSceneElements(prev => ({
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          [type === 'sticker' ? 'stickers' : 'labels']: prev[selectedScene][type === 'sticker' ? 'stickers' : 'labels']
            .map(el => el.id === parseInt(id)
              ? { ...el, position: { x: percentX, y: percentY } }
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
                {elements.stickers.map(sticker => (
                  <DraggableElement
                    key={sticker.id}
                    id={sticker.id}
                    type="sticker"
                    position={sticker.position}
                    style={{
                      fontSize: '2rem',
                      transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`
                    }}
                  >
                    {sticker.content}
                  </DraggableElement>
                ))}
                {/* Labels */}
                {elements.labels.map(label => (
                  <DraggableElement
                    key={label.id}
                    id={label.id}
                    type="label"
                    position={label.position}
                    style={label.style}
                  >
                    {label.text}
                  </DraggableElement>
                ))}
              </>
            )}
          </div>
        </DndContext>

        {/* Timeline */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center space-x-4 mb-4">
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
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          {/* Audio Controls */}
          <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
            <h3 className="text-white font-medium">Âm thanh và Thời lượng</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Thời lượng scene (s)</label>
              <input
                type="number"
                min="1"
                max="60"
                step="0.5"
                value={elements.duration || 5}
                onChange={(e) => setSceneElements(prev => ({
                  ...prev,
                  [selectedScene]: {
                    ...prev[selectedScene],
                    duration: parseFloat(e.target.value)
                  }
                }))}
                className="w-full bg-gray-700 text-white rounded p-1"
              />
              <small className="text-xs text-gray-500 mt-1 block">
                Khi tạo video, thời lượng sẽ được tính từ audio nếu có. Giá trị này sẽ được sử dụng nếu không có audio.
              </small>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-2">Âm lượng</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={elements.audio.volume}
                onChange={(e) => setSceneElements(prev => ({
                  ...prev,
                  [selectedScene]: {
                    ...prev[selectedScene],
                    audio: { ...prev[selectedScene].audio, volume: parseFloat(e.target.value) }
                  }
                }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Fade In (s)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={elements.audio.fadeIn}
                onChange={(e) => setSceneElements(prev => ({
                  ...prev,
                  [selectedScene]: {
                    ...prev[selectedScene],
                    audio: { ...prev[selectedScene].audio, fadeIn: parseFloat(e.target.value) }
                  }
                }))}
                className="w-full bg-gray-700 text-white rounded p-1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Fade Out (s)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={elements.audio.fadeOut}
                onChange={(e) => setSceneElements(prev => ({
                  ...prev,
                  [selectedScene]: {
                    ...prev[selectedScene],
                    audio: { ...prev[selectedScene].audio, fadeOut: parseFloat(e.target.value) }
                  }
                }))}
                className="w-full bg-gray-700 text-white rounded p-1"
              />
            </div>
          </div>

          {/* Image Controls */}
          <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
            <h3 className="text-white font-medium">Hình ảnh</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Scale</label>
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
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Rotation</label>
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
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Brightness</label>
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
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Contrast</label>
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
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Saturation</label>
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
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Add Elements */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowStickerModal(true)}
            className="p-4 bg-gray-800/50 text-white rounded-lg hover:bg-gray-700"
          >
            😊 Thêm Sticker
          </button>
          <button
            onClick={() => setShowTextModal(true)}
            className="p-4 bg-gray-800/50 text-white rounded-lg hover:bg-gray-700"
          >
            📝 Thêm Text
          </button>
        </div>

        {/* Audio Element */}
        {scene?.voice?.audio_base64 && (
          <audio
            ref={el => audioRefs.current[`voice_${selectedScene}`] = el}
            src={`data:audio/mp3;base64,${scene.voice.audio_base64}`}
            className="hidden"
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            onEnded={() => setIsPlaying(false)}
          />
        )}
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
      console.log('Đang tạo script với FFmpeg:', !!ffmpeg);
      // Truyền ffmpeg vào hàm generateScript nếu có
      const script = await generateScript(content, videoSettings, sceneElements, ffmpeg);
      
      // Gọi callback để đưa script về parent component mà không tải JSON về
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
                  }
                }
              : label
          )
        }
      }));
      setEditingTextId(null);
    } else {
      // Ensure the end time doesn't exceed scene duration
      const endTime = Math.min(textStyle.endTime, sceneDuration);
      
      const newLabel = {
        id: Date.now(),
        text: textInput,
        position: { x: 50, y: 50 },
        style: textStyle,
        timing: {
          start: textStyle.startTime,
          end: endTime
        }
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
    
    // Ensure the end time doesn't exceed scene duration
    const endTime = Math.min(stickerSettings.endTime, sceneDuration);
    
    const newSticker = {
      id: Date.now(),
      type: sticker.type,
      content: sticker.content,
      position: { x: 50, y: 50 },
      scale: 1,
      rotation: 0,
      timing: {
        start: stickerSettings.startTime,
        end: endTime
      }
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

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg space-y-4 timeline-component">
       {/* Video Settings */}
       <div className="bg-gray-800/50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-white mb-4">Cài đặt video</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Độ phân giải
            </label>
            <select
              value={videoSettings.resolution}
              onChange={(e) => setVideoSettings(prev => ({
                ...prev,
                resolution: e.target.value
              }))}
              className="w-full bg-gray-700 text-white rounded-lg p-2"
            >
              <option value="1920x1080">1920x1080 (Full HD)</option>
              <option value="1280x720">1280x720 (HD)</option>
              <option value="854x480">854x480 (480p)</option>
            </select>
          </div>

          {/* FPS */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              FPS
            </label>
            <select
              value={videoSettings.fps}
              onChange={(e) => setVideoSettings(prev => ({
                ...prev,
                fps: Number(e.target.value)
              }))}
              className="w-full bg-gray-700 text-white rounded-lg p-2"
            >
              <option value="24">24 FPS</option>
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
            </select>
          </div>

          {/* Preset */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Preset
            </label>
            <select
              value={videoSettings.preset}
              onChange={(e) => setVideoSettings(prev => ({
                ...prev,
                preset: e.target.value
              }))}
              className="w-full bg-gray-700 text-white rounded-lg p-2"
            >
              <option value="ultrafast">Ultrafast (Nhanh nhất)</option>
              <option value="superfast">Superfast</option>
              <option value="veryfast">Veryfast</option>
              <option value="faster">Faster</option>
              <option value="fast">Fast</option>
              <option value="medium">Medium (Cân bằng)</option>
              <option value="slow">Slow</option>
              <option value="slower">Slower</option>
              <option value="veryslow">Veryslow (Chất lượng cao nhất)</option>
            </select>
          </div>

          {/* CRF */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              CRF (0-51, càng thấp chất lượng càng cao)
            </label>
            <input
              type="range"
              min="0"
              max="51"
              value={videoSettings.crf}
              onChange={(e) => setVideoSettings(prev => ({
                ...prev,
                crf: Number(e.target.value)
              }))}
              className="w-full"
            />
            <span className="text-white">{videoSettings.crf}</span>
          </div>

          {/* Effects */}
          <div className="col-span-2">
            <h5 className="text-white font-medium mb-2">Hiệu ứng</h5>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={videoSettings.zoomEffect}
                  onChange={(e) => setVideoSettings(prev => ({
                    ...prev,
                    zoomEffect: e.target.checked
                  }))}
                  className="form-checkbox"
                />
                <span className="text-white">Hiệu ứng zoom</span>
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Fade In (giây)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={videoSettings.fadeIn}
                    onChange={(e) => setVideoSettings(prev => ({
                      ...prev,
                      fadeIn: Number(e.target.value)
                    }))}
                    className="w-full bg-gray-700 text-white rounded-lg p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Fade Out (giây)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={videoSettings.fadeOut}
                    onChange={(e) => setVideoSettings(prev => ({
                      ...prev,
                      fadeOut: Number(e.target.value)
                    }))}
                    className="w-full bg-gray-700 text-white rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="mt-6">
          <h5 className="text-white font-medium mb-4">Cài đặt nâng cao</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color Adjustments */}
            <div className="space-y-4">
              <h6 className="text-gray-400 font-medium">Điều chỉnh màu sắc</h6>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Độ sáng (-1 đến 1)
                </label>
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
                  className="w-full"
                />
                <span className="text-white">{videoSettings.brightness}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Độ tương phản (0 đến 2)
                </label>
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
                  className="w-full"
                />
                <span className="text-white">{videoSettings.contrast}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Độ bão hòa (0 đến 2)
                </label>
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
                  className="w-full"
                />
                <span className="text-white">{videoSettings.saturation}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Màu sắc (-180 đến 180)
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={videoSettings.hue}
                  onChange={(e) => setVideoSettings(prev => ({
                    ...prev,
                    hue: Number(e.target.value)
                  }))}
                  className="w-full"
                />
                <span className="text-white">{videoSettings.hue}</span>
              </div>
            </div>

            {/* Effects */}
            <div className="space-y-4">
              <h6 className="text-gray-400 font-medium">Hiệu ứng</h6>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Độ mờ (0 đến 10)
                </label>
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
                <span className="text-white">{videoSettings.blur}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Chuyển cảnh
                </label>
                <select
                  value={videoSettings.transition}
                  onChange={(e) => setVideoSettings(prev => ({
                    ...prev,
                    transition: e.target.value
                  }))}
                  className="w-full bg-gray-700 text-white rounded-lg p-2"
                >
                  <option value="none">Không có</option>
                  <option value="fade">Fade</option>
                  <option value="wipe">Wipe</option>
                  <option value="slide">Slide</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Thời gian chuyển cảnh (giây)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={videoSettings.transitionDuration}
                  onChange={(e) => setVideoSettings(prev => ({
                    ...prev,
                    transitionDuration: Number(e.target.value)
                  }))}
                  className="w-full bg-gray-700 text-white rounded-lg p-2"
                />
              </div>
            </div>

            {/* Text Overlay */}
            <div className="space-y-4">
              <h6 className="text-gray-400 font-medium">Text Overlay</h6>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={videoSettings.textOverlay}
                  onChange={(e) => setVideoSettings(prev => ({
                    ...prev,
                    textOverlay: e.target.checked
                  }))}
                  className="form-checkbox"
                />
                <span className="text-white">Hiển thị text</span>
              </label>

              {videoSettings.textOverlay && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Vị trí text
                    </label>
                    <select
                      value={videoSettings.textPosition}
                      onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                        textPosition: e.target.value
                      }))}
                      className="w-full bg-gray-700 text-white rounded-lg p-2"
                    >
                      <option value="top">Trên</option>
                      <option value="center">Giữa</option>
                      <option value="bottom">Dưới</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Màu text
                    </label>
                    <input
                      type="color"
                      value={videoSettings.textColor}
                      onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                        textColor: e.target.value
                      }))}
                      className="w-full h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Kích thước text
                    </label>
                    <input
                      type="number"
                      min="12"
                      max="72"
                      value={videoSettings.textSize}
                      onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                        textSize: Number(e.target.value)
                      }))}
                      className="w-full bg-gray-700 text-white rounded-lg p-2"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Watermark */}
            <div className="space-y-4">
              <h6 className="text-gray-400 font-medium">Watermark</h6>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={videoSettings.watermark}
                  onChange={(e) => setVideoSettings(prev => ({
                    ...prev,
                    watermark: e.target.checked
                  }))}
                  className="form-checkbox"
                />
                <span className="text-white">Hiển thị watermark</span>
              </label>

              {videoSettings.watermark && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Vị trí watermark
                    </label>
                    <select
                      value={videoSettings.watermarkPosition}
                      onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                        watermarkPosition: e.target.value
                      }))}
                      className="w-full bg-gray-700 text-white rounded-lg p-2"
                    >
                      <option value="top-left">Góc trên trái</option>
                      <option value="top-right">Góc trên phải</option>
                      <option value="bottom-left">Góc dưới trái</option>
                      <option value="bottom-right">Góc dưới phải</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Độ trong suốt
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={videoSettings.watermarkOpacity}
                      onChange={(e) => setVideoSettings(prev => ({
                        ...prev,
                        watermarkOpacity: Number(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <span className="text-white">{videoSettings.watermarkOpacity}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Comment out the export button as it's no longer needed
      <div className="flex justify-end mb-4">
        <button
          onClick={exportFFmpegScript}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Xuất Script FFmpeg
        </button>
      </div>
      */}
      <div className="grid grid-cols-2 gap-8">
        {/* Scene List */}
        <div className="space-y-4">
          <h3 className="text-white font-medium mb-4">Danh sách Scene</h3>
          <SceneList />
        </div>

        {/* Scene Editor */}
        <div className="space-y-4">
          <h3 className="text-white font-medium mb-4">Chỉnh sửa Scene</h3>
          {selectedScene ? (
            <SceneEditor />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Chọn một scene để chỉnh sửa
            </div>
          )}
        </div>
      </div>

      {/* Sticker Modal */}
      {showStickerModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div 
            className="bg-gray-800 p-6 rounded-lg w-96"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h3 className="text-white text-lg font-medium mb-4">Chọn Sticker</h3>
            <div className="grid grid-cols-5 gap-4">
              {availableStickers.map((sticker, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddSticker(sticker);
                  }}
                  className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 text-2xl"
                >
                  {sticker.content}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Thời gian bắt đầu (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={audioRefs.current[`voice_${selectedScene}`]?.duration || 5}
                    step="0.1"
                    value={stickerSettings.startTime}
                    onChange={(e) => setStickerSettings(prev => ({ ...prev, startTime: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 text-white rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Thời gian kết thúc (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={audioRefs.current[`voice_${selectedScene}`]?.duration || 5}
                    step="0.1"
                    value={stickerSettings.endTime}
                    onChange={(e) => setStickerSettings(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 text-white rounded p-2"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowStickerModal(false);
              }}
              className="mt-4 w-full p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Text Modal */}
      {showTextModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div 
            className="bg-gray-800 p-6 rounded-lg w-96"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <h3 className="text-white text-lg font-medium mb-4">
              {editingTextId ? 'Chỉnh sửa Text' : 'Thêm Text'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nội dung</label>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded p-2"
                  placeholder="Nhập nội dung..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Màu sắc</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={textStyle.color}
                    onChange={(e) => {
                      e.stopPropagation();
                      setTextStyle(prev => ({ ...prev, color: e.target.value }));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-12 h-12 p-1 bg-gray-700 rounded cursor-pointer"
                  />
                  <span className="text-white">{textStyle.color}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Kích thước</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={textStyle.fontSize}
                  onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-white">{textStyle.fontSize}px</span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Font chữ</label>
                <select
                  value={textStyle.fontFamily}
                  onChange={(e) => setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded p-2"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Thời gian bắt đầu (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={audioRefs.current[`voice_${selectedScene}`]?.duration || 5}
                    step="0.1"
                    value={textStyle.startTime}
                    onChange={(e) => setTextStyle(prev => ({ ...prev, startTime: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 text-white rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Thời gian kết thúc (s)</label>
                  <input
                    type="number"
                    min="0"
                    max={audioRefs.current[`voice_${selectedScene}`]?.duration || 5}
                    step="0.1"
                    value={textStyle.endTime}
                    onChange={(e) => setTextStyle(prev => ({ ...prev, endTime: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 text-white rounded p-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleAddText}
                className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingTextId ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTextModal(false);
                  setEditingTextId(null);
                  setTextInput('');
                }}
                className="flex-1 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TimelineUI;