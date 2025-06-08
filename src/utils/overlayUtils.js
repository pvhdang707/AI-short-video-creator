/**
 * Utility functions for handling scene overlays including image filters, 
 * volume adjustments, text overlays, and image overlays.
 */

// Import các hàm cần thiết
import { base64ToBlob } from './audioUtils';

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
export const createAdvancedTextOverlay = (textConfig) => {
  try {
    const { content, position, style, animation, dimensions, timing } = textConfig;
    let { x, y, unit, absoluteX, absoluteY } = position;
    
    // Get timing information if available
    const startTime = timing?.start ?? 0;
    const endTime = timing?.end;
    
    // Sử dụng tọa độ tương đối nếu có thông tin về kích thước
    // Mặc định kích thước video output là 854x480 nếu không được chỉ định
    const outputDimensions = { 
      width: (dimensions?.output?.width || 854), 
      height: (dimensions?.output?.height || 480) 
    };
    const previewDimensions = position.previewDimensions || dimensions?.preview;
    
    // Lấy thông tin về font size để tính toán điểm anchor cho text
    const { fontSize = 24 } = style || {};
    
    // Chuyển đổi tọa độ cho FFmpeg
    let ffmpegX, ffmpegY;
      if (unit === 'percentage' || (typeof x === 'number' && x >= 0 && x <= 100 && typeof y === 'number' && y >= 0 && y <= 100)) {
      // Sử dụng tọa độ phần trăm để tạo tọa độ FFmpeg
      console.log(`Sử dụng tọa độ phần trăm (${x}%, ${y}%) cho text overlay`);
      
      // Chuyển phần trăm thành hệ số (0-1)
      const percentX = x / 100;
      const percentY = y / 100;
      
      // Sử dụng biểu thức w và h của FFmpeg
      ffmpegX = `(w*${percentX.toFixed(4)})`;
      ffmpegY = `(h*${percentY.toFixed(4)})`;
      
      // Thêm căn chỉnh trung tâm (center alignment) cho text
      // Điều này giúp text xuất hiện ở trung tâm của vị trí được chọn
      ffmpegX = `${ffmpegX}-(text_w/2)`;
      ffmpegY = `${ffmpegY}-(text_h/2)`;
      
      // Debug info
      console.log(`Tọa độ phần trăm: (${x}%, ${y}%) -> FFmpeg: x=${ffmpegX}, y=${ffmpegY}`);
      
    } else if (absoluteX !== undefined && absoluteY !== undefined) {
      // Sử dụng tọa độ tuyệt đối nếu có sẵn
      console.log(`Sử dụng tọa độ tuyệt đối (${absoluteX}, ${absoluteY}) cho text overlay`);
      ffmpegX = `${absoluteX}-(text_w/2)`;
      ffmpegY = `${absoluteY}-(text_h/2)`;
    } else {
      // Nếu có thông tin kích thước preview và output, chuyển đổi tọa độ
      console.log('Chuyển đổi tọa độ từ pixel sang tương đối cho FFmpeg');
      const convertedPosition = convertPositionToFFmpegCoordinates(
        { x, y }, 
        previewDimensions || { width: outputDimensions.width, height: outputDimensions.height },
        outputDimensions
      );
      
      ffmpegX = `${convertedPosition.x}-(text_w/2)`;
      ffmpegY = `${convertedPosition.y}-(text_h/2)`;
    }
    
    console.log(`Biểu thức FFmpeg cuối cùng cho vị trí: x=${ffmpegX}, y=${ffmpegY}`);
    
    const {
      color = 'FFFFFF',
      fontFamily = 'arial',
      bold = false,
      italic = false,
      outline = false,
      outlineColor = '000000',
      outlineWidth = 2,
      shadow = false,
      shadowColor = '000000',
      shadowX = 2,
      shadowY = 2,
      opacity = 1,
      backgroundColor = null,
      backgroundOpacity = 0.5
    } = style || {};
    
    // Chuẩn bị nội dung
    const escapedContent = content.replace(/'/g, "\\'").replace(/\\n/g, "\\n");
    const hexColor = color.replace('#', '');
    const hexOutlineColor = outlineColor.replace('#', '');
    const hexShadowColor = shadowColor.replace('#', '');    // Xây dựng chuỗi text expression
    let textExpression = `drawtext=text='${escapedContent}'`;
      // Thêm thông tin vị trí, đã điều chỉnh theo điểm neo trung tâm
    textExpression += `:x=${ffmpegX}:y=${ffmpegY}`;
    
    // Apply timing constraints if available
    if (startTime !== undefined || endTime !== undefined) {
      // Default: show from beginning to end of video if not specified
      const start = startTime !== undefined ? startTime : 0;
      const end = endTime !== undefined ? endTime : 9999; // Very large number to ensure it shows until the end
      
      // Enable text only between start and end time
      textExpression += `:enable='between(t,${start},${end})'`;
      console.log(`Applying timing constraints to text overlay: start=${start}, end=${end}`);
    }// Thêm debug info vào nội dung text để xác minh vị trí
    // Bật debug để hiện thông tin tọa độ trên text để dễ kiểm tra
    const showDebugInfo = false; // Đặt thành false khi deploy
    if (showDebugInfo) {
        const debugText = `${escapedContent} (${x}%,${y}%)`;
        textExpression = textExpression.replace(`text='${escapedContent}'`, `text='${debugText}'`);
    }
    
    textExpression += `:fontsize=${fontSize}`;
    // Always use arial.ttf which is loaded into FFmpeg's virtual filesystem
    textExpression += `:fontfile=arial.ttf`;
    
    // Xử lý màu chữ và độ trong suốt
    if (opacity !== 1) {
      textExpression += `:fontcolor_expr=0x${hexColor}@${opacity}`;
    } else {
      textExpression += `:fontcolor=0x${hexColor}`;
    }
    
    // Thêm background nếu được chỉ định
    if (backgroundColor) {
      const hexBgColor = backgroundColor.replace('#', '');
      textExpression += `:box=1:boxcolor=0x${hexBgColor}@${backgroundOpacity}:boxborderw=5`;
    }
    
    // Thêm viền
    if (outline) {
      textExpression += `:borderw=${outlineWidth}:bordercolor=0x${hexOutlineColor}`;
    }
    
    // Thêm đổ bóng
    if (shadow) {
      textExpression += `:shadowx=${shadowX}:shadowy=${shadowY}:shadowcolor=0x${hexShadowColor}`;
    }
    
    // Thêm hiệu ứng animation nếu có
    if (animation) {
      const { type, duration, delay, fadeIn, fadeOut } = animation;
      
      switch (type) {
        case 'fade':
          // Tạo fade in và fade out
          if (fadeIn) {
            textExpression += `:alpha='if(lt(t,${delay}),0,if(lt(t,${delay + fadeIn}),(t-${delay})/${fadeIn},1))'`;
          }
          if (fadeOut && duration) {
            const fadeOutStart = duration - fadeOut;
            textExpression += `:alpha='if(lt(t,${delay}),0,if(lt(t,${delay + fadeIn}),(t-${delay})/${fadeIn},if(lt(t,${fadeOutStart}),1,(${duration}-t)/${fadeOut})))'`;
          }
          break;
          
        case 'slide':
          // Hiệu ứng slide từ trái hoặc phải
          const direction = animation.direction || 'left';
          const screenW = 'w'; // Chiều rộng màn hình
          
          if (direction === 'left') {
            textExpression += `:x='if(lt(t,${delay}),${screenW},if(lt(t,${delay + fadeIn}),(t-${delay})/${fadeIn}*${screenW},${x}))'`;
          } else { // right
            textExpression += `:x='if(lt(t,${delay}),-tw,if(lt(t,${delay + fadeIn}),(t-${delay})/${fadeIn}*${x},${x}))'`;
          }
          break;
      }
    }
    
    return textExpression;
  } catch (error) {
    console.error('Lỗi khi tạo text overlay nâng cao:', error);
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

/**
 * Xử lý và chèn overlay hình ảnh với các hiệu ứng
 * @param {FFmpeg} ffmpeg - Đối tượng FFmpeg
 * @param {Object} imageOverlay - Cấu hình overlay hình ảnh
 * @param {Number} index - Chỉ số của overlay
 * @returns {String} FFmpeg filter string
 */
export const createImageOverlay = async (ffmpeg, imageOverlay, index) => {
  try {
    const { source, position, transform, effects } = imageOverlay;
    const { x, y } = position || { x: '10', y: '10' };
    const { scale = 1, rotation = 0, opacity = 1 } = transform || {};
    
    // Chuẩn bị hình ảnh
    let imagePath;
    if (typeof source === 'string') {
      if (source.startsWith('data:')) {
        // Xử lý base64 image
        const base64Data = source.split(',')[1];
        const binaryData = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }
        
        imagePath = `overlay_${index}.png`;
        await ffmpeg.writeFile(imagePath, uint8Array);
      } else if (source.startsWith('http')) {
        // Xử lý URL
        try {
          const response = await fetch(source);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          
          imagePath = `overlay_${index}.png`;
          await ffmpeg.writeFile(imagePath, new Uint8Array(arrayBuffer));
        } catch (err) {
          console.error(`Lỗi khi tải overlay image từ URL: ${source}`, err);
          return null;
        }
      } else {
        // Giả định là đường dẫn local
        imagePath = source;
      }
    } else {
      console.error('Định dạng source không được hỗ trợ');
      return null;
    }
    
    // Xây dựng filter cho overlay
    let overlayFilter = `movie=${imagePath}`;
    
    // Áp dụng các hiệu ứng chuyển đổi
    if (scale !== 1 || rotation !== 0 || opacity !== 1 || effects) {
      let transformFilters = [];
      
      if (scale !== 1) {
        transformFilters.push(`scale=iw*${scale}:ih*${scale}`);
      }
      
      if (rotation !== 0) {
        transformFilters.push(`rotate=${rotation}*PI/180`);
      }
      
      if (opacity !== 1) {
        transformFilters.push(`format=rgba,colorchannelmixer=aa=${opacity}`);
      }
      
      // Áp dụng các hiệu ứng nếu có
      if (effects) {
        const { blur, colorEffect } = effects;
        
        if (blur > 0) {
          transformFilters.push(`boxblur=${blur}:${blur}:1`);
        }
        
        if (colorEffect === 'greyscale') {
          transformFilters.push('hue=s=0');
        } else if (colorEffect === 'sepia') {
          transformFilters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0');
        }
      }
      
      if (transformFilters.length > 0) {
        overlayFilter += `[in]${transformFilters.join(',')}[transformed${index}];`;
        overlayFilter += `[0:v][transformed${index}]`;
      } else {
        overlayFilter += `[overlay${index}];`;
        overlayFilter += `[0:v][overlay${index}]`;
      }
    } else {
      overlayFilter += `[overlay${index}];`;
      overlayFilter += `[0:v][overlay${index}]`;
    }
    
    // Hoàn thiện filter
    overlayFilter += `overlay=${x}:${y}`;
    
    // Xử lý animation nếu có
    if (imageOverlay.animation) {
      const { type, duration, delay } = imageOverlay.animation;
      
      switch (type) {
        case 'fade':
          const fadeIn = imageOverlay.animation.fadeIn || 1;
          const fadeOut = imageOverlay.animation.fadeOut;
          
          if (fadeIn > 0) {
            overlayFilter += `:eval=frame:enable='between(t,${delay},${delay + duration})'`;
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
            overlayFilter += `:eval=frame:x='if(lt(t,${delay}),w,max(${x},w-(t-${delay})*${slideSpeed*100}))'`;
          } else if (direction === 'right') {
            overlayFilter += `:eval=frame:x='if(lt(t,${delay}),-w,min(${x},(t-${delay})*${slideSpeed*100}-w))'`;
          } else if (direction === 'top') {
            overlayFilter += `:eval=frame:y='if(lt(t,${delay}),-h,min(${y},(t-${delay})*${slideSpeed*100}-h))'`;
          } else if (direction === 'bottom') {
            overlayFilter += `:eval=frame:y='if(lt(t,${delay}),h,max(${y},h-(t-${delay})*${slideSpeed*100}))'`;
          }
          break;
          
        case 'zoom':
          const zoomSpeed = imageOverlay.animation.speed || 1;
          const initialScale = imageOverlay.animation.initialScale || 0.1;
          
          overlayFilter = overlayFilter.replace(
            `scale=iw*${scale}:ih*${scale}`,
            `scale=iw*${scale}*'if(lt(t,${delay}),${initialScale},min(1,(t-${delay})*${zoomSpeed}))'` +
            `:ih*${scale}*'if(lt(t,${delay}),${initialScale},min(1,(t-${delay})*${zoomSpeed})))'`
          );
          break;
      }
    }
    
    return overlayFilter;
  } catch (error) {
    console.error(`Lỗi khi tạo image overlay:`, error);
    return null;
  }
};
