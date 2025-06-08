import { FFmpeg } from '@ffmpeg/ffmpeg';

// Cấu hình mặc định cho video
const DEFAULT_VIDEO_SETTINGS = {
  width: 1920,
  height: 1080,
  fps: 30,
  preset: 'medium',
  crf: 23,
  bitrate: '4000k'
};

// Hàm khởi tạo FFmpeg và load font
export const initFFmpeg = async () => {
  try {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    
    // Load font vào FFmpeg memory khi khởi tạo
    const fontResponse = await fetch('/assets/fonts/ARIAL.TTF');
    const fontArrayBuffer = await fontResponse.arrayBuffer();
    await ffmpeg.writeFile('arial.ttf', new Uint8Array(fontArrayBuffer));
    console.log('Font loaded into FFmpeg memory');
    
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    return null;
  }
};

// Hàm xử lý base64 audio thành Blob
const base64ToBlob = async (base64String) => {
  try {
    if (!base64String.startsWith('data:')) {
      throw new Error('Chuỗi base64 không đúng định dạng');
    }

    const [metadata, base64Data] = base64String.split(',');
    const mimeType = metadata.match(/data:(.*?);/)?.[1];

    if (!mimeType) {
      throw new Error('Không thể xác định MIME type');
    }

    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mimeType });
  } catch (error) {
    console.error('Lỗi khi xử lý base64 audio:', error);
    throw new Error(`Lỗi khi xử lý base64 audio: ${error.message}`);
  }
};

// Hàm tạo filter cho text overlay
const createTextOverlayFilter = async (overlay, index) => {
  try {
    const { content, position, style } = overlay;
    const { x, y, unit, absoluteX, absoluteY, previewDimensions } = position;
    const { color, fontSize, fontFamily } = style;
    
    const escapedContent = content.replace(/'/g, "\\'");
    const actualFontSize = fontSize || 24;
    const hexColor = color?.replace('#', '') || 'FFFFFF';
    
    const boxOpacity = 0.5;
    const borderWidth = 5;
    const shadowX = 2;
    const shadowY = 2;
    const shadowOpacity = 0.4;
    
    // Xử lý tọa độ dựa trên đơn vị phần trăm hoặc pixel
    let xPos, yPos;
    
    // Lấy thông tin về kích thước output video
    // Giả định kích thước video là 854x480 nếu không có thông tin khác
    const outputWidth = 854;
    const outputHeight = 480;
    
    if (unit === 'percentage' || (typeof x === 'number' && x >= 0 && x <= 100 && typeof y === 'number' && y >= 0 && y <= 100)) {
      // Nếu là phần trăm (0-100%), chuyển đổi thành biểu thức FFmpeg sử dụng w và h
      const percentX = x / 100;
      const percentY = y / 100;
      
      // FFmpeg sử dụng text_w và text_h để đại diện cho kích thước của text
      // Để đặt text ở giữa vị trí, cần trừ đi một nửa kích thước text
      xPos = `(w*${percentX.toFixed(4)})-(text_w/2)`;  // Căn giữa text theo chiều ngang
      yPos = `(h*${percentY.toFixed(4)})-(text_h/2)`;  // Căn giữa text theo chiều dọc
      
      // Thêm debug log để kiểm tra tọa độ
      console.log(`[Text Overlay ${index}] Chuyển đổi từ phần trăm: (${x}%, ${y}%) -> (${percentX}, ${percentY}) -> FFmpeg: x=${xPos}, y=${yPos}`);
    } 
    else if (absoluteX !== undefined && absoluteY !== undefined) {
      // Nếu có tọa độ tuyệt đối sẵn, sử dụng chúng
      xPos = `${absoluteX}-(text_w/2)`;
      yPos = `${absoluteY}-(text_h/2)`;
      console.log(`[Text Overlay ${index}] Sử dụng tọa độ tuyệt đối từ script: (${absoluteX}, ${absoluteY})`);
    }
    else {
      // Nếu là tọa độ pixel, tính toán phần trăm dựa trên kích thước preview nếu có
      if (previewDimensions) {
        const percentX = x / previewDimensions.width;
        const percentY = y / previewDimensions.height;
        xPos = `(w*${percentX.toFixed(4)})-(text_w/2)`;
        yPos = `(h*${percentY.toFixed(4)})-(text_h/2)`;
        console.log(`[Text Overlay ${index}] Chuyển đổi từ pixel với kích thước preview: (${x}px, ${y}px) -> (${percentX}, ${percentY}) -> FFmpeg: x=${xPos}, y=${yPos}`);
      } else {
        // Nếu không có thông tin kích thước preview, sử dụng tọa độ tuyệt đối
        xPos = `${x}-(text_w/2)`;
        yPos = `${y}-(text_h/2)`;
        console.log(`[Text Overlay ${index}] Sử dụng tọa độ tuyệt đối (pixel): (${x}px, ${y}px)`);
      }
    }
    
    // Tạo filter string cho FFmpeg
    let textExpression = `drawtext=text='${escapedContent}'` +
                          `:x=${xPos}:y=${yPos}` +
                          `:fontsize=${actualFontSize}` +
                          `:fontfile=arial.ttf` +
                          `:fontcolor=0x${hexColor}` +
                          `:box=1` +
                          `:boxcolor=black@${boxOpacity}` +
                          `:boxborderw=${borderWidth}` +
                          `:shadowx=${shadowX}` +
                          `:shadowy=${shadowY}` +
                          `:shadowcolor=black@${shadowOpacity}`;
    
    // Thêm debug text để kiểm tra tọa độ (chỉ bật khi cần debug)
    const showDebugInfo = false; // Đặt thành true khi cần debug, false khi deploy
    if (showDebugInfo) {
      // Làm tròn giá trị tọa độ cho dễ đọc
      const roundedX = typeof x === 'number' ? x.toFixed(1) : x;
      const roundedY = typeof y === 'number' ? y.toFixed(1) : y;
      const debugText = `${escapedContent} (${roundedX}%,${roundedY}%)`;
      textExpression = textExpression.replace(`text='${escapedContent}'`, `text='${debugText}'`);
    }
    
    // Enhanced debugging - log detailed info to console but don't affect the output
    console.log(`DEBUG INFO [Text ${index}]: "${escapedContent}" at coordinates:`, {
      percentage: unit === 'percentage' || (x >= 0 && x <= 100 && y >= 0 && y <= 100) 
        ? `(${typeof x === 'number' ? x.toFixed(2) : x}%, ${typeof y === 'number' ? y.toFixed(2) : y}%)`
        : 'N/A',
      absolute: absoluteX !== undefined && absoluteY !== undefined
        ? `(${absoluteX}px, ${absoluteY}px)`
        : 'N/A',
      expression: `x=${xPos}, y=${yPos}`
    });
    
    console.log(`[Text Overlay ${index}] Created filter with content: "${escapedContent}", position: (${xPos}, ${yPos}), size: ${actualFontSize}`);
    return textExpression;
  } catch (error) {
    console.error(`[Text Overlay ${index}] Error creating filter:`, error);
    return null;
  }
};

// Hàm tạo filter cho sticker overlay
const createStickerOverlayFilter = async (overlay, index) => {
  try {
    const { content, position, transform } = overlay;
    const { x, y, unit, absoluteX, absoluteY, previewDimensions } = position;
    const { scale, rotation } = transform;
    
    // Tạo file tạm cho sticker
    const stickerPath = `sticker_${index}.png`;
    // TODO: Xử lý chuyển đổi sticker content thành file ảnh
    
    // Xử lý tọa độ dựa trên đơn vị phần trăm hoặc pixel
    let xPos, yPos;
    
    if (unit === 'percentage' || (typeof x === 'number' && x >= 0 && x <= 100 && typeof y === 'number' && y >= 0 && y <= 100)) {
      // Nếu là phần trăm (0-100%), chuyển đổi thành biểu thức FFmpeg sử dụng w và h
      const percentX = x / 100;
      const percentY = y / 100;
      
      // Trong FFmpeg, "overlay_w" và "overlay_h" đại diện cho kích thước của overlay (sticker)
      // "main_w" và "main_h" đại diện cho kích thước của video chính
      // Sử dụng "w" và "h" để đại diện cho kích thước của video đầu ra
      xPos = `(w*${percentX.toFixed(4)})-(overlay_w/2)`;  // Căn giữa sticker theo chiều ngang
      yPos = `(h*${percentY.toFixed(4)})-(overlay_h/2)`;  // Căn giữa sticker theo chiều dọc
      
      console.log(`[Sticker Overlay ${index}] Chuyển đổi từ phần trăm: (${x}%, ${y}%) -> (${percentX}, ${percentY}) -> FFmpeg: x=${xPos}, y=${yPos}`);
    } 
    else if (absoluteX !== undefined && absoluteY !== undefined) {
      // Nếu có tọa độ tuyệt đối sẵn, sử dụng chúng
      xPos = `${absoluteX}-(overlay_w/2)`;
      yPos = `${absoluteY}-(overlay_h/2)`;
      console.log(`[Sticker Overlay ${index}] Sử dụng tọa độ tuyệt đối từ script: (${absoluteX}, ${absoluteY})`);
    }
    else {
      // Nếu là tọa độ pixel, tính toán phần trăm dựa trên kích thước preview nếu có
      if (previewDimensions) {
        const percentX = x / previewDimensions.width;
        const percentY = y / previewDimensions.height;
        xPos = `(w*${percentX.toFixed(4)})-(overlay_w/2)`;
        yPos = `(h*${percentY.toFixed(4)})-(overlay_h/2)`;
        console.log(`[Sticker Overlay ${index}] Chuyển đổi từ pixel với kích thước preview: (${x}px, ${y}px) -> (${percentX}, ${percentY}) -> FFmpeg: x=${xPos}, y=${yPos}`);
      } else {
        // Nếu không có thông tin kích thước preview, sử dụng tọa độ tuyệt đối
        xPos = `${x}-(overlay_w/2)`;
        yPos = `${y}-(overlay_h/2)`;
        console.log(`[Sticker Overlay ${index}] Sử dụng tọa độ tuyệt đối (pixel): (${x}px, ${y}px)`);
      }
    }
    
    // Tạo filter string cho FFmpeg
    // Sử dụng các biến đặc biệt của FFmpeg: "overlay_w", "overlay_h" để truy cập vào kích thước của sticker
    const stickerExpression = `movie=${stickerPath}` +
                            `,scale=iw*${scale}:ih*${scale}` +
                            `,rotate=${rotation}*PI/180` +
                            `[sticker${index}];` +
                            `[0:v][sticker${index}]overlay=${xPos}:${yPos}`;
    
    // Thêm debug info
    console.log(`[Sticker Overlay ${index}] Created filter with position: (${xPos}, ${yPos}), scale: ${scale}, rotation: ${rotation}`);
    return stickerExpression;
  } catch (error) {
    console.error(`[Sticker Overlay ${index}] Error creating filter:`, error);
    return null;
  }
};

// Hàm tạo filter cho text overlay toàn cục
const createGlobalTextOverlayFilter = async (overlay, index) => {
  try {
    const { content, position, style } = overlay;
    const { color, fontSize } = style;
    
    const escapedContent = content.replace(/'/g, "\\'");
    const actualFontSize = fontSize || 24;
    const hexColor = color?.replace('#', '') || 'FFFFFF';
    
    let yPosition;
    switch (position) {
      case 'top':
        yPosition = 'h*0.1';
        break;
      case 'center':
        yPosition = '(h-text_h)/2';
        break;
      case 'bottom':
        yPosition = 'h*0.9-text_h';
        break;
      default:
        yPosition = 'h*0.9-text_h';
    }
    
    const textExpression = `drawtext=text='${escapedContent}'` +
                          `:x=(w-text_w)/2:y=${yPosition}` +
                          `:fontsize=${actualFontSize}` +
                          `:fontfile=arial.ttf` +
                          `:fontcolor=0x${hexColor}` +
                          `:box=1` +
                          `:boxcolor=black@0.5` +
                          `:boxborderw=5`;
    
    console.log(`[Global Text Overlay ${index}] Created filter with content: "${escapedContent}", position: ${position}`);
    return textExpression;
  } catch (error) {
    console.error(`[Global Text Overlay ${index}] Error creating filter:`, error);
    return null;
  }
};

// Hàm tạo filter cho watermark
const createWatermarkFilter = async (overlay, index) => {
  try {
    const { position, opacity } = overlay;
    
    // Tạo file tạm cho watermark
    const watermarkPath = 'watermark.png';
    // TODO: Xử lý tạo watermark
    
    let xPosition, yPosition;
    switch (position) {
      case 'top-left':
        xPosition = '10';
        yPosition = '10';
        break;
      case 'top-right':
        xPosition = 'W-w-10';
        yPosition = '10';
        break;
      case 'bottom-left':
        xPosition = '10';
        yPosition = 'H-h-10';
        break;
      case 'bottom-right':
        xPosition = 'W-w-10';
        yPosition = 'H-h-10';
        break;
      default:
        xPosition = 'W-w-10';
        yPosition = 'H-h-10';
    }
    
    const watermarkExpression = `movie=${watermarkPath}` +
                              `,format=rgba,colorchannelmixer=aa=${opacity}` +
                              `[watermark${index}];` +
                              `[0:v][watermark${index}]overlay=${xPosition}:${yPosition}`;
    
    console.log(`[Watermark ${index}] Created filter with position: ${position}, opacity: ${opacity}`);
    return watermarkExpression;
  } catch (error) {
    console.error(`[Watermark ${index}] Error creating filter:`, error);
    return null;
  }
};

// Hàm xử lý các overlay trong một scene
const processSceneOverlays = async (scene, sceneIndex) => {
  try {
    const filters = [];
    
    // Lấy thông tin về kích thước video
    // Mặc định sử dụng 854x480 nếu không có thông tin khác
    const resolution = scene.output?.resolution || '854x480';
    const [outputWidth, outputHeight] = resolution.split('x').map(Number);
    
    // Lấy thông tin về kích thước preview từ scene
    const previewDimensions = scene.scenePreviewDimensions;
    
    console.log(`Scene ${sceneIndex}: Kích thước output ${outputWidth}x${outputHeight}, preview: ${
      previewDimensions ? `${previewDimensions.width}x${previewDimensions.height}` : 'không có'
    }`);
    
    if (!scene.overlays || scene.overlays.length === 0) {
      console.log(`Scene ${sceneIndex}: Không có overlays nào cần xử lý`);
      return filters;
    }
    
    for (let i = 0; i < scene.overlays.length; i++) {
      const overlay = scene.overlays[i];
      console.log(`Đang xử lý overlay ${i} (${overlay.type}) cho scene ${sceneIndex}`);
      
      // Bổ sung thông tin về kích thước output và preview nếu chưa có
      if (overlay.position) {
        if (!overlay.position.previewDimensions && previewDimensions) {
          overlay.position.previewDimensions = previewDimensions;
        }
        
        // Nếu chưa có thông tin absoluteX/Y nhưng có thông tin phần trăm, tính toán giá trị tuyệt đối
        if (overlay.position.unit === 'percentage' && 
            typeof overlay.position.x === 'number' && 
            typeof overlay.position.y === 'number' &&
            (overlay.position.absoluteX === undefined || overlay.position.absoluteY === undefined)) {
          overlay.position.absoluteX = Math.round(overlay.position.x * outputWidth / 100);
          overlay.position.absoluteY = Math.round(overlay.position.y * outputHeight / 100);
          console.log(`Đã tính toán tọa độ tuyệt đối cho overlay ${i}: (${overlay.position.absoluteX}, ${overlay.position.absoluteY})`);
        }
      }
      
      // Log thông tin chi tiết về overlay để debug - không ảnh hưởng đến nội dung
      if (overlay.type === 'text') {
        console.log(`Overlay ${i} (${overlay.type}): "${overlay.content}" at position:`, 
                   `x=${overlay.position.x}%, y=${overlay.position.y}%`,
                   `[Absolute: ${overlay.position.absoluteX}px, ${overlay.position.absoluteY}px]`);
      }
      
      let filter = null;
      switch (overlay.type) {
        case 'text':
          filter = await createTextOverlayFilter(overlay, i);
          break;
        case 'sticker':
          filter = await createStickerOverlayFilter(overlay, i);
          break;
        case 'text_overlay':
          filter = await createGlobalTextOverlayFilter(overlay, i);
          break;
        case 'watermark':
          filter = await createWatermarkFilter(overlay, i);
          break;
      }
      
      if (filter) {
        filters.push(filter);
      } else {
        console.warn(`${overlay.type} overlay ${i} không được tạo (null filter)`);
      }
    }
    
    return filters;
  } catch (error) {
    console.error(`Lỗi khi xử lý overlays cho scene ${sceneIndex}:`, error);
    return [];
  }
};

// Hàm xử lý audio với FFmpeg
const processAudioWithFFmpeg = async (ffmpeg, audioBlob, sceneIndex, audioSettings) => {
  try {
    // Đọc audio blob thành ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioData = new Uint8Array(arrayBuffer);

    // Lưu file audio tạm
    const tempAudioPath = `scene_${sceneIndex}_audio_temp.mp3`;
    await ffmpeg.writeFile(tempAudioPath, audioData);
    console.log(`Đã lưu audio tạm cho scene ${sceneIndex + 1}`);

    // Tạo filter string cho audio
    const audioFilters = [];
    
    // Thêm volume adjustment
    if (audioSettings.volume !== 1) {
      audioFilters.push(`volume=${audioSettings.volume}`);
    }

    // Thêm fade in/out
    if (audioSettings.fadeIn > 0) {
      audioFilters.push(`afade=t=in:st=0:d=${audioSettings.fadeIn}`);
    }
    if (audioSettings.fadeOut > 0) {
      audioFilters.push(`afade=t=out:st=${audioSettings.duration - audioSettings.fadeOut}:d=${audioSettings.fadeOut}`);
    }

    // Xử lý audio với FFmpeg nếu có filter
    if (audioFilters.length > 0) {
      const processedAudioPath = `scene_${sceneIndex}_audio.mp3`;
      await ffmpeg.exec([
        '-i', tempAudioPath,
        '-af', audioFilters.join(','),
        '-y',
        processedAudioPath
      ]);
      console.log(`Đã xử lý audio cho scene ${sceneIndex + 1}`);
      return processedAudioPath;
    }

    return tempAudioPath;
  } catch (error) {
    console.error(`Lỗi khi xử lý audio scene ${sceneIndex + 1}:`, error);
    throw new Error(`Lỗi khi xử lý audio scene ${sceneIndex + 1}: ${error.message}`);
  }
};

// Hàm đọc thời lượng audio từ base64
const getAudioDuration = async (ffmpeg, base64Audio) => {
  try {
    // Chuyển base64 thành file tạm
    const audioBlob = await base64ToBlob(base64Audio);
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioData = new Uint8Array(arrayBuffer);
    
    // Lưu file tạm
    const tempPath = 'temp_audio.mp3';
    await ffmpeg.writeFile(tempPath, audioData);
    
    // Sử dụng FFmpeg để lấy thông tin audio
    const command = [
      '-i', tempPath,
      '-f', 'null',
      '-'
    ];
    
    try {
      // Thực hiện command và lắng nghe log để tìm thông tin thời lượng
      await ffmpeg.exec(command);
      
      // Đọc log để tìm thông tin thời lượng
      const logOutput = await ffmpeg.getLog();
      
      // Tìm kiếm thời lượng trong log với pattern như "Duration: 00:00:05.23"
      const durationRegex = /Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/;
      const match = logOutput.match(durationRegex);
      
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const centiseconds = parseInt(match[4]);
        
        // Tính tổng thời gian theo giây
        const totalSeconds = hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
        console.log(`Thời lượng audio: ${totalSeconds} giây`);
        
        // Xóa file tạm
        await ffmpeg.deleteFile(tempPath);
        
        return totalSeconds;
      }
    } catch (error) {
      console.warn('Lỗi khi đọc thời lượng từ FFmpeg:', error);
    }
    
    // Xóa file tạm
    await ffmpeg.deleteFile(tempPath);
    
    // Nếu không thể đọc được thời lượng, trả về thời lượng mặc định
    console.warn('Không thể đọc thời lượng audio, sử dụng thời lượng mặc định');
    return 5;    
  } catch (error) {
    console.error('Lỗi khi đọc thời lượng audio:', error);
    return 5;
  }
};

// Hàm tạo video từ script
export const generateVideoFromScript = async (ffmpeg, script, onProgress) => {
  try {
    console.log('Bắt đầu xử lý script:', script);
    
    if (script.version !== "1.0") {
      throw new Error('Phiên bản script không được hỗ trợ');
    }

    const { scenes, output, global } = script;
    console.log(`Tổng số scene cần xử lý: ${scenes.length}`);
    console.log('Cài đặt video:', output);
    console.log('Cài đặt toàn cục:', global);

    // Xử lý từng scene
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      console.log(`Đang xử lý scene ${i + 1}/${scenes.length}`);

      // Xác định thời lượng scene từ audio
      let sceneDuration = 5; // Thời lượng mặc định
      if (scene.audio?.source) {
        try {
          console.log(`Đang đọc thời lượng audio cho scene ${i + 1}`);
          sceneDuration = await getAudioDuration(ffmpeg, scene.audio.source);
          console.log(`Thời lượng audio scene ${i + 1}: ${sceneDuration} giây`);
        } catch (error) {
          console.warn(`Không thể đọc thời lượng audio scene ${i + 1}, sử dụng thời lượng mặc định:`, error);
        }
      }

      // Tải và xử lý ảnh
      try {
        const imageResponse = await fetch(scene.image.source);
        const imageBlob = await imageResponse.blob();
        const imageBuffer = await imageBlob.arrayBuffer();
        await ffmpeg.writeFile(`scene_${i}_image.jpg`, new Uint8Array(imageBuffer));
        console.log(`Đã tải ảnh cho scene ${i + 1}`);
      } catch (error) {
        throw new Error(`Lỗi khi tải ảnh scene ${i + 1}: ${error.message}`);
      }

      // Xử lý audio nếu có
      let audioPath = null;
      if (scene.audio) {
        try {
          console.log(`Đang xử lý audio cho scene ${i + 1}`);
          const audioBlob = await base64ToBlob(scene.audio.source);
          audioPath = await processAudioWithFFmpeg(ffmpeg, audioBlob, i, {
            volume: scene.audio.volume || 1,
            fadeIn: scene.audio.fadeIn || 0,
            fadeOut: scene.audio.fadeOut || 0,
            duration: sceneDuration
          });
          console.log(`Đã xử lý xong audio cho scene ${i + 1}`);
        } catch (error) {
          throw new Error(`Lỗi khi xử lý audio scene ${i + 1}: ${error.message}`);
        }
      }

      // Tạo filter string cho scene
      const imageFilters = [];
      if (scene.image?.filters) {
        const { scale, rotation, brightness, contrast, saturation, hue, blur } = scene.image.filters;
        
        if (scale !== 1 || rotation !== 0) {
          imageFilters.push(`scale=iw*${scale}:ih*${scale},rotate=${rotation}*PI/180`);
        }
        
        if (brightness !== 0 || contrast !== 1 || saturation !== 1 || hue !== 0) {
          imageFilters.push(`eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}:hue=${hue}`);
        }
        
        if (blur > 0) {
          imageFilters.push(`boxblur=${blur}`);
        }
      }

      // Lấy thông tin về kích thước output video từ script hoặc giá trị mặc định
      const resolution = output.resolution || '854x480';
      const [outputWidth, outputHeight] = resolution.split('x').map(Number);
      
      // Lưu thông tin kích thước vào scene nếu chưa có
      if (!scene.output) {
        scene.output = { resolution, width: outputWidth, height: outputHeight };
      }
      
      // Nếu không có thông tin về kích thước preview, sử dụng kích thước output
      if (!scene.scenePreviewDimensions) {
        scene.scenePreviewDimensions = {
          width: outputWidth,
          height: outputHeight
        };
      }
      
      // Xử lý overlays
      const overlayFilters = await processSceneOverlays(scene, i);
      const allFilters = [...imageFilters, ...overlayFilters];
      
      // Tạo lệnh FFmpeg cho scene
      let ffmpegCommand = [
        '-loop', '1',  // Lặp lại ảnh
        '-i', `scene_${i}_image.jpg`,
        '-t', sceneDuration.toString()  // Đặt thời lượng cho scene
      ];

      if (audioPath) {
        ffmpegCommand.push('-i', audioPath);
      }

      if (allFilters.length > 0) {
        ffmpegCommand.push('-vf', allFilters.join(','));
      }

      // Thêm các tham số output
      ffmpegCommand.push(
        '-c:v', output.codec || 'libx264',
        '-preset', output.preset || 'medium',
        '-crf', (output.crf || 23).toString(),
        '-r', (output.fps || 30).toString(),
        '-s', output.resolution || '854x480',
        '-pix_fmt', 'yuv420p',
        '-shortest',  // Kết thúc khi stream ngắn nhất kết thúc
        '-y',
        `scene_${i}.mp4`
      );

      // Thực thi lệnh FFmpeg
      try {
        const ffmpegCommandStr = ffmpegCommand.join(' ');
        console.log(`Lệnh FFmpeg cho scene ${i + 1}:`, ffmpegCommandStr);
        
        // Kiểm tra lệnh FFmpeg trước khi thực thi để đảm bảo không có vấn đề với text
        // Nếu là overlay text, đảm bảo nội dung text được hiển thị đúng
        if (ffmpegCommandStr.includes('drawtext=')) {
          const overlays = scene.overlays || [];
          const textOverlays = overlays.filter(o => o.type === 'text');
          
          if (textOverlays.length > 0) {
            console.log(`Text overlays in scene ${i + 1}:`);
            textOverlays.forEach((overlay, idx) => {
              console.log(`  [${idx}] Content: "${overlay.content}"`);
              console.log(`      Position: x=${overlay.position.x}${typeof overlay.position.x === 'number' ? '%' : ''}, y=${overlay.position.y}${typeof overlay.position.y === 'number' ? '%' : ''}`);
              
              // Check FFmpeg command for debug coordinates
              const debugPattern = new RegExp(`text='${overlay.content.replace(/'/g, "\\'")} \\(.*?\\)'`);
              if (debugPattern.test(ffmpegCommandStr)) {
                console.warn('⚠️ WARNING: Debug coordinates detected in text overlay! Please set showDebugInfo to false.');
              }
            });
          }
        }
        
        await ffmpeg.exec(ffmpegCommand);
        console.log(`Đã xử lý xong scene ${i + 1}`);
      } catch (error) {
        console.error(`Chi tiết lỗi FFmpeg cho scene ${i + 1}:`, error);
        throw new Error(`Lỗi khi xử lý scene ${i + 1}: ${error.message || 'Không xác định'}`);
      }

      // Cập nhật tiến trình
      onProgress(((i + 1) / scenes.length) * 100);
    }

    // Nối các scene lại với nhau
    console.log('Đang nối các scene...');
    const concatFile = scenes.map((_, i) => `file scene_${i}.mp4`).join('\n');
    await ffmpeg.writeFile('concat.txt', concatFile);

    try {
      const concatCommand = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        '-y',
        'output.mp4'
      ];
      console.log('Lệnh nối video:', concatCommand.join(' '));
      await ffmpeg.exec(concatCommand);
      console.log('Đã nối các scene thành công');
    } catch (error) {
      console.error('Chi tiết lỗi khi nối video:', error);
      throw new Error(`Lỗi khi nối các scene: ${error.message || 'Không xác định'}`);
    }

    // Đọc file output
    const data = await ffmpeg.readFile('output.mp4');
    if (!data || data.byteLength === 0) {
      throw new Error('File video output trống hoặc không tồn tại');
    }
    const videoBlob = new Blob([data], { type: 'video/mp4' });

    // Dọn dẹp file tạm
    try {
      for (let i = 0; i < scenes.length; i++) {
        await ffmpeg.deleteFile(`scene_${i}_image.jpg`);
        await ffmpeg.deleteFile(`scene_${i}_audio_temp.mp3`);
        await ffmpeg.deleteFile(`scene_${i}_audio.mp3`);
        await ffmpeg.deleteFile(`scene_${i}.mp4`);
      }
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile('output.mp4');
      console.log('Đã dọn dẹp file tạm');
    } catch (error) {
      console.warn('Lỗi khi dọn dẹp file tạm:', error);
    }

    return videoBlob;

  } catch (error) {
    console.error('Lỗi trong quá trình tạo video:', error);
    throw error;
  }
};
