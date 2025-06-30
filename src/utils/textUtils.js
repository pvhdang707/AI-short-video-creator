/**
 * Utility functions for text processing and formatting
 */

/**
 * Bọc text thành nhiều dòng dựa trên độ dài tối đa
 * @param {string} text - Text cần bọc
 * @param {number} maxCharsPerLine - Số ký tự tối đa trên mỗi dòng
 * @returns {string} Text đã được bọc với \n
 */
export const wrapText = (text, maxCharsPerLine = 40) => {
  console.log('wrapText input:', text, 'maxCharsPerLine:', maxCharsPerLine);
  
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  
  for (let word of words) {
    // Kiểm tra xem thêm từ này có vượt quá giới hạn không
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (testLine.length > maxCharsPerLine) {
      // Nếu vượt quá, lưu dòng hiện tại và bắt đầu dòng mới
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        // Nếu từ đơn lẻ quá dài, cắt nó
        lines.push(word.substring(0, maxCharsPerLine));
        currentLine = word.substring(maxCharsPerLine);
      }
    } else {
      // Nếu không vượt quá, thêm từ vào dòng hiện tại
      currentLine = testLine;
    }
  }
  
  // Thêm dòng cuối cùng nếu còn
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  
  console.log('wrapped lines:', lines);
  return lines.join('\n');
};

/**
 * Tính toán độ dài text phù hợp với kích thước video
 * @param {number} videoWidth - Chiều rộng video
 * @param {number} fontSize - Kích thước font
 * @param {number} marginPercent - Phần trăm margin (mặc định 20%)
 * @returns {number} Số ký tự tối đa trên mỗi dòng
 */
export const calculateMaxCharsPerLine = (videoWidth, fontSize, marginPercent = 20) => {
  // Ước tính chiều rộng ký tự dựa trên font size
  // Với font Arial, mỗi ký tự khoảng 0.6 * fontSize
  const charWidth = fontSize * 0.6;
  
  // Tính toán chiều rộng có thể sử dụng (trừ margin)
  const usableWidth = videoWidth * (1 - marginPercent / 100);
  
  // Tính số ký tự tối đa
  const maxChars = Math.floor(usableWidth / charWidth);
  
  console.log(`Video width: ${videoWidth}, Font size: ${fontSize}, Max chars: ${maxChars}`);
  
  return Math.max(10, maxChars); // Đảm bảo ít nhất 10 ký tự
};

/**
 * Escape text cho FFmpeg
 * @param {string} text - Text cần escape
 * @returns {string} Text đã được escape
 */
export const escapeTextForFFmpeg = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/'/g, "\\'")  // Escape single quotes
    .replace(/\\n/g, "\\n"); // Preserve newlines
};

/**
 * Tạo text với độ dài phù hợp cho video
 * @param {string} text - Text gốc
 * @param {number} videoWidth - Chiều rộng video
 * @param {number} fontSize - Kích thước font
 * @param {number} marginPercent - Phần trăm margin
 * @returns {string} Text đã được format phù hợp
 */
export const formatTextForVideo = (text, videoWidth, fontSize, marginPercent = 20) => {
  const escapedText = escapeTextForFFmpeg(text);
  const maxCharsPerLine = calculateMaxCharsPerLine(videoWidth, fontSize, marginPercent);
  const wrappedText = wrapText(escapedText, maxCharsPerLine);
  
  console.log('Original text:', text);
  console.log('Formatted text:', wrappedText);
  
  return wrappedText;
}; 