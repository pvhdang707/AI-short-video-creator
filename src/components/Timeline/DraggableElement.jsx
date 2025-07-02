import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { fontList } from "../../utils/fontList";

const loadedFonts = new Set();
function injectFont(fontName, fontFile) {
  if (loadedFonts.has(fontName)) return;
  const fontUrl = `/fonts/${fontFile}`;
  const style = document.createElement('style');
  style.innerHTML = `
    @font-face {
      font-family: '${fontName}';
      src: url('${fontUrl}');
    }
  `;
  document.head.appendChild(style);
  loadedFonts.add(fontName);
}

const DraggableElement = ({
  id,
  type,
  children,
  position,
  style: elementStyle,
  zIndex = 0,
  setSceneElements,
  selectedScene,
  sceneElements,
  setShowTextModal,
  setEditingTextId,
  setTextInput,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${type}-${id}`,
    data: { type, id },
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    setSceneElements((prev) => ({
      ...prev,
      [selectedScene]: {
        ...prev[selectedScene],
        [type === "sticker" ? "stickers" : "labels"]: prev[selectedScene][
          type === "sticker" ? "stickers" : "labels"
        ].filter((el) => el.id !== id),
      },
    }));
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (type === "label") {
      const label = sceneElements[selectedScene].labels.find(
        (el) => el.id === id
      );
      setTextInput(label.text);
      setEditingTextId(id);
      setShowTextModal(true);
    }
  };

  const style = {
    ...elementStyle,
    transform: CSS.Translate.toString(
      transform ? { x: transform.x, y: transform.y } : { x: 0, y: 0 }
    ),
    position: "absolute",
    left: `${position.x}%`,
    top: `${position.y}%`,
    cursor: "move",
    zIndex: 1000 + (zIndex || 0),
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div className="relative group">
        {type === "label" ? (() => {
          const fontObj = fontList.find(f => f.file === elementStyle.fontFamily);
          const fontName = fontObj ? fontObj.name : "Arial";
          if (fontObj) injectFont(fontName, fontObj.file);
          return (
            <div
              style={{
                color: elementStyle.color,
                fontSize: `${elementStyle.fontSize}px`,
                fontFamily: `'${fontName}', Arial, sans-serif`,
                textAlign: elementStyle.textAlign || "center",
                textShadow: elementStyle.shadow
                  ? `${elementStyle.shadowX || 2}px ${elementStyle.shadowY || 2}px ${elementStyle.shadowOpacity || 0.4} ${elementStyle.shadowColor || "#000000"}`
                  : "none",
                backgroundColor: elementStyle.background
                  ? `${elementStyle.backgroundColor || "#000000"}`
                  : "transparent",
                opacity: elementStyle.background
                  ? elementStyle.backgroundOpacity || 0.5
                  : 1,
                borderRadius: elementStyle.background ? "4px" : "0",
                padding: elementStyle.background ? "8px 12px" : "0",
                border: elementStyle.outline
                  ? `${elementStyle.outlineWidth || 2}px solid ${elementStyle.outlineColor || "#000000"}`
                  : "none",
                WebkitTextStroke: elementStyle.outline
                  ? `${elementStyle.outlineWidth || 2}px ${elementStyle.outlineColor || "#000000"}`
                  : "none",
                filter: elementStyle.outline
                  ? `drop-shadow(0 0 ${elementStyle.outlineWidth || 2}px ${elementStyle.outlineColor || "#000000"})`
                  : "none",
              }}
            >
              {children}
            </div>
          );
        })() : children}
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
              {type === "label" && (
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

export default DraggableElement; 