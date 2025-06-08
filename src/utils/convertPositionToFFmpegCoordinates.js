/**
 * Thư viện hỗ trợ chuyển đổi tọa độ giữa giao diện người dùng và FFmpeg
 * Sử dụng để điều chỉnh vị trí của text overlay trong video
 */

/**
 * Chuyển đổi tọa độ từ giao diện sang tọa độ tương đối cho FFmpeg
 * @param {Object} position - Vị trí trên giao diện (pixel)
 * @param {Object} previewDimensions - Kích thước của preview trên giao diện
 * @param {Object} outputDimensions - Kích thước của video xuất ra
 * @returns {Object} Tọa độ tương đối cho FFmpeg
 */
export const convertPositionToFFmpegCoordinates = (position, previewDimensions, outputDimensions) => {
  // Nếu không có thông tin về kích thước, trả về vị trí gốc
  if (!previewDimensions || !outputDimensions) {
    console.warn('Không có thông tin kích thước để chuyển đổi tọa độ, sử dụng tọa độ tuyệt đối');
    return position;
  }
    const { x, y, unit } = position;
  const { width: previewWidth, height: previewHeight } = previewDimensions;
  const { width: outputWidth, height: outputHeight } = outputDimensions;
  
  // Tính toán tọa độ theo tỉ lệ phần trăm
  // Nếu đã là phần trăm (0-100), chuyển sang tỷ lệ (0-1)
  // Nếu là pixel, chuyển sang tỷ lệ (0-1)
  let percentX, percentY;
  
  if (unit === 'percentage' || (typeof x === 'number' && x >= 0 && x <= 100 && typeof y === 'number' && y >= 0 && y <= 100)) {
    // Đã là phần trăm (0-100), chuyển sang tỷ lệ (0-1)
    percentX = x / 100;
    percentY = y / 100;
    console.log(`Chuyển đổi từ phần trăm: (${x}%, ${y}%) -> tỷ lệ (${percentX}, ${percentY})`);
  } else {
    // Là pixel, chuyển sang tỷ lệ (0-1)
    percentX = x / previewWidth;
    percentY = y / previewHeight;
    console.log(`Chuyển đổi từ pixel: (${x}px, ${y}px) -> tỷ lệ (${percentX}, ${percentY})`);
  }
  
  // Chuyển đổi thành biểu thức FFmpeg
  // Sử dụng 'w' và 'h' đại diện cho chiều rộng và chiều cao của video trong FFmpeg
  const ffmpegX = `w*${percentX.toFixed(4)}`;
  const ffmpegY = `h*${percentY.toFixed(4)}`;
  
  console.log(`Chuyển đổi tọa độ: (${x}, ${y}) -> (${ffmpegX}, ${ffmpegY})`);
  
  return { 
    x: ffmpegX, 
    y: ffmpegY,
    // Cũng lưu lại tọa độ tuyệt đối cho các trường hợp cần
    absoluteX: Math.round(percentX * outputWidth),
    absoluteY: Math.round(percentY * outputHeight)
  };
};

/**
 * Lưu kích thước của preview vào trong scene
 * @param {Object} scene - Đối tượng scene
 * @param {Object} dimensions - Kích thước của preview container
 */
export const savePreviewDimensions = (scene, dimensions) => {
  if (!scene) return;

  // Lưu kích thước của preview
  scene.scenePreviewDimensions = {
    width: dimensions.width,
    height: dimensions.height
  };
  
  console.log(`Đã lưu kích thước preview: ${dimensions.width}x${dimensions.height}`);
};

/**
 * Hiển thị tooltip về tọa độ của overlay
 * @param {Object} position - Vị trí hiện tại
 * @param {Object} previewDimensions - Kích thước preview
 * @param {HTMLElement} targetElement - Element để hiển thị tooltip
 */
export const showCoordinateTooltip = (position, previewDimensions, targetElement) => {
  const { x, y } = position;
  const percentX = (x / previewDimensions.width * 100).toFixed(2);
  const percentY = (y / previewDimensions.height * 100).toFixed(2);
  
  const tooltip = document.createElement('div');
  tooltip.className = 'coordinate-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = 'rgba(0,0,0,0.7)';
  tooltip.style.color = 'white';
  tooltip.style.padding = '5px';
  tooltip.style.borderRadius = '3px';
  tooltip.style.fontSize = '12px';
  tooltip.style.zIndex = '9999';
  tooltip.style.left = `${x + 10}px`;
  tooltip.style.top = `${y + 10}px`;
  tooltip.textContent = `x: ${x}px (${percentX}%), y: ${y}px (${percentY}%)`;
  
  // Xóa tooltip cũ nếu có
  const oldTooltip = document.querySelector('.coordinate-tooltip');
  if (oldTooltip) oldTooltip.remove();
  
  // Thêm tooltip mới
  document.body.appendChild(tooltip);
  
  // Tự động xóa tooltip sau 2 giây
  setTimeout(() => tooltip.remove(), 2000);
};
