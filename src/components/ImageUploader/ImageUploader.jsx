import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, preview, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data: {
      type: 'image',
      preview
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-2 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors`}
      {...attributes}
      {...listeners}
    >
      <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      <img
        src={preview.url}
        alt={`Preview ${index + 1}`}
        className="w-32 h-32 object-cover rounded-lg"
        draggable={false}
      />
      <div className="flex-grow">
        <p className="text-sm font-medium text-gray-500">{preview.name}</p>
        <p className="text-xs text-gray-500">Scene {index + 1}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const ImageUploader = ({ 
  multiple = false, 
  onFilesChange, 
  accept = 'image/*',
  maxFiles = 5,
  className = ''
}) => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    processFiles(files);
  }, []);

  const processFiles = (files) => {
    if (files.length + previewUrls.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} images`);
      return;
    }

    const newPreviewUrls = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
      file
    }));

    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    if (onFilesChange) {
      onFilesChange([...previewUrls.map(p => p.file), ...files]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeImage = (index) => {
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviewUrls);
    if (onFilesChange) {
      onFilesChange(newPreviewUrls.map(p => p.file));
    }
    URL.revokeObjectURL(previewUrls[index].url);
  };

  const clearAll = () => {
    previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviewUrls([]);
    if (onFilesChange) {
      onFilesChange([]);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setPreviewUrls((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        if (onFilesChange) {
          onFilesChange(newItems.map(p => p.file));
        }
        return newItems;
      });
    }
  };

  return (
    <div className={`${className}`}>
      {previewUrls.length === 0 ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-700 mb-2">Drag and drop or click to upload images</p>
            <p className="text-gray-500 mb-4">
              You can rearrange the images by dragging and dropping after uploading
            </p>
            <label className="px-6 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition">
              {multiple ? 'Select images' : 'Select image'}
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
                accept={accept}
                multiple={multiple}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={previewUrls.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {previewUrls.map((preview, index) => (
                  <SortableItem
                    key={preview.id}
                    id={preview.id}
                    preview={preview}
                    index={index}
                    onRemove={removeImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex justify-between items-center pt-4">
            <label className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition text-sm">
              {multiple ? 'Add image' : 'Change image'}
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
                accept={accept}
                multiple={multiple}
              />
            </label>
            {previewUrls.length > 1 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
              >
                Delete all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ImageUploader.propTypes = {
  multiple: PropTypes.bool,
  onFilesChange: PropTypes.func,
  accept: PropTypes.string,
  maxFiles: PropTypes.number,
  className: PropTypes.string
};

export default ImageUploader;