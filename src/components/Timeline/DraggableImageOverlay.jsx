import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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

export default DraggableImageOverlay; 