import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { generateScript } from "../../../utils/scriptGenerator.js";
import ZIndexManager from "../../../components/ZIndexFix.jsx";
import { fontList, visibleFontList } from "../../../utils/fontList.js";
import ModalPortal from "../../../components/ModalPortal.jsx";
import SceneList from "../../../components/Timeline/SceneList.jsx";
import SceneEditor from "../../../components/Timeline/SceneEditor.jsx";
import TextModal from "../../../components/Timeline/TextModal.jsx";
import ImageModal from "../../../components/Timeline/ImageModal.jsx";
import ImageOverlayControlsModal from "../../../components/Timeline/ImageOverlayControlsModal.jsx";
import VideoSettingsPanel from "../../../components/Timeline/VideoSettingsPanel.jsx";
import CustomSlider from "../../../components/Timeline/CustomSlider.jsx";

// Đặt hàm injectFont ở đầu file, trước khi khai báo component
const loadedFonts = new Set();
function injectFont(fontName, fontFile) {
  if (loadedFonts.has(fontName)) return;
  const fontUrl = `/fonts/${fontFile}`;
  const style = document.createElement("style");
  style.innerHTML = `
    @font-face {
      font-family: '${fontName}';
      src: url('${fontUrl}');
    }
  `;
  document.head.appendChild(style);
  loadedFonts.add(fontName);
}

// DraggableImageOverlay Component
const DraggableImageOverlay = ({ overlay, onDelete, onClick }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `imageOverlay-${overlay.id}`,
    data: { type: "imageOverlay", id: overlay.id },
  });

  const style = {
    position: "absolute",
    left: `${overlay.position.x}%`,
    top: `${overlay.position.y}%`,
    transform:
      CSS.Translate.toString(
        transform
          ? {
              x: transform.x,
              y: transform.y,
            }
          : { x: 0, y: 0 }
      ) + ` scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
    opacity: overlay.opacity,
    width: `${overlay.displayDimensions.width}px`,
    height: `${overlay.displayDimensions.height}px`,
    cursor: "move",
    zIndex: 1000 + (overlay.zIndex || 0),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group"
    >
      <div className="relative w-full h-full" onClick={onClick}>
        <img
          src={overlay.source}
          alt="Overlay"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            opacity: overlay.opacity,
          }}
        />
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(overlay.id);
            }}
            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            title="Xóa overlay"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoEditor = React.forwardRef(
  ({ content = [], onExportScript, ffmpeg, scriptId }, ref) => {
    // Debug log để kiểm tra scriptId
    console.log("VideoEditor received scriptId:", scriptId);
    console.log("VideoEditor received content:", content);

    // Add a function to generate script that can be called from a button click in VideoGenerator
    const generateScriptForVideo = async () => {
      if (!videoSettings) {
        console.error("Video settings is undefined");
        return null;
      }

      // Kiểm tra xem content và sceneElements có hợp lệ không
      if (!content || content.length === 0) {
        console.error("Không có nội dung để tạo script");
        return null;
      }

      if (!sceneElements) {
        console.error("Scene elements is undefined");
        return null;
      }

      try {
        console.log("=== SCRIPT GENERATION DEBUG ===");
        console.log("Đang tạo script với FFmpeg:", !!ffmpeg);
        console.log("VideoSettings:", videoSettings);
        console.log(
          "IndividualTransitions:",
          videoSettings.individualTransitions
        );
        console.log(
          "IndividualTransitions length:",
          videoSettings.individualTransitions?.length
        );
        console.log("Content length:", content?.length);

        // Log chi tiết từng individual transition
        if (videoSettings.individualTransitions) {
          console.log("=== INDIVIDUAL TRANSITIONS DETAIL ===");
          videoSettings.individualTransitions.forEach((transition, index) => {
            console.log(`Transition ${index}:`, {
              id: transition.id,
              fromScene: transition.fromScene,
              toScene: transition.toScene,
              type: transition.type,
              duration: transition.duration,
              isActive: transition.type !== "none",
            });
          });
        }

        // Truyền ffmpeg vào hàm generateScript nếu có
        const script = await generateScript(
          content,
          videoSettings,
          sceneElements,
          ffmpeg
        );

        console.log("=== GENERATED SCRIPT DEBUG ===");
        console.log("Script global transitions:", script.global?.transitions);
        console.log(
          "Script individual transitions:",
          script.global?.transitions?.individualTransitions
        );
        console.log("Script scenes count:", script.scenes?.length);

        // Cập nhật scriptId nếu có
        if (scriptId) {
          script.id = scriptId;
          console.log("Đã cập nhật script ID:", scriptId);
          console.log("Script sau khi cập nhật ID:", script);
        } else {
          console.log("Không có scriptId để cập nhật");
        }

        // Gọi callback để đưa script về parent
        if (onExportScript) {
          onExportScript(script);
        }

        return script;
      } catch (error) {
        console.error("Lỗi khi tạo script:", error);
        return null;
      }
    };
    const [selectedScene, setSelectedScene] = useState(null);
    const [sceneElements, setSceneElements] = useState({});
    const audioRefs = useRef({});
    const [showTextModal, setShowTextModal] = useState(false);
    const [editingTextId, setEditingTextId] = useState(null);
    const [textInput, setTextInput] = useState("");
    const [textStyle, setTextStyle] = useState({
      color: "#ffffff",
      fontSize: 24,
      fontFamily: "Arial",
      startTime: 0,
      endTime: 5,
      // Thêm các thuộc tính mặc định cho background
      background: false,
      backgroundColor: null,
      backgroundOpacity: 0,
      // Thêm các thuộc tính mặc định cho outline
      outline: false,
      outlineColor: null,
      outlineWidth: 0,
      // Thêm các thuộc tính mặc định cho shadow
      shadow: false,
      shadowColor: null,
      shadowX: 0,
      shadowY: 0,
      shadowOpacity: 0,
      textAlign: "left",
    });
    const previewRef = useRef(null);

    const [showImageModal, setShowImageModal] = useState(false);
    const [imageOverlaySettings, setImageOverlaySettings] = useState({
      startTime: 0,
      endTime: 5,
      scale: 1,
      rotation: 0,
      opacity: 1,
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingImageOverlay, setEditingImageOverlay] = useState(null);
    const [showImageOverlayControls, setShowImageOverlayControls] =
      useState(false);

    // Thêm state cho các tùy chỉnh video
    const [videoSettings, setVideoSettings] = useState({
      resolution: "854x480",
      fps: 24,
      preset: "medium",
      crf: 23,
      fadeIn: 0,
      fadeOut: 0,
      zoomEffect: false,
      brightness: 0,
      contrast: 1,
      saturation: 1,
      hue: 0,
      blur: 0,
      transition: "none",
      transitionDuration: 1,
      backgroundColor: "black",
      textOverlay: false,
      textPosition: "bottom",
      textColor: "white",
      textSize: 24,
      textBackground: false,
      textBackgroundColor: "#000000",
      textBackgroundOpacity: 0.5,
      textOutline: false,
      textOutlineColor: "#000000",
      textOutlineWidth: 2,
      textShadow: false,
      textShadowColor: "#000000",
      textShadowX: 2,
      textShadowY: 2,
      textShadowOpacity: 0.4,
      watermark: false,
      watermarkPosition: "bottom-right",
      watermarkOpacity: 0.5,
      audioEffects: {
        volume: 1,
        fadeIn: 0,
        fadeOut: 0,
        normalize: false,
        bass: 0,
        treble: 0,
      },
      // Thêm cấu hình transition riêng lẻ cho từng scene
      individualTransitions: [],
      showAdvanced: false,
      activeTab: "effects",
    });

    // Thêm state để quản lý expanded state của từng transition
    const [expandedTransitions, setExpandedTransitions] = useState({});

    // Khởi tạo scene elements
    useEffect(() => {
      const initialElements = {};
      content.forEach((scene) => {
        initialElements[scene.scene_number] = {
          labels: [],
          stickers: [], // Thêm stickers array
          imageOverlays: [], // Thêm imageOverlays array
          effects: [],
          transitions: {
            type: "none",
            duration: 1,
          },
          audio: {
            volume: 1,
            fadeIn: 0,
            fadeOut: 0,
          },
          image: {
            scale: 1,
            position: { x: 0, y: 0 },
            rotation: 0,
            brightness: 0,
            contrast: 1,
            saturation: 1,
          },
          activeTab: "image", // Thêm activeTab mặc định
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
            type: "none",
            duration: 1,
          });
        }
        console.log("Initializing individualTransitions:", transitions);
        setVideoSettings((prev) => ({
          ...prev,
          individualTransitions: transitions,
        }));
      } else if (content && content.length <= 1) {
        // Reset individualTransitions nếu chỉ có 1 scene hoặc không có scene
        setVideoSettings((prev) => ({
          ...prev,
          individualTransitions: [],
        }));
      }
    }, [content]);

    // Thêm hàm để xuất script
    // Function is now called automatically when needed
    const generateAndExportScript = async () => {
      if (!videoSettings) {
        console.error("Video settings is undefined");
        return null;
      }

      // Kiểm tra xem content và sceneElements có hợp lệ không
      if (!content || content.length === 0) {
        console.error("Không có nội dung để tạo script");
        return null;
      }

      if (!sceneElements) {
        console.error("Scene elements is undefined");
        return null;
      }

      try {
        console.log("=== SCRIPT GENERATION DEBUG ===");
        console.log("Đang tạo script với FFmpeg:", !!ffmpeg);
        console.log("VideoSettings:", videoSettings);
        console.log(
          "IndividualTransitions:",
          videoSettings.individualTransitions
        );
        console.log(
          "IndividualTransitions length:",
          videoSettings.individualTransitions?.length
        );
        console.log("Content length:", content?.length);

        // Log chi tiết từng individual transition
        if (videoSettings.individualTransitions) {
          console.log("=== INDIVIDUAL TRANSITIONS DETAIL ===");
          videoSettings.individualTransitions.forEach((transition, index) => {
            console.log(`Transition ${index}:`, {
              id: transition.id,
              fromScene: transition.fromScene,
              toScene: transition.toScene,
              type: transition.type,
              duration: transition.duration,
              isActive: transition.type !== "none",
            });
          });
        }

        // Truyền ffmpeg vào hàm generateScript nếu có
        const script = await generateScript(
          content,
          videoSettings,
          sceneElements,
          ffmpeg
        );

        console.log("=== GENERATED SCRIPT DEBUG ===");
        console.log("Script global transitions:", script.global?.transitions);
        console.log(
          "Script individual transitions:",
          script.global?.transitions?.individualTransitions
        );
        console.log("Script scenes count:", script.scenes?.length);

        // Cập nhật scriptId nếu có
        if (scriptId) {
          script.id = scriptId;
          console.log("Đã cập nhật script ID:", scriptId);
          console.log("Script sau khi cập nhật ID:", script);
        } else {
          console.log("Không có scriptId để cập nhật");
        }

        // Gọi callback để đưa script về parent
        if (onExportScript) {
          onExportScript(script);
        }

        return script;
      } catch (error) {
        console.error("Lỗi khi tạo script:", error);
        return null;
      }
    };

    // Cập nhật hàm xử lý thêm text
    const handleAddText = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!textInput.trim()) return;

      // Get the current scene's duration
      const scene = content.find((s) => s.scene_number === selectedScene);
      const sceneDuration = scene?.duration || 5;

      // Get preview container dimensions for proper positioning
      const previewContainer = previewRef.current;
      const previewDimensions = previewContainer
        ? {
            width: previewContainer.offsetWidth,
            height: previewContainer.offsetHeight,
          }
        : { width: 854, height: 480 };

      if (editingTextId) {
        // When editing, ensure that the end time doesn't exceed scene duration
        const updatedEndTime = Math.min(textStyle.endTime, sceneDuration);

        setSceneElements((prev) => ({
          ...prev,
          [selectedScene]: {
            ...prev[selectedScene],
            labels: prev[selectedScene].labels.map((label) =>
              label.id === editingTextId
                ? {
                    ...label,
                    text: textInput,
                    style: { ...textStyle },
                    timing: {
                      start: textStyle.startTime,
                      end: updatedEndTime,
                    },
                    previewDimensions,
                  }
                : label
            ),
          },
        }));
        setEditingTextId(null);
      } else {
        // Get highest z-index in current scene
        const existingOverlays = [
          ...(sceneElements[selectedScene]?.labels || []),
          ...(sceneElements[selectedScene]?.imageOverlays || []),
        ];
        const maxZIndex = existingOverlays.reduce(
          (max, overlay) => Math.max(max, overlay.zIndex || 0),
          0
        );

        // Ensure the end time doesn't exceed scene duration
        const endTime = Math.min(textStyle.endTime, sceneDuration);

        const newLabel = {
          id: Date.now(),
          text: textInput,
          position: {
            x: 50, // percentage
            y: 50, // percentage
            unit: "percentage",
          },
          style: textStyle,
          timing: {
            start: textStyle.startTime,
            end: endTime,
          },
          zIndex: maxZIndex + 1,
          previewDimensions,
        };
        setSceneElements((prev) => ({
          ...prev,
          [selectedScene]: {
            ...prev[selectedScene],
            labels: [...prev[selectedScene].labels, newLabel],
          },
        }));
      }

      setTextInput("");
      setShowTextModal(false);
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
              height: img.height,
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    // Thêm hàm tính toán tỷ lệ scale
    const calculateOverlayScale = (overlayImage, scenePreview) => {
      // Lấy kích thước preview của scene
      const previewWidth =
        scenePreview?.width || parseInt(videoSettings.resolution.split("x")[0]);
      const previewHeight =
        scenePreview?.height ||
        parseInt(videoSettings.resolution.split("x")[1]);

      // Lấy kích thước video output thực tế
      const [outputWidth, outputHeight] = videoSettings.resolution
        .split("x")
        .map(Number);

      console.log("=== CALCULATE OVERLAY SCALE DEBUG ===");
      console.log("Overlay image dimensions:", overlayImage);
      console.log("Preview dimensions:", {
        width: previewWidth,
        height: previewHeight,
      });
      console.log("Output dimensions:", {
        width: outputWidth,
        height: outputHeight,
      });

      // Tính tỷ lệ scale của scene preview so với kích thước thực
      // Sử dụng chiều nào bị fit (nhỏ hơn) để tính scale chính xác
      const scaleRatioX = outputWidth / previewWidth;
      const scaleRatioY = outputHeight / previewHeight;

      // Lấy tỷ lệ scale theo chiều nào bị fit (giống logic CSS object-fit: contain)
      const sceneScaleRatio = Math.min(scaleRatioX, scaleRatioY);

      console.log("Scale ratios:", {
        scaleRatioX,
        scaleRatioY,
        sceneScaleRatio,
      });

      // Tính toán kích thước mới cho overlay dựa trên cạnh dài nhất
      const maxDimension = 100; // Kích thước tối đa cho cạnh dài nhất
      const isWidthLonger = overlayImage.width > overlayImage.height;

      let newWidth, newHeight;
      if (isWidthLonger) {
        newWidth = maxDimension;
        newHeight = (overlayImage.height / overlayImage.width) * maxDimension;
      } else {
        newHeight = maxDimension;
        newWidth = (overlayImage.width / overlayImage.height) * maxDimension;
      }

      // Tính toán scale factor để chuyển đổi từ kích thước gốc sang kích thước hiển thị
      const displayScale = Math.min(
        newWidth / overlayImage.width,
        newHeight / overlayImage.height
      );

      // Tính toán scale factor cuối cùng cho FFmpeg
      // Sử dụng sceneScaleRatio để scale từ preview sang video output
      const finalScale = displayScale * sceneScaleRatio;

      console.log("Scale calculations:", {
        displayScale,
        finalScale,
        displayDimensions: { width: newWidth, height: newHeight },
      });

      return {
        displayScale,
        finalScale,
        displayDimensions: {
          width: newWidth,
          height: newHeight,
        },
        // Thêm thông tin để ffmpegUtils sử dụng
        previewDimensions: {
          width: previewWidth,
          height: previewHeight,
        },
        outputDimensions: {
          width: outputWidth,
          height: outputHeight,
        },
        scaleRatio: sceneScaleRatio,
      };
    };

    // Cập nhật hàm handleAddImageOverlay
    const handleAddImageOverlay = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedImage) return;

      // Get the current scene's duration
      const scene = content.find((s) => s.scene_number === selectedScene);
      const sceneDuration = scene?.duration || 5;

      // Ensure the end time doesn't exceed scene duration
      const endTime = Math.min(imageOverlaySettings.endTime, sceneDuration);

      // Lấy kích thước preview của scene
      let scenePreview;
      if (previewRef.current) {
        const previewRect = previewRef.current.getBoundingClientRect();
        scenePreview = {
          width: previewRect.width,
          height: previewRect.height,
        };
      } else {
        // Nếu previewRef chưa sẵn sàng, sử dụng kích thước từ videoSettings
        const [outputWidth, outputHeight] = videoSettings.resolution
          .split("x")
          .map(Number);
        scenePreview = {
          width: outputWidth,
          height: outputHeight,
        };
      }

      // Tính toán tỷ lệ scale
      const scaleInfo = calculateOverlayScale(selectedImage, scenePreview);

      console.log("=== ADD IMAGE OVERLAY DEBUG ===");
      console.log("Selected image:", selectedImage);
      console.log("Scene preview:", scenePreview);
      console.log("Scale info:", scaleInfo);

      const newImageOverlay = {
        id: Date.now(),
        type: "image",
        source: selectedImage.url,
        originalDimensions: {
          width: selectedImage.width,
          height: selectedImage.height,
        },
        displayDimensions: scaleInfo.displayDimensions,
        position: { x: 50, y: 50 }, // Vị trí mặc định ở giữa
        scale: imageOverlaySettings.scale,
        rotation: imageOverlaySettings.rotation,
        opacity: imageOverlaySettings.opacity,
        scaleInfo: {
          displayScale: scaleInfo.displayScale,
          finalScale: scaleInfo.finalScale,
          // Thêm thông tin chi tiết để ffmpegUtils sử dụng
          previewDimensions: scaleInfo.previewDimensions,
          outputDimensions: scaleInfo.outputDimensions,
          scaleRatio: scaleInfo.scaleRatio,
        },
        timing: {
          start: imageOverlaySettings.startTime,
          end: endTime,
        },
      };

      console.log("New image overlay created:", newImageOverlay);

      setSceneElements((prev) => ({
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          imageOverlays: [
            ...(prev[selectedScene].imageOverlays || []),
            newImageOverlay,
          ],
        },
      }));

      setSelectedImage(null);
      setShowImageModal(false);
    };

    // Đưa phương thức generateAndExportScript ra bên ngoài để VideoGenerator có thể gọi
    React.useImperativeHandle(ref, () => ({
      generateAndExportScript,
    }));

    // Thêm phương thức vào DOM element để có thể truy cập từ bên ngoài
    // Điều này là cần thiết vì chúng ta không thể trực tiếp truy cập ref từ code ngoài component
    React.useEffect(() => {
      // Gắn method vào element DOM của component
      const timelineElement = document.querySelector(".timeline-component");
      if (timelineElement) {
        timelineElement.generateAndExportScript = generateAndExportScript;
      }
      return () => {
        // Cleanup khi unmount
        const element = document.querySelector(".timeline-component");
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
      setSceneElements((prev) => ({
        ...prev,
        [selectedScene]: {
          ...prev[selectedScene],
          imageOverlays: prev[selectedScene].imageOverlays.map((el) =>
            el.id === editingImageOverlay.id ? { ...el, ...updates } : el
          ),
        },
      }));
      setEditingImageOverlay((prev) => ({ ...prev, ...updates }));
    };

    return (
      <div
        className="bg-gray-800/50 p-4 rounded-lg space-y-4 timeline-component"
        onClick={(e) => e.stopPropagation()}
      >
        

        {/* Video Settings - Tối ưu hóa giao diện */}
        <VideoSettingsPanel
          videoSettings={videoSettings}
          setVideoSettings={setVideoSettings}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scene List */}
          <div className="space-y-3">
            <h3 className="text-white font-medium mb-3 text-sm">
              📋 Scenes List
            </h3>
            <SceneList
              content={content}
              selectedScene={selectedScene}
              setSelectedScene={setSelectedScene}
              sceneElements={sceneElements}
              videoSettings={videoSettings}
              setVideoSettings={setVideoSettings}
              expandedTransitions={expandedTransitions}
              setExpandedTransitions={setExpandedTransitions}
            />
          </div>

          {/* Scene Editor */}
          <div className="space-y-3">
            <h3 className="text-white font-medium mb-3 text-sm">
              ✏️ Edit Scene
            </h3>
            {selectedScene ? (
              <SceneEditor
                content={content}
                selectedScene={selectedScene}
                sceneElements={sceneElements}
                setSceneElements={setSceneElements}
                previewRef={previewRef}
                showTextModal={showTextModal}
                setShowTextModal={setShowTextModal}
                setShowImageModal={setShowImageModal}
                setEditingTextId={setEditingTextId}
                setTextInput={setTextInput}
                textStyle={textStyle}
                setTextStyle={setTextStyle}
                audioRefs={audioRefs}
                handleImageOverlayClick={handleImageOverlayClick}
              />
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm bg-gray-800/30 rounded-lg">
                Select a scene to edit
              </div>
            )}
          </div>
        </div>

        {/* Text Modal */}
        <TextModal
          show={showTextModal}
          onClose={() => {
            setShowTextModal(false);
            setEditingTextId(null);
            setTextInput("");
          }}
          onSubmit={handleAddText}
          textInput={textInput}
          setTextInput={setTextInput}
          textStyle={textStyle}
          setTextStyle={setTextStyle}
          editingTextId={editingTextId}
          audioRefs={audioRefs}
          selectedScene={selectedScene}
        />

        {/* Image Modal */}
        <ImageModal
          show={showImageModal}
          onClose={() => {
            setShowImageModal(false);
            setSelectedImage(null);
          }}
          onSubmit={handleAddImageOverlay}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          imageOverlaySettings={imageOverlaySettings}
          setImageOverlaySettings={setImageOverlaySettings}
          handleImageUpload={handleImageUpload}
          audioRefs={audioRefs}
          selectedScene={selectedScene}
        />

        {/* Image Overlay Controls Modal */}
        <ImageOverlayControlsModal
          show={showImageOverlayControls && !!editingImageOverlay}
          onClose={() => {
            setShowImageOverlayControls(false);
            setEditingImageOverlay(null);
          }}
          editingImageOverlay={editingImageOverlay}
          handleUpdateImageOverlay={handleUpdateImageOverlay}
          audioRefs={audioRefs}
          selectedScene={selectedScene}
        />
      </div>
    );
  }
);

export default VideoEditor;
