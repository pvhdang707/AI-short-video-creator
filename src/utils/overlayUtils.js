/**
 * Utility functions for handling scene overlays including image filters, 
 * volume adjustments, text overlays, and image overlays.
 */

// Import các hàm cần thiết
import { base64ToBlob } from './audioUtils';
import { formatTextForVideo } from './textUtils';

/**
 * Chuyển đổi tọa độ từ giao diện sang tọa độ tương đối cho FFmpeg
 * @param {Object} position - Vị trí trên giao diện (phần trăm hoặc pixel)
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
  
  // Chuyển đổi thành biểu thức FFmpeg với định dạng cố định
  const ffmpegX = `w*${percentX.toFixed(4)}`;
  const ffmpegY = `h*${percentY.toFixed(4)}`;
  
  console.log(`Chuyển đổi tọa độ thành biểu thức FFmpeg: (${ffmpegX}, ${ffmpegY})`);
  
  return { 
    x: ffmpegX, 
    y: ffmpegY,
    // Cũng lưu lại tọa độ tuyệt đối cho các trường hợp cần
    absoluteX: Math.round(percentX * outputWidth),
    absoluteY: Math.round(percentY * outputHeight)
  };
};

/**
 * Áp dụng các bộ lọc hình ảnh cơ bản cho một scene
 * @param {Object} imageFilters - Đối tượng chứa các tham số bộ lọc
 * @returns {String} Chuỗi filter dùng cho FFmpeg
 */
export const applyImageFilters = (imageFilters) => {
  const filters = [];
  
  if (!imageFilters) {
    return '';
  }
  
  const { scale, rotation, brightness, contrast, saturation, hue, blur, sharpen } = imageFilters;
  
  // Xử lý scale và rotation
  if ((scale && scale !== 1) || (rotation && rotation !== 0)) {
    filters.push(`scale=iw*${scale || 1}:ih*${scale || 1}${rotation ? `,rotate=${rotation}*PI/180` : ''}`);
  }
  
  // Xử lý brightness, contrast, saturation và hue
  const eqFilters = [];
  if (brightness && brightness !== 0) {
    eqFilters.push(`brightness=${brightness}`);
  }
  if (contrast && contrast !== 1) {
    eqFilters.push(`contrast=${contrast}`);
  }
  if (saturation && saturation !== 1) {
    eqFilters.push(`saturation=${saturation}`);
  }
  if (hue && hue !== 0) {
    eqFilters.push(`hue=${hue}`);
  }
  
  if (eqFilters.length > 0) {
    filters.push(`eq=${eqFilters.join(':')}`);
  }
  
  // Xử lý blur
  if (blur && blur > 0) {
    filters.push(`boxblur=${blur}:${blur}:1`);
  }
  
  // Xử lý sharpen
  if (sharpen && sharpen > 0) {
    filters.push(`unsharp=${sharpen}:${sharpen}:${sharpen}:${sharpen}:${sharpen}:0`);
  }
  
  return filters.join(',');
};

/**
 * Tạo filter cho text overlay với các hiệu ứng nâng cao
 * @param {Object} textConfig - Cấu hình văn bản
 * @returns {String} FFmpeg filter string
 */
export const createAdvancedTextOverlay = async (textConfig, outputLabel = '[v1]') => {
  try {
    const { text, position, style, timing, outputDimensions, previewDimensions } = textConfig;
    
    console.log(`[Text Overlay] Processing text: "${text}"`);
    console.log(`[Text Overlay] Original position:`, position);
    console.log(`[Text Overlay] Output dimensions:`, outputDimensions);
    console.log(`[Text Overlay] Preview dimensions:`, previewDimensions);
    
    // Chuyển đổi tọa độ cho FFmpeg
    let ffmpegX, ffmpegY;
    
    if (position.unit === 'percentage' || (typeof position.x === 'number' && position.x >= 0 && position.x <= 100 && typeof position.y === 'number' && position.y >= 0 && position.y <= 100)) {
      // Sử dụng tọa độ phần trăm để tạo tọa độ FFmpeg
      console.log(`[Text Overlay] Sử dụng tọa độ phần trăm (${position.x}%, ${position.y}%)`);
      
      // Chuyển phần trăm thành hệ số (0-1)
      const percentX = position.x / 100;
      const percentY = position.y / 100;
      
      // Tính toán vị trí pixel tương ứng với output dimensions
      const pixelX = Math.round(percentX * outputDimensions.width);
      const pixelY = Math.round(percentY * outputDimensions.height);
      
      console.log(`[Text Overlay] Chuyển đổi sang pixel: (${pixelX}, ${pixelY})`);
      
      // Sử dụng tọa độ pixel cố định
      ffmpegX = pixelX;
      ffmpegY = pixelY;
    } else {
      // Sử dụng tọa độ tuyệt đối nếu có
      if (position.absoluteX !== undefined && position.absoluteY !== undefined) {
        ffmpegX = position.absoluteX;
        ffmpegY = position.absoluteY;
        console.log(`[Text Overlay] Sử dụng tọa độ tuyệt đối: (${ffmpegX}, ${ffmpegY})`);
      } else {
        // Fallback về tọa độ gốc
        ffmpegX = position.x;
        ffmpegY = position.y;
        console.log(`[Text Overlay] Sử dụng tọa độ gốc: (${ffmpegX}, ${ffmpegY})`);
      }
    }
    
    console.log(`[Text Overlay] Tọa độ FFmpeg cuối cùng: (${ffmpegX}, ${ffmpegY})`);
    
    // Xử lý text content
    const wrappedContent = formatTextForVideo(text, outputDimensions.width, style.fontSize);
    const content = text;
    
    console.log(`[Text Overlay] Original content: ${content}`);
    console.log(`[Text Overlay] Wrapped content: ${wrappedContent}`);
    
    // Xử lý timing
    const startTime = timing?.start || 0;
    const endTime = timing?.end || 5;
    console.log(`[Text Overlay] Timing: ${startTime}s to ${endTime}s`);
    
    // Tạo filter expression
    let textExpression = `drawtext=text='${wrappedContent}'`;
    
    // Thêm vị trí
    textExpression += `:x=${ffmpegX}:y=${ffmpegY}`;
    
    // Thêm timing
    textExpression += `:enable='between(t,${startTime},${endTime})'`;
    
    // Thêm font size
    textExpression += `:fontsize=${style.fontSize || 24}`;
    
    // Thêm font file
    textExpression += `:fontfile=arial.ttf`;
    
    // Thêm màu chữ
    const hexColor = convertColorToHex(style.color);
    textExpression += `:fontcolor=0x${hexColor}`;
    
    // Thêm các style khác nếu có
    if (style.bold) {
      textExpression += `:fontcolor=0x${hexColor}`;
    }
    
    if (style.italic) {
      textExpression += `:fontcolor=0x${hexColor}`;
    }
    
    // Thêm outline nếu có
    if (style.outline) {
      textExpression += `:bordercolor=0x${convertColorToHex(style.outlineColor)}`;
      textExpression += `:borderw=${style.outlineWidth || 2}`;
    }
    
    // Thêm shadow nếu có
    if (style.shadow) {
      textExpression += `:shadowx=${style.shadowX || 2}`;
      textExpression += `:shadowy=${style.shadowY || 2}`;
      textExpression += `:shadowcolor=0x${convertColorToHex(style.shadowColor)}@${style.shadowOpacity || 0.4}`;
    }
    
    // Thêm background nếu có
    if (style.backgroundColor) {
      textExpression += `:box=1`;
      textExpression += `:boxcolor=0x${convertColorToHex(style.backgroundColor)}@${style.backgroundOpacity || 0.5}`;
    }
    
    // Thêm opacity nếu khác 1
    if (style.opacity !== 1) {
      textExpression += `:alpha=${style.opacity}`;
    }
    
    // Thêm output label
    textExpression += outputLabel;
    
    console.log(`[Text Overlay] Final filter expression: ${textExpression}`);
    return textExpression;
  } catch (error) {
    console.error('[Text Overlay] Error creating filter:', error);
    return null;
  }
};

/**
 * Áp dụng điều chỉnh âm thanh nâng cao
 * @param {FFmpeg} ffmpeg - Đối tượng FFmpeg 
 * @param {Blob|String} audioSource - Nguồn âm thanh (blob hoặc base64 string)
 * @param {Number} sceneIndex - Chỉ số của scene
 * @param {Object} audioSettings - Các cài đặt âm thanh
 * @returns {String} Đường dẫn đến file âm thanh đã xử lý
 */
export const processAdvancedAudio = async (ffmpeg, audioSource, sceneIndex, audioSettings) => {
  try {
    // Chuẩn bị dữ liệu âm thanh
    let audioData;
    if (typeof audioSource === 'string' && audioSource.startsWith('data:')) {
      // Chuyển đổi base64 thành blob
      const audioBlob = await base64ToBlob(audioSource);
      const arrayBuffer = await audioBlob.arrayBuffer();
      audioData = new Uint8Array(arrayBuffer);
    } else if (audioSource instanceof Blob) {
      // Nếu đã là blob
      const arrayBuffer = await audioSource.arrayBuffer();
      audioData = new Uint8Array(arrayBuffer);
    } else {
      throw new Error('Định dạng âm thanh không được hỗ trợ');
    }

    // Lưu file âm thanh tạm thời
    const tempAudioPath = `scene_${sceneIndex}_audio_temp.mp3`;
    await ffmpeg.writeFile(tempAudioPath, audioData);
    console.log(`Đã lưu audio tạm cho scene ${sceneIndex}`);

    // Tạo filter string cho âm thanh
    const audioFilters = [];
    const {
      volume = 1, 
      fadeIn = 0, 
      fadeOut = 0, 
      duration, 
      equalizer = null, 
      bass = 0, 
      treble = 0,
      normalize = false,
      pitch = 1,
      tempo = 1,
      reverb = 0,
      echo = 0
    } = audioSettings || {};
    
    // Điều chỉnh âm lượng
    if (volume !== 1) {
      audioFilters.push(`volume=${volume}`);
    }

    // Thêm fade in/out
    if (fadeIn > 0) {
      audioFilters.push(`afade=t=in:st=0:d=${fadeIn}`);
    }
    if (fadeOut > 0 && duration) {
      audioFilters.push(`afade=t=out:st=${duration - fadeOut}:d=${fadeOut}`);
    }
    
    // Xử lý equalizer nếu có
    if (equalizer) {
      const { low = 0, mid = 0, high = 0 } = equalizer;
      
      if (low !== 0 || mid !== 0 || high !== 0) {
        // Sử dụng 3-band equalizer
        audioFilters.push(
          `equalizer=f=100:width_type=h:width=200:g=${low}:` +
          `equalizer=f=1000:width_type=h:width=200:g=${mid}:` +
          `equalizer=f=8000:width_type=h:width=200:g=${high}`
        );
      }
    }
    
    // Xử lý bass/treble
    if (bass !== 0) {
      audioFilters.push(`bass=g=${bass}`);
    }
    if (treble !== 0) {
      audioFilters.push(`treble=g=${treble}`);
    }
    
    // Normalize âm thanh
    if (normalize) {
      audioFilters.push('loudnorm');
    }
    
    // Điều chỉnh tốc độ và pitch
    if (pitch !== 1 || tempo !== 1) {
      audioFilters.push(`rubberband=pitch=${pitch}:tempo=${tempo}`);
    }
    
    // Thêm reverb
    if (reverb > 0) {
      const roomScale = reverb * 100;
      audioFilters.push(`aecho=0.8:0.88:${reverb}:0.4`);
    }
    
    // Thêm echo
    if (echo > 0) {
      audioFilters.push(`aecho=0.8:0.5:${echo}:0.5`);
    }

    // Xử lý âm thanh với FFmpeg nếu có filter
    if (audioFilters.length > 0) {
      const processedAudioPath = `scene_${sceneIndex}_audio.mp3`;
      await ffmpeg.exec([
        '-i', tempAudioPath,
        '-af', audioFilters.join(','),
        '-y',
        processedAudioPath
      ]);
      console.log(`Đã xử lý audio nâng cao cho scene ${sceneIndex}`);
      return processedAudioPath;
    }

    return tempAudioPath;
  } catch (error) {
    console.error(`Lỗi khi xử lý audio nâng cao cho scene ${sceneIndex}:`, error);
    throw new Error(`Lỗi khi xử lý audio nâng cao: ${error.message}`);
  }
};

// Thêm các hàm tiện ích mới
const calculateScaleRatio = (previewDimensions, outputDimensions) => {
  const previewRatio = previewDimensions.width / previewDimensions.height;
  const outputRatio = outputDimensions.width / outputDimensions.height;
  
  const scaleRatio = {
    width: outputDimensions.width / previewDimensions.width,
    height: outputDimensions.height / previewDimensions.height
  };
  
  return Math.min(scaleRatio.width, scaleRatio.height);
};

const convertCoordinates = (position, previewDimensions, outputDimensions) => {
  // Nếu position là phần trăm
  if (position.unit === 'percentage') {
    return {
      x: Math.round(position.x * outputDimensions.width / 100),
      y: Math.round(position.y * outputDimensions.height / 100)
    };
  }
  
  // Nếu position là pixel
  const scaleRatio = calculateScaleRatio(previewDimensions, outputDimensions);
  return {
    x: Math.round(position.x * scaleRatio),
    y: Math.round(position.y * scaleRatio)
  };
};


export const createImageOverlay = async (ffmpeg, imageOverlay, index, baseStream = '[0:v]') => {
  try {
    const { source, position, dimensions, transform } = imageOverlay;
    
    // Xử lý position
    let outputPosition;
    if (position.absoluteX !== undefined && position.absoluteY !== undefined) {
      // Sử dụng tọa độ tuyệt đối đã được tính
      outputPosition = {
        x: position.absoluteX,
        y: position.absoluteY
      };
    } else {
      // Tính toán tọa độ mới
      outputPosition = convertCoordinates(
        position,
        dimensions.preview,
        dimensions.output
      );
    }
    
    // Tính toán tỷ lệ scale cho output
    const outputScale = transform.scale * calculateScaleRatio(
      dimensions.preview,
      dimensions.output
    );
    
    // Tạo filter string
    let overlayFilter = '';
    
    // Thêm các transform filters
    let transformFilters = [];
    
    // Áp dụng scale với tỷ lệ đã tính
    transformFilters.push(`scale=iw*${outputScale}:ih*${outputScale}`);
    
    if (transform.rotation !== 0) {
      transformFilters.push(`rotate=${transform.rotation}*PI/180`);
    }
    
    if (transform.opacity !== 1) {
      transformFilters.push(`format=rgba,colorchannelmixer=aa=${transform.opacity}`);
    }
    
    // Áp dụng các hiệu ứng nếu có
    if (imageOverlay.effects) {
      const { blur, colorEffect } = imageOverlay.effects;
      
      if (blur > 0) {
        transformFilters.push(`boxblur=${blur}:${blur}:1`);
      }
      
      if (colorEffect === 'greyscale') {
        transformFilters.push('hue=s=0');
      } else if (colorEffect === 'sepia') {
        transformFilters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0');
      }
    }
    
    // Đặt tên labels cho intermediate và output streams
    const transformedLabel = `t${index}`; // Transformed image label
    
    // Thêm filters cho hình ảnh overlay
    if (transformFilters.length > 0) {
      // Nếu cần transform, tạo một chain filter
      overlayFilter += `[${index}:v]${transformFilters.join(',')}[${transformedLabel}];`;
      overlayFilter += `${baseStream}[${transformedLabel}]overlay=${outputPosition.x}:${outputPosition.y}`;
    } else {
      // Nếu không cần transform
      overlayFilter += `${baseStream}[${index}:v]overlay=${outputPosition.x}:${outputPosition.y}`;
    }
    
    // Xử lý animation nếu có
    if (imageOverlay.animation) {
      const { type, duration, delay } = imageOverlay.animation;
      
      switch (type) {
        case 'fade':
          const fadeIn = imageOverlay.animation.fadeIn || 1;
          const fadeOut = imageOverlay.animation.fadeOut;
          
          if (fadeIn > 0) {
            overlayFilter += `:enable='between(t,${delay},${delay + duration})'`;
            overlayFilter += `:alpha='if(lt(t,${delay}),0,if(lt(t,${delay + fadeIn}),(t-${delay})/${fadeIn},`;
            
            if (fadeOut > 0 && duration > fadeOut) {
              const fadeOutStart = duration - fadeOut;
              overlayFilter += `if(lt(t,${delay + fadeOutStart}),1,(${delay + duration}-t)/${fadeOut})))'`;
            } else {
              overlayFilter += `1))'`;
            }
          }
          break;
          
        case 'slide':
          const direction = imageOverlay.animation.direction || 'left';
          const slideSpeed = imageOverlay.animation.speed || 1;
          
          if (direction === 'left') {
            overlayFilter += `:x='if(lt(t,${delay}),w,max(${outputPosition.x},w-(t-${delay})*${slideSpeed*100}))'`;
          } else if (direction === 'right') {
            overlayFilter += `:x='if(lt(t,${delay}),-w,min(${outputPosition.x},(t-${delay})*${slideSpeed*100}-w))'`;
          } else if (direction === 'top') {
            overlayFilter += `:y='if(lt(t,${delay}),-h,min(${outputPosition.y},(t-${delay})*${slideSpeed*100}-h))'`;
          } else if (direction === 'bottom') {
            overlayFilter += `:y='if(lt(t,${delay}),h,max(${outputPosition.y},h-(t-${delay})*${slideSpeed*100}))'`;
          }
          break;
      }
    }
    
    // Add output label
    overlayFilter += `[outv]`;
    
    console.log(`[Image Overlay ${index}] Created filter with position: (${outputPosition.x}, ${outputPosition.y}), scale: ${outputScale}`);
    console.log(`[Image Overlay ${index}] Filter string: ${overlayFilter}`);
    return overlayFilter;
  } catch (error) {
    console.error(`Lỗi khi tạo image overlay:`, error);
    return null;
  }
};


// Thêm hàm mới để xử lý preview
export const handlePreviewOverlay = (overlay, previewDimensions) => {
  const previewScale = overlay.transform?.scale || 1;
  
  // Tính toán vị trí cho preview
  let position;
  if (overlay.position.unit === 'percentage') {
    position = {
      x: overlay.position.x * previewDimensions.width / 100,
      y: overlay.position.y * previewDimensions.height / 100
    };
  } else {
    position = {
      x: overlay.position.x,
      y: overlay.position.y
    };
  }
  
  return {
    width: overlay.dimensions.original.width * previewScale,
    height: overlay.dimensions.original.height * previewScale,
    position
  };
};

// Thêm hàm mới để xử lý output
export const handleOutputOverlay = (overlay, outputDimensions) => {
  const scaleRatio = calculateScaleRatio(
    overlay.dimensions.preview,
    outputDimensions
  );
  
  const outputScale = (overlay.transform?.scale || 1) * scaleRatio;
  
  // Tính toán vị trí cho output
  let position;
  if (overlay.position.absoluteX !== undefined && overlay.position.absoluteY !== undefined) {
    position = {
      x: overlay.position.absoluteX,
      y: overlay.position.absoluteY
    };
  } else {
    position = convertCoordinates(
      overlay.position,
      overlay.dimensions.preview,
      outputDimensions
    );
  }
  
  return {
    width: overlay.dimensions.original.width * outputScale,
    height: overlay.dimensions.original.height * outputScale,
    position
  };
};

// Thêm hàm createTextOverlayFilter
export const createTextOverlayFilter = async (overlay, index) => {
  try {
    const { content, position, style, dimensions } = overlay;
    const { x, y, unit } = position;
    const { color, fontSize, fontFamily } = style;
    
    // Chuyển đổi tọa độ từ phần trăm sang pixel
    let pixelX, pixelY;
    if (unit === 'percentage' || (typeof x === 'number' && x >= 0 && x <= 100 && typeof y === 'number' && y >= 0 && y <= 100)) {
      // Nếu là phần trăm, chuyển sang pixel
      const outputWidth = dimensions?.output?.width || 854;
      const outputHeight = dimensions?.output?.height || 480;
      
      pixelX = Math.round((x / 100) * outputWidth);
      pixelY = Math.round((y / 100) * outputHeight);
      
      console.log(`Chuyển đổi tọa độ từ phần trăm (${x}%, ${y}%) sang pixel (${pixelX}, ${pixelY})`);
    } else {
      // Nếu đã là pixel
      pixelX = Math.round(x);
      pixelY = Math.round(y);
    }
    
    const escapedContent = content.replace(/'/g, "\\'");
    const actualFontSize = fontSize || 24;
    const hexColor = convertColorToHex(color);
    
    const boxOpacity = 0.5;
    const borderWidth = 5;
    const shadowX = 2;
    const shadowY = 2;
    const shadowOpacity = 0.4;
    
    // Đặt label cho output stream
    const outLabel = `v${index}`;
    
    // Bắt đầu với video stream gốc
    let textExpression = `[0:v]`;
    
    // Thêm drawtext filter
    textExpression += `drawtext=text='${escapedContent}'`;
    
    // Thêm vị trí đã chuyển đổi
    textExpression += `:x=${pixelX}:y=${pixelY}`;
    
    // Thêm font và kích thước
    textExpression += `:fontsize=${actualFontSize}`;
    textExpression += `:fontfile=arial.ttf`;
    
    // Thêm màu chữ
    textExpression += `:fontcolor=0x${hexColor}`;
    
    // Thêm box và border
    textExpression += `:box=1`;
    textExpression += `:boxcolor=black@${boxOpacity}`;
    textExpression += `:boxborderw=${borderWidth}`;
    
    // Thêm shadow
    textExpression += `:shadowx=${shadowX}`;
    textExpression += `:shadowy=${shadowY}`;
    textExpression += `:shadowcolor=black@${shadowOpacity}`;
    
    // Xử lý animation nếu có
    if (overlay.animation) {
      const { type, duration, delay } = overlay.animation;
      
      switch (type) {
        case 'fade':
          const fadeIn = overlay.animation.fadeIn || 1;
          const fadeOut = overlay.animation.fadeOut;
          
          if (fadeIn > 0) {
            textExpression += `:enable='between(t,${delay},${delay + duration})'`;
            textExpression += `:alpha='if(lt(t,${delay}),0,if(lt(t,${delay + fadeIn}),(t-${delay})/${fadeIn},`;
            
            if (fadeOut > 0 && duration > fadeOut) {
              const fadeOutStart = duration - fadeOut;
              textExpression += `if(lt(t,${delay + fadeOutStart}),1,(${delay + duration}-t)/${fadeOut})))'`;
            } else {
              textExpression += `1))'`;
            }
          }
          break;
          
        case 'slide':
          const direction = overlay.animation.direction || 'left';
          const slideSpeed = overlay.animation.speed || 1;
          
          if (direction === 'left') {
            textExpression += `:x='if(lt(t,${delay}),w,max(${pixelX},w-(t-${delay})*${slideSpeed*100}))'`;
          } else if (direction === 'right') {
            textExpression += `:x='if(lt(t,${delay}),-w,min(${pixelX},(t-${delay})*${slideSpeed*100}-w))'`;
          } else if (direction === 'top') {
            textExpression += `:y='if(lt(t,${delay}),-h,min(${pixelY},(t-${delay})*${slideSpeed*100}-h))'`;
          } else if (direction === 'bottom') {
            textExpression += `:y='if(lt(t,${delay}),h,max(${pixelY},h-(t-${delay})*${slideSpeed*100}))'`;
          }
          break;
      }
    }
    
    // Thêm output label
    textExpression += `[${outLabel}]`;
    
    console.log(`[Text Overlay ${index}] Created filter with content: "${escapedContent}", position: (${pixelX}, ${pixelY}), size: ${actualFontSize}`);
    console.log(`[Text Overlay ${index}] Filter string: ${textExpression}`);
    return textExpression;
  } catch (error) {
    console.error(`[Text Overlay ${index}] Error creating filter:`, error);
    return null;
  }
};

const createGlobalTextOverlayFilter = async (overlay, index) => {
  try {
    const { content, position, style, dimensions } = overlay;
    const { color, fontSize } = style;
    
    const escapedContent = content.replace(/'/g, "\\'");
    const actualFontSize = fontSize || 24;
    const hexColor = convertColorToHex(color);
    
    // Đặt label cho output stream
    const outLabel = `v${index}`;
    
    // Tính toán vị trí dựa trên kích thước output
    const outputWidth = dimensions?.output?.width || 854;
    const outputHeight = dimensions?.output?.height || 480;
    
    let yPosition;
    switch (position) {
      case 'top':
        yPosition = Math.round(outputHeight * 0.1);
        break;
      case 'center':
        yPosition = `(h-text_h)/2`;
        break;
      case 'bottom':
        yPosition = Math.round(outputHeight * 0.9);
        break;
      default:
        yPosition = Math.round(outputHeight * 0.9);
    }
      
    // Bắt đầu với stream video input
    let textExpression = `[0:v]`;


    // Thêm drawtext filter
    textExpression += `drawtext=text='${escapedContent}'` +
                    `:x=(w-text_w)/2:y=${yPosition}` +
                    `:fontsize=${actualFontSize}` +
                    `:fontfile=arial.ttf` +
                    `:fontcolor=0x${hexColor}` +
                    `:box=1` +
                    `:boxcolor=black@0.5` +
                    `:boxborderw=5` +
                    `:wrap=1`;
    
    // Thêm output label
    textExpression += `[${outLabel}]`;
    
    console.log(`[Global Text Overlay ${index}] Created filter with content: "${escapedContent}", position: ${position}`);
    return textExpression;
  } catch (error) {
    console.error(`[Global Text Overlay ${index}] Error creating filter:`, error);
    return null;
  }
};

// Hàm tiện ích để chuyển đổi màu sắc thành mã hex hợp lệ
const convertColorToHex = (color) => {
  if (!color) return 'FFFFFF'; // Mặc định màu trắng
  
  // Nếu đã là mã hex (bắt đầu bằng #)
  if (color.startsWith('#')) {
    return color.substring(1);
  }
  
  // Nếu là tên màu, chuyển đổi thành mã hex
  const colorMap = {
    'white': 'FFFFFF',
    'black': '000000',
    'red': 'FF0000',
    'green': '00FF00',
    'blue': '0000FF',
    'yellow': 'FFFF00',
    'cyan': '00FFFF',
    'magenta': 'FF00FF',
    'gray': '808080',
    'grey': '808080',
    'orange': 'FFA500',
    'purple': '800080',
    'pink': 'FFC0CB',
    'brown': 'A52A2A',
    'lime': '00FF00',
    'navy': '000080',
    'teal': '008080',
    'silver': 'C0C0C0',
    'gold': 'FFD700',
    'maroon': '800000',
    'olive': '808000'
  };
  
  const lowerColor = color.toLowerCase();
  return colorMap[lowerColor] || 'FFFFFF'; // Mặc định màu trắng nếu không tìm thấy
};

