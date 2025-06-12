import { FFmpeg } from '@ffmpeg/ffmpeg';
import { applyImageFilters, createAdvancedTextOverlay, processAdvancedAudio, createImageOverlay, createTextOverlayFilter } from './overlayUtils';

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

      // Xác định thời lượng scene
      let sceneDuration = scene.duration || 5;

      // Tải và xử lý ảnh
      try {
        console.log(`Bắt đầu tải ảnh cho scene ${i + 1} từ nguồn:`, scene.image.source);
        const imageResponse = await fetch(scene.image.source);
        
        if (!imageResponse.ok) {
          throw new Error(`HTTP error! status: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        if (imageBlob.size === 0) {
          throw new Error('Kích thước ảnh bằng 0');
        }
        
        const imageBuffer = await imageBlob.arrayBuffer();
        await ffmpeg.writeFile(`scene_${i}_image.jpg`, new Uint8Array(imageBuffer));
        console.log(`Đã tải ảnh cho scene ${i + 1}, kích thước: ${imageBlob.size} bytes`);
      } catch (error) {
        console.error(`Chi tiết lỗi khi tải ảnh scene ${i + 1}:`, error);
        throw new Error(`Lỗi khi tải ảnh scene ${i + 1}: ${error.message}`);
      }

      // Xử lý audio nếu có
      let audioPath = null;
      if (scene.audio) {
        try {
          console.log(`Đang xử lý audio nâng cao cho scene ${i + 1}`);
          audioPath = await processAdvancedAudio(
            ffmpeg, 
            scene.audio.source, 
            i, 
            {
              volume: scene.audio.volume || 1,
              fadeIn: scene.audio.fadeIn || 0,
              fadeOut: scene.audio.fadeOut || 0,
              duration: sceneDuration,
              equalizer: scene.audio.equalizer || null,
              bass: scene.audio.bass || 0,
              treble: scene.audio.treble || 0,
              normalize: scene.audio.normalize || false,
              pitch: scene.audio.pitch || 1,
              tempo: scene.audio.tempo || 1
            }
          );
          console.log(`Đã xử lý xong audio nâng cao cho scene ${i + 1}`);
        } catch (error) {
          throw new Error(`Lỗi khi xử lý audio scene ${i + 1}: ${error.message}`);
        }
      }

      // Tạo filter string cho scene
      const imageFilters = [];
      if (scene.image?.filters) {
        const imageFilterString = applyImageFilters(scene.image.filters);
        if (imageFilterString) {
          imageFilters.push(imageFilterString);
        }
      }

      // Xử lý overlays
      const overlayResult = await processSceneOverlays(scene, i, ffmpeg);
      const overlayFilters = overlayResult.filterComplex;
      const overlayInputs = overlayResult.inputs;

      // Kết hợp tất cả các filter
      const allFilters = [...imageFilters];
      if (overlayFilters) {
        allFilters.push(overlayFilters);
      }

      // Tạo lệnh FFmpeg cho scene
      const ffmpegCommand = [
        '-loop', '1',
        '-i', `scene_${i}_image.jpg`,
        '-t', sceneDuration.toString()
      ];

      // Thêm audio input nếu có
      if (audioPath) {
        ffmpegCommand.push('-i', audioPath);
      }

      // Thêm các input cho overlay
      for (const input of overlayInputs) {
        ffmpegCommand.push('-loop', '1', '-i', input.path);
      }

      if (allFilters.length > 0) {
        ffmpegCommand.push('-filter_complex', `${allFilters.join(';')}`);
        // Thêm mapping cho output video và audio
        ffmpegCommand.push('-map', '[outv]');
        if (audioPath) {
          ffmpegCommand.push('-map', '1:a');
        }
      }

      // Thêm các tham số output
      ffmpegCommand.push(
        '-c:v', output.codec || 'libx264',
        '-preset', output.preset || 'medium',
        '-crf', (output.crf || 23).toString(),
        '-r', (output.fps || 30).toString(),
        '-s', output.resolution || '854x480',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        '-y',
        `scene_${i}.mp4`
      );

      // Thực thi lệnh FFmpeg
      try {
        console.log(`Lệnh FFmpeg cho scene ${i + 1}:`, ffmpegCommand.join(' '));
        await ffmpeg.exec(ffmpegCommand);
        console.log(`Đã xử lý xong scene ${i + 1}`);
        
        // Verify the scene file was created successfully
        try {
          const sceneFile = await ffmpeg.readFile(`scene_${i}.mp4`);
          if (!sceneFile || sceneFile.byteLength === 0) {
            throw new Error(`Scene ${i + 1} file not created properly: empty or missing`);
          }
          console.log(`Scene ${i + 1} file verified, size: ${sceneFile.byteLength} bytes`);
        } catch (verifyError) {
          console.error(`Error verifying scene ${i + 1} file:`, verifyError);
          throw new Error(`Scene ${i + 1} verification failed: ${verifyError.message}`);
        }
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
    await ffmpeg.writeFile('concat.txt', concatFile);    try {
      // Verify concat.txt was written correctly
      const concatContent = await ffmpeg.readFile('concat.txt');
      if (!concatContent || concatContent.byteLength === 0) {
        throw new Error('Concat file empty or not created');
      }
      console.log('Concat file verified:', new TextDecoder().decode(concatContent));
      
      // Check if all scene files exist
      for (let i = 0; i < scenes.length; i++) {
        try {
          const sceneFile = await ffmpeg.readFile(`scene_${i}.mp4`);
          if (!sceneFile || sceneFile.byteLength === 0) {
            console.warn(`Scene file scene_${i}.mp4 is empty or missing`);
          } else {
            console.log(`Scene file scene_${i}.mp4 exists with size ${sceneFile.byteLength} bytes`);
          }
        } catch (err) {
          console.error(`Cannot read scene file scene_${i}.mp4:`, err);
        }
      }

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
      
      // Verify output.mp4 exists
      try {
        const outputCheck = await ffmpeg.readFile('output.mp4');
        if (!outputCheck || outputCheck.byteLength === 0) {
          throw new Error('Output file was not created or is empty');
        }
        console.log(`Output file verified: ${outputCheck.byteLength} bytes`);
      } catch (verifyError) {
        console.error('Failed to verify output file:', verifyError);
        throw new Error(`Output file verification failed: ${verifyError.message}`);
      }
    } catch (error) {
      console.error('Chi tiết lỗi khi nối video:', error);
      throw new Error(`Lỗi khi nối các scene: ${error.message || 'Không xác định'}`);
    }    // Đọc file output
    let videoBlob;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Đang đọc file output video... (attempt ${retryCount + 1}/${maxRetries})`);
        
        // List the files in the FFmpeg filesystem to verify what's there
        const files = await ffmpeg.listDir('/');
        console.log('Files in FFmpeg filesystem:', files);
        
        // Delay slightly to ensure filesystem operations are complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const data = await ffmpeg.readFile('output.mp4');
        
        if (!data) {
          throw new Error('Không thể đọc file output video');
        }
        
        if (data.byteLength === 0) {
          throw new Error('File video output có kích thước 0 byte');
        }
        
        console.log(`Đã đọc file output video: ${data.byteLength} bytes`);
        videoBlob = new Blob([data], { type: 'video/mp4' });
        break; // Success! Exit the retry loop
      } catch (readError) {
        console.error(`Chi tiết lỗi khi đọc file output (attempt ${retryCount + 1}/${maxRetries}):`, readError);
        
        if (readError.message?.includes('FS error')) {
          console.log('Detected filesystem error, trying alternative approach...');
          
          try {
            // Try to rerun the concat command with different output name
            const altOutputName = `output_retry_${retryCount}.mp4`;
            console.log(`Trying to create alternative output: ${altOutputName}`);
            
            const concatCommand = [
              '-f', 'concat',
              '-safe', '0',
              '-i', 'concat.txt',
              '-c', 'copy',
              '-y',
              altOutputName
            ];
            
            await ffmpeg.exec(concatCommand);
            console.log(`Successfully created alternative output: ${altOutputName}`);
            
            const altData = await ffmpeg.readFile(altOutputName);
            if (altData && altData.byteLength > 0) {
              console.log(`Read alternative output successfully: ${altData.byteLength} bytes`);
              videoBlob = new Blob([altData], { type: 'video/mp4' });
              break; // Success with alternative approach
            }
          } catch (altError) {
            console.error('Alternative approach failed:', altError);
          }
        }
        
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new Error(`Lỗi khi đọc file video output sau ${maxRetries} lần thử: ${readError.message}`);
        }
        
        // Wait before retrying
        console.log(`Waiting before retry attempt ${retryCount + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

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

// Hàm khởi tạo FFmpeg và load font
export const initFFmpeg = async () => {  
  try {
    console.log('Starting FFmpeg initialization...');
    const ffmpeg = new FFmpeg();
    
    // Set up logging to help with debugging
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg log:', message);
    });
    
    // Load the FFmpeg instance
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');
      // Verify FFmpeg is working by performing a simple operation
    try {
      await ffmpeg.writeFile('test.txt', new Uint8Array([116, 101, 115, 116])); // "test" in ASCII
      const testData = await ffmpeg.readFile('test.txt');
      
      if (testData && testData.byteLength > 0) {
        console.log('FFmpeg file system verified working');
      } else {
        console.warn('FFmpeg file system test returned empty file');
      }
      
      await ffmpeg.deleteFile('test.txt');
    } catch (testError) {
      console.error('FFmpeg filesystem test failed:', testError);
      console.log('Continuing despite filesystem test failure');
    }
      
    // Improved font loading with better error handling and verification
    const loadFontToFFmpeg = async (fontPath, targetName) => {
      console.log(`Attempting to load font from ${fontPath}...`);
      try {
        const response = await fetch(fontPath);
        if (!response.ok) {
          console.warn(`Failed to load font from ${fontPath}: HTTP ${response.status}`);
          return false;
        }
        
        const fontData = await response.arrayBuffer();
        if (!fontData || fontData.byteLength === 0) {
          console.warn(`Font data from ${fontPath} is empty`);
          return false;
        }
        
        // Write the font file to FFmpeg's virtual filesystem
        await ffmpeg.writeFile(targetName, new Uint8Array(fontData));
        
        // Verify the font was written correctly
        const fontCheck = await ffmpeg.readFile(targetName);
        if (!fontCheck || fontCheck.byteLength === 0) {
          console.warn(`Font verification failed for ${targetName}`);
          return false;
        }
        
        console.log(`Successfully loaded font from ${fontPath} (${fontCheck.byteLength} bytes)`);
        return true;
      } catch (error) {
        console.warn(`Error loading font from ${fontPath}:`, error);
        return false;
      }
    };
    
    // List of possible font paths to try, in order of preference
    const fontPaths = [
      '/fonts/ARIAL.TTF',
      '/fonts/arial.ttf',
      '/public/fonts/ARIAL.TTF',
      '/assets/fonts/ARIAL.TTF'
    ];
    
    let fontLoaded = false;
    for (const fontPath of fontPaths) {
      fontLoaded = await loadFontToFFmpeg(fontPath, 'arial.ttf');
      if (fontLoaded) break;
    }
    
    if (!fontLoaded) {
      console.error('WARNING: Failed to load any font - text overlays may not work correctly');
      // Create a visible warning in the console
      console.warn('%c⚠️ FONT LOADING FAILED - Text overlays will not work correctly! ⚠️', 
                  'background: #FFF3CD; color: #856404; font-size: 14px; padding: 5px;');
    } else {
      // Add additional font check
      try {
        // List the files in FFmpeg's virtual filesystem to verify
        const files = await ffmpeg.listDir('/');
        console.log('Files in FFmpeg filesystem:', files);
        
        // Check if our font is there
        const fontExists = files.some(file => 
          file.name.toLowerCase() === 'arial.ttf' || 
          file.name.toLowerCase() === 'arial.ttf.tmp'
        );
        
        if (!fontExists) {
          console.warn('Font file not found in FFmpeg filesystem after loading!');
        } else {
          console.log('Font file verified in FFmpeg filesystem');
        }
      } catch (e) {
        console.warn('Error when checking FFmpeg filesystem:', e);
      }
    }
    
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    return null;
  }
};

// Hàm xử lý các overlay trong một scene
const processSceneOverlays = async (scene, sceneIndex, ffmpeg) => {
  try {
    if (!scene.overlays || scene.overlays.length === 0) {
      return {
        filterComplex: '',
        inputs: []
      };
    }
    
    let allFilters = [];
    let currentVideoStream = '[0:v]'; // Stream video gốc
    let overlayIndex = 1;
    let inputIndex = 1; // Index cho các input mới
    let ffmpegInputs = []; // Mảng chứa các input cần thêm vào lệnh FFmpeg

    // Xử lý text overlays trước
    for (const overlay of scene.overlays) {
      if (overlay.type === 'text' || overlay.type === 'text_overlay') {
        let textFilter = '';
        if (overlay.type === 'text') {
          textFilter = await createTextOverlayFilter(overlay, overlayIndex);
        } else {
          textFilter = await createGlobalTextOverlayFilter(overlay, overlayIndex);
        }
        
        if (textFilter) {
          // Thay thế output label để tránh xung đột
          textFilter = textFilter.replace(/\[v\d+\]$/, '[base]');
          allFilters.push(textFilter);
          currentVideoStream = '[base]';
          overlayIndex++;
        }
      }
    }

    // Sau đó xử lý image overlays
    for (const overlay of scene.overlays) {
      if (overlay.type === 'image') {
        try {
          const imageResponse = await fetch(overlay.source);
          if (!imageResponse.ok) {
            throw new Error(`HTTP error! status: ${imageResponse.status}`);
          }
          const imageBlob = await imageResponse.blob();
          const imageBuffer = await imageBlob.arrayBuffer();
          const overlayPath = `overlay_${inputIndex}.png`;
          await ffmpeg.writeFile(overlayPath, new Uint8Array(imageBuffer));
          
          ffmpegInputs.push({
            path: overlayPath,
            index: inputIndex
          });
          
          const overlayFilter = await createImageOverlay(ffmpeg, overlay, inputIndex);
          if (overlayFilter) {
            // Điều chỉnh input stream index và output label
            const adjustedFilter = overlayFilter
              .replace(/\[\d+:v\]/, `[${inputIndex + 1}:v]`)
              .replace(/\[v\d+\]$/, '[outv]');
            allFilters.push(adjustedFilter);
            inputIndex++;
          }
        } catch (error) {
          console.error(`Lỗi khi xử lý image overlay:`, error);
        }
      }
    }

    // Kết hợp tất cả các filter
    const finalFilterComplex = allFilters.join(';');
    console.log('Final filter complex:', finalFilterComplex);
    
    return {
      filterComplex: finalFilterComplex,
      inputs: ffmpegInputs
    };
  } catch (error) {
    console.error(`Lỗi khi xử lý overlays cho scene ${sceneIndex}:`, error);
    return {
      filterComplex: '',
      inputs: []
    };
  }
};

// Hàm tạo filter cho text overlay
// const createTextOverlayFilter = async (overlay, index) => {
//   try {
//     const { content, position, style } = overlay;
//     const { x, y } = position;
//     const { color, fontSize, fontFamily } = style;
    
//     const escapedContent = content.replace(/'/g, "\\'");
//     const actualFontSize = fontSize || 24;
//     const hexColor = color?.replace('#', '') || 'FFFFFF';
    
//     const boxOpacity = 0.5;
//     const borderWidth = 5;
//     const shadowX = 2;
//     const shadowY = 2;
//     const shadowOpacity = 0.4;
    
//     let textExpression = `drawtext=text='${escapedContent}'`;
    
//     // Thêm vị trí
//     textExpression += `:x=${x}:y=${y}`;
    
//     // Thêm font và kích thước
//     textExpression += `:fontsize=${actualFontSize}`;
//     textExpression += `:fontfile=arial.ttf`;
    
//     // Thêm màu chữ
//     textExpression += `:fontcolor=0x${hexColor}`;
    
//     // Thêm box và border
//     textExpression += `:box=1`;
//     textExpression += `:boxcolor=black@${boxOpacity}`;
//     textExpression += `:boxborderw=${borderWidth}`;
    
//     // Thêm shadow
//     textExpression += `:shadowx=${shadowX}`;
//     textExpression += `:shadowy=${shadowY}`;
//     textExpression += `:shadowcolor=black@${shadowOpacity}`;
    
//     // Xử lý animation nếu có
//     if (overlay.animation) {
//       const { type, duration, delay } = overlay.animation;
      
//       switch (type) {
//         case 'fade':
//           const fadeIn = overlay.animation.fadeIn || 1;
//           const fadeOut = overlay.animation.fadeOut;
          
//           if (fadeIn > 0) {
//             textExpression += `:enable='between(t,${delay},${delay + duration})'`;
//             textExpression += `:alpha='if(lt(t,${delay}),0,if(lt(t,${delay + fadeIn}),(t-${delay})/${fadeIn},`;
            
//             if (fadeOut > 0 && duration > fadeOut) {
//               const fadeOutStart = duration - fadeOut;
//               textExpression += `if(lt(t,${delay + fadeOutStart}),1,(${delay + duration}-t)/${fadeOut})))'`;
//             } else {
//               textExpression += `1))'`;
//             }
//           }
//           break;
          
//         case 'slide':
//           const direction = overlay.animation.direction || 'left';
//           const slideSpeed = overlay.animation.speed || 1;
          
//           if (direction === 'left') {
//             textExpression += `:x='if(lt(t,${delay}),w,max(${x},w-(t-${delay})*${slideSpeed*100}))'`;
//           } else if (direction === 'right') {
//             textExpression += `:x='if(lt(t,${delay}),-w,min(${x},(t-${delay})*${slideSpeed*100}-w))'`;
//           } else if (direction === 'top') {
//             textExpression += `:y='if(lt(t,${delay}),-h,min(${y},(t-${delay})*${slideSpeed*100}-h))'`;
//           } else if (direction === 'bottom') {
//             textExpression += `:y='if(lt(t,${delay}),h,max(${y},h-(t-${delay})*${slideSpeed*100}))'`;
//           }
//           break;
//       }
//     }
    
//     console.log(`[Text Overlay ${index}] Created filter with content: "${escapedContent}", position: (${x}, ${y}), size: ${actualFontSize}`);
//     return textExpression;
//   } catch (error) {
//     console.error(`[Text Overlay ${index}] Error creating filter:`, error);
//     return null;
//   }
// };

// Hàm tạo filter cho sticker overlay
const createStickerOverlayFilter = async (overlay, index) => {
  try {
    const { content, position, transform } = overlay;
    const { x, y } = position;
    const { scale, rotation } = transform;
    
    // Tạo file tạm cho sticker
    const stickerPath = `sticker_${index}.png`;
    // TODO: Xử lý chuyển đổi sticker content thành file ảnh
    
    const stickerExpression = `movie=${stickerPath}` +
                            `,scale=iw*${scale}:ih*${scale}` +
                            `,rotate=${rotation}*PI/180` +
                            `[sticker${index}];` +
                            `[0:v][sticker${index}]overlay=${x}:${y}`;
    
    console.log(`[Sticker Overlay ${index}] Created filter with position: (${x}, ${y}), scale: ${scale}, rotation: ${rotation}`);
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
    
    // Đặt label cho output stream
    const outLabel = `v${index}`;
    
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
                    `:boxborderw=5`;
    
    // Thêm output label
    textExpression += `[${outLabel}]`;
    
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
    
    // Đặt label cho output stream
    const outLabel = `v${index}`;
    const watermarkLabel = `wm${index}`;
    
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
    
    const watermarkExpression = `movie=${watermarkPath},format=rgba,colorchannelmixer=aa=${opacity}[${watermarkLabel}];` +
                              `[0:v][${watermarkLabel}]overlay=${xPosition}:${yPosition}[${outLabel}]`;
    
    console.log(`[Watermark ${index}] Created filter with position: ${position}, opacity: ${opacity}`);
    return watermarkExpression;
  } catch (error) {
    console.error(`[Watermark ${index}] Error creating filter:`, error);
    return null;
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

