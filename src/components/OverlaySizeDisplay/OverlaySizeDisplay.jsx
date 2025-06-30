import React, { useMemo } from 'react';
import { getCurrentOverlayDisplayInfo } from '../../utils/overlayDimensionUtils';

/**
 * Component hiển thị thông tin kích thước của overlay
 * @param {Object} props
 * @param {Object} props.overlay - Đối tượng overlay (image, text, sticker)
 * @param {Number|String} props.selectedScene - ID của scene đang được chọn
 * @param {Object} props.sceneElements - Thông tin các elements trong scene
 * @param {Object} props.className - Class CSS bổ sung
 */
const OverlaySizeDisplay = ({ overlay, selectedScene, sceneElements, className = '' }) => {
  // Lấy kích thước của scene để tính toán tỷ lệ
  const sceneDimensions = useMemo(() => {
    if (!selectedScene || !sceneElements || !sceneElements[selectedScene]) {
      return { width: 1920, height: 1080 }; // Giá trị mặc định nếu không có thông tin scene
    }
    
    // Ưu tiên dùng kích thước preview đã lưu trong scene
    if (sceneElements[selectedScene].scenePreviewDimensions) {
      return sceneElements[selectedScene].scenePreviewDimensions;
    }
    
    // Nếu không có, dùng kích thước mặc định HD
    return { width: 1280, height: 720 };
  }, [selectedScene, sceneElements]);
  
  // Tính toán thông tin hiển thị kích thước hiện tại
  const displayInfo = useMemo(() => {
    if (!overlay || !overlay.dimensions) {
      return { width: 0, height: 0, widthPercent: 0, heightPercent: 0 };
    }
    return getCurrentOverlayDisplayInfo(overlay, sceneDimensions);
  }, [overlay, sceneDimensions]);
  
  // Tính toán tỷ lệ khung hình
  const aspectRatio = useMemo(() => {
    if (!overlay?.dimensions || !overlay.dimensions.width || !overlay.dimensions.height) {
      return '1:1';
    }
    
    // Nếu đã có dimensionRatio, lấy từ đó
    if (overlay.dimensionRatio && overlay.dimensionRatio.aspectRatio) {
      const ratio = overlay.dimensionRatio.aspectRatio;
      // Làm tròn đến 2 chữ số thập phân cho đẹp
      return `${ratio.toFixed(2)}:1`;
    }
    
    // Tính từ kích thước
    const ratio = overlay.dimensions.width / overlay.dimensions.height;
    return `${ratio.toFixed(2)}:1`;
  }, [overlay]);

  // Nếu không có overlay thì không hiển thị gì
  if (!overlay || !displayInfo) {
    return null;
  }

  return (
    <div className={`overlay-size-display bg-gray-800 p-3 rounded-lg ${className}`}>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-400">Kích thước thực:</div>
        <div className="text-white font-medium text-right">{displayInfo.width} × {displayInfo.height}px</div>
        
        <div className="text-gray-400">Tỷ lệ với scene:</div>
        <div className="text-white font-medium text-right">{displayInfo.widthPercent}% × {displayInfo.heightPercent}%</div>
        
        <div className="text-gray-400">Tỷ lệ khung hình:</div>
        <div className="text-white font-medium text-right">{aspectRatio}</div>
        
        {overlay.transform && (
          <>
            <div className="text-gray-400">Scale:</div>
            <div className="text-white font-medium text-right">{(overlay.transform.scale || 1).toFixed(2)}×</div>
          </>
        )}
      </div>
    </div>
  );
};

export default OverlaySizeDisplay;