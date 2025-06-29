import { FFmpeg } from '@ffmpeg/ffmpeg';
// import { processAdvancedAudio } from './overlayUtils';
import { formatTextForVideo } from './textUtils';
// import { getAudioDuration } from './videoUtils';



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

// Hàm tính toán offset cho xfade transition
const calculateTransitionOffsets = (scenes, individualTransitions = []) => {
  const offsets = [];
  let currentTime = 0;
  
  console.log('=== CALCULATING TRANSITION OFFSETS ===');
  console.log('Scenes:', scenes.map(s => ({ id: s.id, duration: s.duration })));
  console.log('Individual transitions:', individualTransitions);
  
  for (let i = 0; i < scenes.length - 1; i++) {
    const sceneDuration = scenes[i].duration || 5;
    
    // Lấy transition duration cho cặp scene này
    let transitionDuration = 1; // Default
    if (individualTransitions && individualTransitions[i]) {
      transitionDuration = individualTransitions[i].duration || 1;
    }
    
    // Offset = thời điểm bắt đầu transition (cuối scene hiện tại - thời gian transition)
    const offset = currentTime + sceneDuration - transitionDuration;
    const finalOffset = Math.max(0, offset); // Đảm bảo offset không âm
    
    offsets.push(finalOffset);
    
    console.log(`Scene ${i} (${scenes[i].id}):`, {
      sceneDuration,
      currentTime,
      transitionDuration,
      calculatedOffset: offset,
      finalOffset,
      transitionType: individualTransitions[i]?.type || 'none'
    });
    
    currentTime += sceneDuration;
  }
  
  console.log('Final offsets:', offsets);
  return offsets;
};

// Hàm xử lý transition effects giữa các scene sử dụng xfade
const createTransitionFilter = (transitionType, duration, sceneCount, scenes = [], individualTransitions = []) => {
  try {
    console.log('createTransitionFilter called with:', {
      transitionType,
      duration,
      sceneCount,
      scenesLength: scenes.length,
      individualTransitions: individualTransitions || []
    });
    
    if (sceneCount <= 1) {
      console.log('Scene count <= 1, returning null');
      return null;
    }

    // Validate transition settings
    const { validatedTransitions, issues } = validateTransitionSettings(scenes, individualTransitions);
    
    // Sử dụng validated transitions thay vì original
    const validIndividualTransitions = validatedTransitions.map(vt => ({
      ...vt,
      type: vt.type,
      duration: vt.duration
    }));

    // Tạo transition preview
    const preview = createTransitionPreview(scenes, validIndividualTransitions);

    // Tính toán offset chính xác dựa trên thời lượng thực tế của scenes
    const offsets = calculateTransitionOffsets(scenes, validIndividualTransitions);
    
    // Tạo transition cho tất cả các cặp scene liên tiếp
    let filterComplex = '';
    let hasAnyTransition = false;
    
    for (let i = 0; i < sceneCount - 1; i++) {
      const currentScene = i === 0 ? `[${i}:v]` : `[v${i-1}]`;
      const nextScene = `[${i + 1}:v]`;
      const outputLabel = i === sceneCount - 2 ? '[outv]' : `[v${i}]`;
      
      console.log(`Processing transition ${i}:`, {
        currentScene,
        nextScene,
        outputLabel,
        individualTransition: individualTransitions?.[i]
      });
      
      // Sử dụng offset đã tính toán
      const currentOffset = offsets[i] || (i * 4); // Fallback nếu không có offset
      
      // Lấy transition type và duration từ individualTransitions nếu có
      let currentTransitionType = transitionType;
      let transitionDuration = duration;
      
      if (validIndividualTransitions && validIndividualTransitions[i]) {
        const individualTransition = validIndividualTransitions[i];
        console.log(`Individual transition ${i}:`, individualTransition);
        
        if (individualTransition.type !== 'none') {
          currentTransitionType = individualTransition.type;
          transitionDuration = individualTransition.duration || 1;
          console.log(`Using individual transition: ${currentTransitionType} (${transitionDuration}s) at offset ${currentOffset}`);
        } else {
          console.log(`Individual transition ${i} is 'none', using concat`);
          // Nếu transition là 'none', sử dụng concat đơn giản cho cặp này
          const concatFilter = `${currentScene}${nextScene}concat=n=2:v=1:a=0${outputLabel}`;
          if (filterComplex) {
            filterComplex += ';' + concatFilter;
          } else {
            filterComplex = concatFilter;
          }
          continue;
        }
      } else {
        console.log(`No individual transition for ${i}, using global: ${currentTransitionType} (${transitionDuration}s) at offset ${currentOffset}`);
      }
      
      // Nếu không có individualTransitions hoặc transition type là 'none', sử dụng concat
      if (currentTransitionType === 'none') {
        const concatFilter = `${currentScene}${nextScene}concat=n=2:v=1:a=0${outputLabel}`;
        if (filterComplex) {
          filterComplex += ';' + concatFilter;
        } else {
          filterComplex = concatFilter;
        }
        continue;
      }
      
      hasAnyTransition = true;
      
      // Đảm bảo transition duration không quá ngắn
      const minDuration = 0.5;
      const maxDuration = 3.0;
      const adjustedDuration = Math.max(minDuration, Math.min(maxDuration, transitionDuration));
      
      if (adjustedDuration !== transitionDuration) {
        console.log(`Adjusted transition duration from ${transitionDuration}s to ${adjustedDuration}s`);
        transitionDuration = adjustedDuration;
      }
      
      console.log(`Creating transition filter: ${currentTransitionType} with duration ${transitionDuration}s at offset ${currentOffset}`);
      
      let transitionFilter;
      switch (currentTransitionType) {
        case 'fade':
          // Fade transition - mượt mà nhất
          transitionFilter = `xfade=transition=fade:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'slide':
          // Slide transition - trượt từ trái sang phải
          transitionFilter = `xfade=transition=slideleft:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'zoom':
          // Zoom transition - phóng to/thu nhỏ
          transitionFilter = `xfade=transition=zoomin:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'blur':
          // Blur transition - làm mờ chuyển đổi
          transitionFilter = `xfade=transition=fadeblack:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'wipe':
          // Wipe transition - quét từ phải sang trái
          transitionFilter = `xfade=transition=wiperight:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'dissolve':
          // Dissolve transition - hòa tan
          transitionFilter = `xfade=transition=dissolve:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'hblur':
          // Horizontal blur transition - fallback to fade if not supported
          transitionFilter = `xfade=transition=fade:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'vblur':
          // Vertical blur transition - fallback to fade if not supported
          transitionFilter = `xfade=transition=fade:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'smoothleft':
          // Smooth left transition
          transitionFilter = `xfade=transition=slideleft:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'smoothright':
          // Smooth right transition
          transitionFilter = `xfade=transition=slideright:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'smoothup':
          // Smooth up transition
          transitionFilter = `xfade=transition=slideup:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        case 'smoothdown':
          // Smooth down transition
          transitionFilter = `xfade=transition=slidedown:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
          
        default:
          // Fallback to fade for unknown transition types
          console.warn(`Unknown transition type: ${currentTransitionType}, falling back to fade`);
          transitionFilter = `xfade=transition=fade:duration=${transitionDuration}:offset=${currentOffset}`;
          break;
      }
      
      console.log(`Created transition filter for ${i}: ${transitionFilter}`);
      
      // Thêm transition filter vào filter complex
      const fullFilter = `${currentScene}${nextScene}${transitionFilter}${outputLabel}`;
      if (filterComplex) {
        filterComplex += ';' + fullFilter;
      } else {
        filterComplex = fullFilter;
      }
    }
    
    console.log('Final filter complex:', filterComplex);
    console.log('Has any transition:', hasAnyTransition);
    
    if (hasAnyTransition) {
      console.log('=== TRANSITION TIPS ===');
      console.log('• Transition duration should be between 0.5s and 3.0s for best visibility');
      console.log('• Scene duration should be longer than transition duration');
      console.log('• Fade transitions are the most reliable');
      console.log('• Slide transitions work well for horizontal movement');
      console.log('• Zoom transitions create dramatic effects');
    }
    
    return hasAnyTransition ? filterComplex : null;
  } catch (error) {
    console.error('Error in createTransitionFilter:', error);
    return null;
  }
};

// Hàm tạo video từ script
export const generateVideoFromScript = async (ffmpeg, script, onProgress) => {
  try {
    console.log('=== STARTING VIDEO GENERATION ===');
    console.log('Script received:', script);
    
    // Test transition effects
    const transitionTest = testTransitionEffects(script);
    console.log('Transition test result:', transitionTest);
    
    if (!ffmpeg) {
      throw new Error('FFmpeg is not initialized');
    }

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
          console.log(`Đang xử lý audio cho scene ${i + 1}`);
          
          // Xử lý audio đơn giản thay vì dùng processAdvancedAudio
          if (scene.audio.source.startsWith('data:')) {
            // Nếu là base64, chuyển đổi thành file
            const audioData = scene.audio.source.split(',')[1];
            const audioBytes = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
            audioPath = `scene_${i}_audio_temp.mp3`;
            await ffmpeg.writeFile(audioPath, audioBytes);
          } else {
            // Nếu là URL, tải về và lưu
            const response = await fetch(scene.audio.source);
            const audioBytes = new Uint8Array(await response.arrayBuffer());
            audioPath = `scene_${i}_audio_temp.mp3`;
            await ffmpeg.writeFile(audioPath, audioBytes);
          }
          
          console.log(`Audio cho scene ${i + 1} đã được xử lý: ${audioPath}`);
        } catch (error) {
          throw new Error(`Lỗi khi xử lý audio scene ${i + 1}: ${error.message}`);
        }
      }

      // Tạo filter string cho scene
      const imageFilters = [];
      
      // Thêm filter để giữ nguyên aspect ratio
      const outputResolution = output.resolution || '854x480';
      const [targetWidth, targetHeight] = outputResolution.split('x').map(Number);
      
      // Xử lý overlays trước để biết có overlay không
      const overlayResult = await processSceneOverlays(scene, i, ffmpeg, true); // true vì có aspect ratio filter
      const overlayFilters = overlayResult.filterComplex;
      const overlayInputs = overlayResult.inputs;

      console.log(`[Scene ${i}] Overlay processing result:`, {
        hasOverlays: overlayResult.hasOverlays,
        filtersLength: overlayFilters?.length || 0,
        inputsCount: overlayInputs?.length || 0
      });

      // Scale và pad để giữ nguyên aspect ratio
      // Nếu có overlays → filter này sẽ được overlay sử dụng 
      // Nếu không có overlays → filter này cần output [outv]
      const hasOverlays = overlayResult.hasOverlays;
      const aspectRatioFilter = hasOverlays 
        ? `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black[scaled]`
        : `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black[outv]`;
      
      imageFilters.push(aspectRatioFilter);
      
      // Removed image filters processing as it causes syntax errors
      // TODO: Implement proper image filters if needed

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

      // Thêm audio input nếu có (luôn là input thứ 2)
      if (audioPath) {
        ffmpegCommand.push('-i', audioPath);
      }

      // Thêm các input cho overlay 
      if (overlayInputs && overlayInputs.length > 0) {
        for (const inputPath of overlayInputs) {
          ffmpegCommand.push('-loop', '1', '-i', inputPath);
        }
      }

      if (allFilters.length > 0) {
        ffmpegCommand.push('-filter_complex', allFilters.join(';'));
        // Mapping: video từ filter output, audio từ input 1 (audio)
        ffmpegCommand.push('-map', '[outv]');
        if (audioPath) {
          ffmpegCommand.push('-map', '1:a');
        }
      } else {
        // Nếu không có filter, map trực tiếp: video từ input 0, audio từ input 1
        ffmpegCommand.push('-map', '0:v');
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
        // Không dùng -s vì đã xử lý scale trong filter để giữ aspect ratio
        '-pix_fmt', 'yuv420p',
        '-fflags', '+genpts',  // Thêm genpts để đảm bảo timestamps chính xác
        '-shortest',  // Đảm bảo video dừng khi audio kết thúc
        '-y',
        `scene_${i}.mp4`
      );

      // Thực thi lệnh FFmpeg
      try {
        console.log(`Lệnh FFmpeg cho scene ${i + 1}:`, ffmpegCommand.join(' '));
        
        // Thêm logging chi tiết cho filter complex
        if (allFilters.length > 0) {
          console.log(`Filter complex cho scene ${i + 1}:`, allFilters.join(';'));
        } else {
          console.log(`Scene ${i + 1} không có filter complex`);
        }
        
        // Log thông tin scene
        console.log(`Scene ${i + 1} info:`, {
          duration: sceneDuration,
          hasAudio: !!audioPath,
          hasOverlays: !!(scene.overlays && scene.overlays.length > 0),
          overlayCount: scene.overlays ? scene.overlays.length : 0,
          filterCount: allFilters.length,
          imageSource: scene.image?.source
        });
        
        // Thực thi lệnh FFmpeg với timeout
        const ffmpegPromise = ffmpeg.exec(ffmpegCommand);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FFmpeg timeout after 300 seconds')), 300000)
        );
        
        console.log(`Bắt đầu thực thi FFmpeg cho scene ${i + 1}...`);
        const startTime = Date.now();
        
        await Promise.race([ffmpegPromise, timeoutPromise]);
        
        const endTime = Date.now();
        console.log(`FFmpeg hoàn thành scene ${i + 1} trong ${(endTime - startTime) / 1000} giây`);
        console.log(`Đã xử lý xong scene ${i + 1}`);
        
        // Verify the scene file was created successfully
        try {
          // Đợi một chút để đảm bảo file được ghi xong
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const sceneFile = await ffmpeg.readFile(`scene_${i}.mp4`);
          if (!sceneFile || sceneFile.byteLength === 0) {
            throw new Error(`Scene ${i + 1} file not created properly: empty or missing`);
          }
          console.log(`Scene ${i + 1} file verified, size: ${sceneFile.byteLength} bytes`);
        } catch (verifyError) {
          console.error(`Error verifying scene ${i + 1} file:`, verifyError);
          
          // Thử kiểm tra xem có file nào được tạo không
          try {
            const files = await ffmpeg.listDir('/');
            console.log('Files in FFmpeg filesystem after scene creation:', files);
          } catch (listError) {
            console.error('Cannot list files in FFmpeg filesystem:', listError);
          }
          
          throw new Error(`Scene ${i + 1} verification failed: ${verifyError.message}`);
        }
      } catch (error) {
        console.error(`Chi tiết lỗi FFmpeg cho scene ${i + 1}:`, error);
        
        // Thêm thông tin debug
        console.error(`Scene ${i + 1} details:`, {
          duration: sceneDuration,
          hasAudio: !!audioPath,
          hasOverlays: !!(scene.overlays && scene.overlays.length > 0),
          filterCount: allFilters.length,
          command: ffmpegCommand.join(' ')
        });
        
        // Nếu có lỗi với filter complex, thử tạo video đơn giản
        if (allFilters.length > 0 && error.message.includes('timeout')) {
          console.log(`Thử tạo video đơn giản cho scene ${i + 1} (không có overlay)...`);
          try {
            const simpleCommand = [
              '-loop', '1',
              '-i', `scene_${i}_image.jpg`,
              '-t', sceneDuration.toString(),
              '-vf', aspectRatioFilter, // Sử dụng filter để giữ aspect ratio
              '-c:v', 'libx264',
              '-preset', 'ultrafast',
              '-crf', '28',
              '-r', '24',
              '-pix_fmt', 'yuv420p',
              '-fflags', '+genpts',
              '-shortest',
              '-y',
              `scene_${i}.mp4`
            ];
            
            if (audioPath) {
              simpleCommand.splice(4, 0, '-i', audioPath);
              simpleCommand.push('-map', '0:v', '-map', '1:a');
            }
            
            console.log(`Lệnh FFmpeg đơn giản cho scene ${i + 1}:`, simpleCommand.join(' '));
            await ffmpeg.exec(simpleCommand);
            console.log(`Đã tạo video đơn giản cho scene ${i + 1}`);
            
            // Verify simple video
            const sceneFile = await ffmpeg.readFile(`scene_${i}.mp4`);
            if (sceneFile && sceneFile.byteLength > 0) {
              console.log(`Scene ${i + 1} simple video verified, size: ${sceneFile.byteLength} bytes`);
              continue; // Tiếp tục với scene tiếp theo
            }
          } catch (simpleError) {
            console.error(`Lỗi khi tạo video đơn giản cho scene ${i + 1}:`, simpleError);
          }
        }
        
        throw new Error(`Lỗi khi xử lý scene ${i + 1}: ${error.message || 'Không xác định'}`);
      }

      // Cập nhật tiến trình
      onProgress(((i + 1) / scenes.length) * 100);
    }

    // Nối các scene lại với nhau
    console.log('Đang nối các scene...');
    
    // Kiểm tra xem có transition effects không
    const hasIndividualTransitions = script.global?.transitions?.individualTransitions && 
                                    script.global.transitions.individualTransitions.some(t => t.type !== 'none');
    
    const hasGlobalTransitions = script.global?.transitions?.type && 
                                script.global.transitions.type !== 'none' && 
                                scenes.length > 1;
    
    const hasTransitions = hasIndividualTransitions || hasGlobalTransitions;
    
    console.log('=== TRANSITION DEBUG INFO ===');
    console.log('Script global transitions:', script.global?.transitions);
    console.log('Individual transitions:', script.global?.transitions?.individualTransitions);
    console.log('Global transition type:', script.global?.transitions?.type);
    console.log('Scenes length:', scenes.length);
    console.log('Transition check:', {
      hasIndividualTransitions,
      hasGlobalTransitions,
      hasTransitions,
      individualTransitions: script.global?.transitions?.individualTransitions,
      globalTransitionType: script.global?.transitions?.type,
      scenesLength: scenes.length,
      scriptGlobal: script.global
    });
    
    // Log chi tiết từng individual transition
    if (script.global?.transitions?.individualTransitions) {
      console.log('=== INDIVIDUAL TRANSITIONS DETAIL ===');
      script.global.transitions.individualTransitions.forEach((transition, index) => {
        console.log(`Transition ${index}:`, {
          fromScene: transition.fromScene,
          toScene: transition.toScene,
          type: transition.type,
          duration: transition.duration,
          isActive: transition.type !== 'none'
        });
      });
    }
    console.log('=== END TRANSITION DEBUG ===');
    
    if (hasTransitions) {
      // Sử dụng transition effects
      console.log('Sử dụng transition effects:', script.global.transitions);
      
      try {
        // Tạo filter complex cho transition
        const transitionFilter = createTransitionFilter(
          script.global.transitions.type || 'fade',
          script.global.transitions.duration || 1,
          scenes.length,
          scenes,
          script.global.transitions.individualTransitions
        );
        
        console.log('createTransitionFilter result:', transitionFilter);
        
        if (transitionFilter) {
          // Tạo audio filter để nối tất cả audio streams
          let audioFilter = '';
          let audioMapping = [];
          
          if (scenes.length > 1) {
            // Tạo filter để nối tất cả audio streams
            const audioStreams = scenes.map((_, i) => `[${i}:a]`).join('');
            audioFilter = `${audioStreams}concat=n=${scenes.length}:v=0:a=1[aout]`;
            audioMapping = ['-map', '[aout]'];
          } else {
            // Chỉ có 1 scene
            audioMapping = ['-map', '0:a?'];
          }
          
          // Kết hợp video và audio filter
          const combinedFilter = audioFilter ? 
            `${transitionFilter};${audioFilter}` : 
            transitionFilter;
          
          // Tạo lệnh FFmpeg với transition cho tất cả các scene
          const transitionCommand = [
            // Input tất cả các scene
            ...scenes.flatMap((_, i) => ['-i', `scene_${i}.mp4`]),
            // Filter complex cho transition và audio
            '-filter_complex', combinedFilter,
            // Output mapping
            '-map', '[outv]',
            // Audio mapping
            ...audioMapping,
            // Encoding settings
            '-c:v', output.codec || 'libx264',
            '-preset', output.preset || 'medium',
            '-crf', (output.crf || 23).toString(),
            '-r', (output.fps || 30).toString(),
            // Không dùng -s vì các scene đã có kích thước đúng với aspect ratio
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-fflags', '+genpts',
            '-async', '1',
            '-avoid_negative_ts', 'make_zero',
            '-y',
            'output.mp4'
          ];
          
          console.log('Lệnh FFmpeg với transition:', transitionCommand.join(' '));
          console.log('Transition filter:', transitionFilter);
          console.log('Full filter complex:', combinedFilter);
          console.log('Number of inputs:', scenes.length);
          console.log('Expected filter format: [0:v][1:v]xfade=transition=fade:duration=0.6:offset=5.444[outv]');
          
          await ffmpeg.exec(transitionCommand);
          console.log('Đã tạo video với transition effects thành công cho tất cả các scene');
        } else {
          throw new Error('Không thể tạo transition filter');
        }
      } catch (transitionError) {
        console.error('Lỗi khi tạo transition effects:', transitionError);
        console.log('Fallback về concat đơn giản...');
        
        // Fallback về concat đơn giản nếu transition thất bại
        const concatFile = scenes.map((_, i) => `file scene_${i}.mp4`).join('\n');
        await ffmpeg.writeFile('concat.txt', concatFile);
        
        const concatCommand = [
          '-f', 'concat',
          '-safe', '0',
          '-i', 'concat.txt',
          '-c:v', output.codec || 'libx264',
          '-c:a', 'aac',
          '-preset', output.preset || 'medium',
          '-crf', (output.crf || 23).toString(),
          '-r', (output.fps || 30).toString(),
          '-pix_fmt', 'yuv420p',
          '-fflags', '+genpts',
          '-async', '1',
          '-avoid_negative_ts', 'make_zero',
          '-y',
          'output.mp4'
        ];
        
        console.log('Lệnh nối video (fallback):', concatCommand.join(' '));
        await ffmpeg.exec(concatCommand);
        console.log('Đã nối các scene thành công (fallback)');
      }
    } else {
      // Sử dụng concat đơn giản nếu không có transition
      console.log('Sử dụng concat đơn giản (không có transition)');
      const concatFile = scenes.map((_, i) => `file scene_${i}.mp4`).join('\n');
      await ffmpeg.writeFile('concat.txt', concatFile);
      
      const concatCommand = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c:v', output.codec || 'libx264',
        '-c:a', 'aac',
        '-preset', output.preset || 'medium',
        '-crf', (output.crf || 23).toString(),
        '-r', (output.fps || 30).toString(),
        '-pix_fmt', 'yuv420p',
        '-fflags', '+genpts',
        '-async', '1',
        '-avoid_negative_ts', 'make_zero',
        '-y',
        'output.mp4'
      ];
      
      console.log('Lệnh nối video:', concatCommand.join(' '));
      await ffmpeg.exec(concatCommand);
      console.log('Đã nối các scene thành công');
    }

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

    // Đọc file output
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
      // Xóa concat.txt nếu tồn tại
      try {
        await ffmpeg.deleteFile('concat.txt');
      } catch (e) {
        // concat.txt có thể không tồn tại nếu dùng transition
        console.log('concat.txt không tồn tại hoặc đã được xóa');
      }
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

// Hàm xử lý từng overlay riêng lẻ
const processIndividualOverlay = async (
  overlay, 
  overlayIndex, 
  sceneIndex, 
  inputIndex, 
  ffmpeg,
  outputDimensions,
  previewDimensions,
  currentVideoStream,
  isLast
) => {
  console.log(`[Scene ${sceneIndex}] Processing individual overlay ${overlayIndex}:`, overlay.type);
  
  const nextLabel = isLast ? 'outv' : `v${overlayIndex + 1}`;
  
  switch (overlay.type) {
    case 'text':
    case 'label':
      return await processTextOverlay(
        overlay, 
        overlayIndex, 
        sceneIndex, 
        currentVideoStream, 
        nextLabel,
        outputDimensions,
        previewDimensions
      );
      
    case 'image':
      return await processImageOverlay(
        overlay, 
        overlayIndex, 
        sceneIndex, 
        inputIndex, 
        ffmpeg,
        currentVideoStream,
        nextLabel,
        outputDimensions,
        previewDimensions
      );
      
    case 'sticker':
      return await processStickerOverlay(
        overlay, 
        overlayIndex, 
        sceneIndex,
        currentVideoStream,
        nextLabel,
        outputDimensions,
        previewDimensions
      );
      
    default:
      console.warn(`[Scene ${sceneIndex}] Unknown overlay type: ${overlay.type}`);
      return null;
  }
};

// Hàm xử lý text overlay
const processTextOverlay = async (
  overlay, 
  overlayIndex, 
  sceneIndex, 
  currentVideoStream, 
  nextLabel,
  outputDimensions,
  previewDimensions
) => {
  try {
    const { content, position, style, timing } = overlay;
    
    // Chuyển đổi tọa độ từ preview sang output
    const outputPosition = convertCoordinatesToFFmpeg(position, previewDimensions, outputDimensions);
    
    // Xử lý nội dung text
    const formattedText = formatTextForVideo(content, outputDimensions.width, style.fontSize || 24);
    const escapedText = formattedText.replace(/'/g, "\\'");
    
    // Tạo filter expression
    let textFilter = `drawtext=text='${escapedText}'`;
    
    // Thêm vị trí
    textFilter += `:x=${outputPosition.x}:y=${outputPosition.y}`;
    
    // Thêm timing nếu có
    if (timing && (timing.start > 0 || timing.end < 999)) {
      textFilter += `:enable='between(t,${timing.start || 0},${timing.end || 5})'`;
    }
    
    // Thêm style với tính toán font size chính xác
    const baseFontSize = style.fontSize || 24;
    let scaledFontSize;
    
    // Nếu có thông tin về previewDimensions từ position, sử dụng để scale font
    if (position.previewDimensions) {
      const fontScaleRatio = outputDimensions.width / position.previewDimensions.width;
      scaledFontSize = Math.round(baseFontSize * fontScaleRatio);
    } else {
      // Fallback: sử dụng previewDimensions được truyền vào
      const fontScaleRatio = outputDimensions.width / previewDimensions.width;
      scaledFontSize = Math.round(baseFontSize * fontScaleRatio);
    }
    
    // Đảm bảo font size trong khoảng hợp lý
    scaledFontSize = Math.max(12, Math.min(scaledFontSize, 200));
    
    console.log(`[Text Overlay ${overlayIndex}] Font scaling:`, {
      baseFontSize,
      scaledFontSize,
      outputDimensions,
      previewDimensions: position.previewDimensions || previewDimensions
    });
    
    textFilter += `:fontsize=${scaledFontSize}`;
    textFilter += `:fontfile=arial.ttf`;
    textFilter += `:fontcolor=0x${convertColorToHex(style.color || '#ffffff')}`;
    
    // Thêm các style khác
    if (style.outline) {
      textFilter += `:bordercolor=0x${convertColorToHex(style.outlineColor || '#000000')}`;
      textFilter += `:borderw=${style.outlineWidth || 2}`;
    }
    
    if (style.shadow) {
      textFilter += `:shadowcolor=0x${convertColorToHex(style.shadowColor || '#000000')}`;
      textFilter += `:shadowx=${style.shadowX || 2}:shadowy=${style.shadowY || 2}`;
    }
    
    if (style.backgroundColor) {
      textFilter += `:box=1:boxcolor=0x${convertColorToHex(style.backgroundColor)}@${style.backgroundOpacity || 0.5}`;
      textFilter += `:boxborderw=${style.backgroundPadding || 5}`;
    }
    
    const fullFilter = `${currentVideoStream}${textFilter}[${nextLabel}]`;
    
    console.log(`[Text Overlay ${overlayIndex}] Filter created:`, fullFilter);
    
    return {
      filter: fullFilter,
      outputStream: `[${nextLabel}]`,
      inputs: []
    };

  } catch (error) {
    console.error(`Error processing text overlay:`, error);
    return null;
  }
};

// Hàm xử lý image overlay
const processImageOverlay = async (
  overlay, 
  overlayIndex, 
  sceneIndex, 
  inputIndex, 
  ffmpeg,
  currentVideoStream,
  nextLabel,
  outputDimensions,
  previewDimensions
) => {
  try {
    const { source, position, transform, timing } = overlay;
    
    // Tải image vào FFmpeg
    const imagePath = `overlay_image_${sceneIndex}_${overlayIndex}.png`;
    
    let imageData;
    if (source.startsWith('data:')) {
      const base64Data = source.split(',')[1];
      imageData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    } else {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      imageData = new Uint8Array(await response.arrayBuffer());
    }
    
    await ffmpeg.writeFile(imagePath, imageData);
    
    // Chuyển đổi tọa độ và scale
    const outputPosition = convertCoordinatesToFFmpeg(position, previewDimensions, outputDimensions);
    const scaleRatio = outputDimensions.width / previewDimensions.width;
    const outputScale = (transform?.scale || 1) * scaleRatio;
    
    // Tính toán input index đúng: 
    // inputIndex đã được tính toán từ processSceneOverlays và đã bao gồm offset cho audio
    // Chỉ cần sử dụng trực tiếp
    
    console.log(`[Image Overlay ${overlayIndex}] Using input index: ${inputIndex}`);
    
    // Tạo filter cho image
    let imageFilter = `[${inputIndex}:v]`;
    
    // Áp dụng transform với applyImageFilters
    const imageFilters = {
      scale: outputScale,
      rotation: transform?.rotation || 0,
      opacity: transform?.opacity || 1,
      brightness: transform?.brightness || 0,
      contrast: transform?.contrast || 1,
      saturation: transform?.saturation || 1,
      hue: transform?.hue || 0,
      blur: transform?.blur || 0
    };
    
    // Sử dụng applyImageFilters để tạo filter transform
    const imageFilterString = applyImageFilters(imageFilters, `[${inputIndex}:v]`, `[img${overlayIndex}]`);
    
    if (imageFilterString) {
      imageFilter = imageFilterString;
      console.log(`[Image Overlay ${overlayIndex}] Using applyImageFilters:`, imageFilterString);
    } else {
      // Fallback to manual filter creation
      const transformFilters = [];
      
      if (outputScale !== 1) {
        transformFilters.push(`scale=iw*${outputScale}:ih*${outputScale}`);
      }
      
      if (transform?.rotation) {
        transformFilters.push(`rotate=${transform.rotation}*PI/180`);
      }
      
      if (transform?.opacity !== undefined && transform.opacity !== 1) {
        transformFilters.push(`format=rgba,colorchannelmixer=aa=${transform.opacity}`);
      }
      
      if (transformFilters.length > 0) {
        imageFilter += transformFilters.join(',');
      }
      
      imageFilter += `[img${overlayIndex}]`;
      console.log(`[Image Overlay ${overlayIndex}] Using manual filters:`, imageFilter);
    }
    
    // Tạo overlay filter
    let overlayFilter = `${currentVideoStream}[img${overlayIndex}]overlay=${outputPosition.x}:${outputPosition.y}`;
    
    // Thêm timing nếu có
    if (timing && (timing.start > 0 || timing.end < 999)) {
      overlayFilter += `:enable='between(t,${timing.start || 0},${timing.end || 5})'`;
    }
    
    overlayFilter += `[${nextLabel}]`;
    
    const fullFilter = `${imageFilter};${overlayFilter}`;
    
    console.log(`[Image Overlay ${overlayIndex}] Filter created:`, fullFilter);
    
    return {
      filter: fullFilter,
      outputStream: `[${nextLabel}]`,
      inputs: [imagePath]
    };

  } catch (error) {
    console.error(`Error processing image overlay:`, error);
    return null;
  }
};

// Hàm xử lý sticker overlay
const processStickerOverlay = async (
  overlay, 
  overlayIndex, 
  sceneIndex,
  currentVideoStream,
  nextLabel,
  outputDimensions,
  previewDimensions
) => {
  try {
    const { content, position, transform, timing } = overlay;
    
    // Chuyển đổi tọa độ từ preview sang output
    const outputPosition = convertCoordinatesToFFmpeg(position, previewDimensions, outputDimensions);
    
    // Tạo filter cho sticker (sử dụng drawtext cho emoji)
    let stickerFilter = `drawtext=text='${content}'`;
    
    // Thêm vị trí
    stickerFilter += `:x=${outputPosition.x}:y=${outputPosition.y}`;
    
    // Thêm timing nếu có
    if (timing && (timing.start > 0 || timing.end < 999)) {
      stickerFilter += `:enable='between(t,${timing.start || 0},${timing.end || 5})'`;
    }
    
    // Thêm kích thước (scale) với tính toán chính xác
    let scaledFontSize;
    if (position.previewDimensions) {
      const fontScaleRatio = outputDimensions.width / position.previewDimensions.width;
      scaledFontSize = Math.round(48 * (transform?.scale || 1) * fontScaleRatio);
    } else {
      const fontScaleRatio = outputDimensions.width / previewDimensions.width;
      scaledFontSize = Math.round(48 * (transform?.scale || 1) * fontScaleRatio);
    }
    
    // Đảm bảo font size trong khoảng hợp lý cho sticker
    scaledFontSize = Math.max(20, Math.min(scaledFontSize, 300));
    
    stickerFilter += `:fontsize=${scaledFontSize}`;
    
    console.log(`[Sticker Overlay ${overlayIndex}] Font scaling:`, {
      baseFontSize: 48,
      scale: transform?.scale || 1,
      scaledFontSize,
      outputDimensions,
      previewDimensions: position.previewDimensions || previewDimensions
    });
    
    const fullFilter = `${currentVideoStream}${stickerFilter}[${nextLabel}]`;
    
    console.log(`[Sticker Overlay ${overlayIndex}] Filter created:`, fullFilter);
    
    return {
      filter: fullFilter,
      outputStream: `[${nextLabel}]`,
      inputs: []
    };

  } catch (error) {
    console.error(`Error processing sticker overlay:`, error);
    return null;
  }
};

// Hàm chuyển đổi tọa độ từ preview sang output FFmpeg
const convertCoordinatesToFFmpeg = (position, previewDimensions, outputDimensions) => {
  let outputX, outputY;
  
  console.log(`[Coordinate Conversion] Input:`, {
    position,
    previewDimensions,
    outputDimensions
  });
  
  // Ưu tiên sử dụng absoluteX, absoluteY nếu có (đã được tính sẵn)
  if (position.absoluteX !== undefined && position.absoluteY !== undefined) {
    console.log(`[Coordinate Conversion] Using absolute coordinates`);
    outputX = Math.round(position.absoluteX);
    outputY = Math.round(position.absoluteY);
  } 
  // Nếu có unit percentage hoặc x,y trong khoảng 0-100
  else if (position.unit === 'percentage' || 
           (typeof position.x === 'number' && position.x >= 0 && position.x <= 100 && 
            typeof position.y === 'number' && position.y >= 0 && position.y <= 100)) {
    console.log(`[Coordinate Conversion] Using percentage coordinates: ${position.x}%, ${position.y}%`);
    // Chuyển đổi phần trăm trực tiếp sang pixel output
    outputX = Math.round((position.x / 100) * outputDimensions.width);
    outputY = Math.round((position.y / 100) * outputDimensions.height);
  } 
  // Ngược lại, coi như pixel coordinates và scale theo tỷ lệ
  else {
    console.log(`[Coordinate Conversion] Using pixel coordinates, scaling from preview to output`);
    const scaleRatioX = outputDimensions.width / previewDimensions.width;
    const scaleRatioY = outputDimensions.height / previewDimensions.height;
    outputX = Math.round(position.x * scaleRatioX);
    outputY = Math.round(position.y * scaleRatioY);
  }
  
  // Đảm bảo tọa độ không vượt quá biên
  outputX = Math.max(0, Math.min(outputX, outputDimensions.width));
  outputY = Math.max(0, Math.min(outputY, outputDimensions.height));
  
  console.log(`[Coordinate Conversion] Result: (${outputX}, ${outputY})`);
  
  return { x: outputX, y: outputY };
};

// Hàm xử lý các overlay trong một scene
const processSceneOverlays = async (scene, sceneIndex, ffmpeg, hasAspectRatioFilter = false) => {
  try {
    console.log(`[Scene ${sceneIndex}] Starting overlay processing`);
    console.log(`[Scene ${sceneIndex}] Scene data:`, scene);
    
    if (!scene.overlays || scene.overlays.length === 0) {
      console.log(`[Scene ${sceneIndex}] No overlays found`);
      return {
        filterComplex: '',
        inputs: [],
        hasOverlays: false
      };
    }
    
    // Sắp xếp overlays theo z-index và timing (thấp đến cao)
    const sortedOverlays = [...scene.overlays].sort((a, b) => {
      const zIndexA = a.zIndex || 0;
      const zIndexB = b.zIndex || 0;
      
      if (zIndexA !== zIndexB) {
        return zIndexA - zIndexB;
      }
      
      // Nếu z-index giống nhau, sắp xếp theo thời gian bắt đầu
      const startA = a.timing?.start || 0;
      const startB = b.timing?.start || 0;
      return startA - startB;
    });
    
    console.log(`[Scene ${sceneIndex}] Processing ${sortedOverlays.length} overlays:`, 
      sortedOverlays.map((o, i) => ({ 
        index: i,
        type: o.type, 
        content: o.content || o.source,
        zIndex: o.zIndex || 0,
        timing: o.timing,
        position: o.position,
        hasPreviewDimensions: !!o.position?.previewDimensions
      })));
    
    const outputDimensions = scene.outputDimensions || { width: 854, height: 480 };
    const previewDimensions = scene.previewDimensions || { width: 400, height: 300 };
    
    console.log(`[Scene ${sceneIndex}] Dimensions:`, {
      outputDimensions,
      previewDimensions,
      scaleRatio: outputDimensions.width / previewDimensions.width
    });
    
    let allFilters = [];
    // Nếu có aspect ratio filter, sử dụng [scaled] làm input, nếu không thì [0:v]
    let currentVideoStream = hasAspectRatioFilter ? '[scaled]' : '[0:v]';
    let ffmpegInputs = [];
    
    // Tính toán input index bắt đầu cho overlay images
    // Input 0: scene image
    // Input 1: audio (nếu có)
    // Input 2+: overlay images
    const hasAudio = scene.audio?.source || scene.voice?.audio_base64;
    let nextInputIndex = hasAudio ? 2 : 1; // Bắt đầu từ 2 nếu có audio, 1 nếu không

    // Xử lý từng overlay theo thứ tự đã sắp xếp
    for (let i = 0; i < sortedOverlays.length; i++) {
      const overlay = sortedOverlays[i];
      
      console.log(`[Scene ${sceneIndex}] Processing overlay ${i + 1}/${sortedOverlays.length}:`, {
        type: overlay.type,
        zIndex: overlay.zIndex || 0,
        position: overlay.position,
        timing: overlay.timing
      });
      
      try {
        // Sử dụng nextInputIndex cho overlay hiện tại
        let currentInputIndex = nextInputIndex;
        
        const result = await processIndividualOverlay(
          overlay, 
          i, 
          sceneIndex, 
          currentInputIndex, 
          ffmpeg,
          outputDimensions,
          previewDimensions,
          currentVideoStream,
          i === sortedOverlays.length - 1 // isLast
        );
        
        console.log(`[Scene ${sceneIndex}] Overlay ${i} processed with inputIndex ${currentInputIndex}, hasAudio: ${hasAudio}`);
        
        if (result && result.filter) {
          allFilters.push(result.filter);
          
          if (result.inputs && result.inputs.length > 0) {
            ffmpegInputs.push(...result.inputs);
            nextInputIndex += result.inputs.length;
          }
          
          if (result.outputStream) {
            currentVideoStream = result.outputStream;
          }
          
        }
      } catch (error) {
        console.error(`[Scene ${sceneIndex}] Error processing overlay ${i}:`, error);
      }
    }

    // Kết hợp tất cả các filter
    const finalFilterComplex = allFilters.join(';');
    console.log(`[Scene ${sceneIndex}] Final filter complex:`, finalFilterComplex);
    console.log(`[Scene ${sceneIndex}] Required inputs:`, ffmpegInputs);
    
    return {
      filterComplex: finalFilterComplex,
      inputs: ffmpegInputs,
      hasOverlays: allFilters.length > 0
    };
  } catch (error) {
    console.error(`Lỗi khi xử lý overlays cho scene ${sceneIndex}:`, error);
    return {
      filterComplex: '',
      inputs: [],
      hasOverlays: false
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
    
    console.log(`[Sticker Overlay ${index}] Created filter with position: ${x}, ${y}, scale: ${scale}, rotation: ${rotation}`);
    return stickerExpression;
  } catch (error) {
    console.error(`[Sticker Overlay ${index}] Error creating filter:`, error);
    return null;
  }
};

// Hàm tạo filter cho text overlay toàn cục
const createGlobalTextOverlayFilter = async (overlay, index) => {
  try {
    const { content: overlayContent, position: overlayPosition, style: overlayStyle, dimensions } = overlay;
    const { color, fontSize, background, backgroundColor, backgroundOpacity, outline, outlineColor, outlineWidth, shadow, shadowColor, shadowX, shadowY, shadowOpacity } = overlayStyle;
    
    const actualFontSize = fontSize || 24;
    const hexColor = convertColorToHex(color);
    
    // Đặt label cho output stream
    const outLabel = `v${index}`;
    
    let yPosition;
    switch (overlayPosition) {
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

    console.log('Original content:', overlayContent);
    
    // Sử dụng formatTextForVideo để xử lý text tự động
    const videoWidth = 854; // Kích thước video mặc định
    const wrappedContent = formatTextForVideo(overlayContent, videoWidth, actualFontSize, 20);
    console.log('Formatted content:', wrappedContent);

      
    // Chỉ tạo drawtext filter, không bao gồm input stream
    let textExpression = `drawtext=text='${wrappedContent}'` +
                    `:x=(w-text_w)/2:y=${yPosition}` +
                    `:fontsize=${actualFontSize}` +
                    `:fontfile=arial.ttf` +
                    `:fontcolor=0x${hexColor}`;
    
    // Thêm background nếu được bật
    if (background && backgroundColor) {
      const hexBgColor = convertColorToHex(backgroundColor);
      textExpression += `:box=1:boxcolor=0x${hexBgColor}@${backgroundOpacity || 0.5}:boxborderw=5`;
    }
    
    // Thêm outline nếu được bật
    if (outline && outlineColor) {
      const hexOutlineColor = convertColorToHex(outlineColor);
      textExpression += `:borderw=${outlineWidth || 2}:bordercolor=0x${hexOutlineColor}`;
    }
    
    // Thêm shadow nếu được bật
    if (shadow && shadowColor) {
      const hexShadowColor = convertColorToHex(shadowColor);
      textExpression += `:shadowx=${shadowX || 2}:shadowy=${shadowY || 2}:shadowcolor=0x${hexShadowColor}@${shadowOpacity || 0.4}`;
    }
    
    // Thêm output label
    textExpression += `[${outLabel}]`;
    
    console.log(`[Global Text Overlay ${index}] Created filter with content: "${overlayContent}", position: ${overlayPosition}`);
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

// Hàm test tạo video đơn giản
export const createSimpleVideo = async (ffmpeg, imageUrl, duration = 5, onProgress) => {
  try {
    console.log('Bắt đầu tạo video đơn giản');
    
    // Tải ảnh
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`HTTP error! status: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    await ffmpeg.writeFile('test_image.jpg', new Uint8Array(imageBuffer));
    console.log('Đã tải ảnh test');
    
    // Tạo video đơn giản
    const ffmpegCommand = [
      '-loop', '1',
      '-i', 'test_image.jpg',
      '-t', duration.toString(),
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-r', '30',
      '-s', '854x480',
      '-pix_fmt', 'yuv420p',
      '-fflags', '+genpts',
      '-shortest',
      '-y',
      'test_output.mp4'
    ];
    
    console.log('Lệnh FFmpeg test:', ffmpegCommand.join(' '));
    await ffmpeg.exec(ffmpegCommand);
    console.log('Đã tạo video test thành công');
    
    // Đọc kết quả
    const data = await ffmpeg.readFile('test_output.mp4');
    const videoBlob = new Blob([data], { type: 'video/mp4' });
    
    // Dọn dẹp
    await ffmpeg.deleteFile('test_image.jpg');
    await ffmpeg.deleteFile('test_output.mp4');
    
    return videoBlob;
  } catch (error) {
    console.error('Lỗi khi tạo video test:', error);
    throw error;
  }
};

// Hàm test để kiểm tra transition effects
export const testTransitionEffects = (script) => {
  console.log('=== TESTING TRANSITION EFFECTS ===');
  
  const individualTransitions = script.global?.transitions?.individualTransitions;
  const globalTransition = script.global?.transitions?.type;
  
  console.log('Global transition:', globalTransition);
  console.log('Individual transitions:', individualTransitions);
  
  if (individualTransitions && individualTransitions.length > 0) {
    console.log('Active individual transitions:');
    individualTransitions.forEach((transition, index) => {
      if (transition.type !== 'none') {
        console.log(`  ${index}: ${transition.fromScene} → ${transition.toScene} (${transition.type}, ${transition.duration}s)`);
      }
    });
  }
  
  const activeTransitions = individualTransitions?.filter(t => t.type !== 'none') || [];
  console.log(`Total active transitions: ${activeTransitions.length}`);
  
  return {
    hasIndividualTransitions: activeTransitions.length > 0,
    hasGlobalTransition: globalTransition && globalTransition !== 'none',
    activeTransitions: activeTransitions
  };
};

// Hàm validate transition settings
const validateTransitionSettings = (scenes, individualTransitions) => {
  console.log('=== VALIDATING TRANSITION SETTINGS ===');
  
  const issues = [];
  const validatedTransitions = [];
  
  for (let i = 0; i < scenes.length - 1; i++) {
    const scene = scenes[i];
    const nextScene = scenes[i + 1];
    const transition = individualTransitions?.[i];
    
    console.log(`Validating transition ${i}: Scene ${scene.id} → Scene ${nextScene.id}`);
    
    if (!transition) {
      console.log(`  No transition defined for pair ${i}`);
      validatedTransitions.push({
        index: i,
        fromScene: scene.id,
        toScene: nextScene.id,
        type: 'none',
        duration: 1,
        valid: true
      });
      continue;
    }
    
    // Validate transition type
    const validTypes = ['none', 'fade', 'slide', 'zoom', 'blur', 'wipe', 'dissolve', 
                       'smoothleft', 'smoothright', 'smoothup', 'smoothdown'];
    
    if (!validTypes.includes(transition.type)) {
      issues.push(`Invalid transition type: ${transition.type} for transition ${i}`);
      transition.type = 'fade'; // Fallback to fade
    }
    
    // Validate duration
    let duration = transition.duration || 1;
    if (duration < 0.5) {
      issues.push(`Transition duration too short: ${duration}s for transition ${i}, setting to 0.5s`);
      duration = 0.5;
    } else if (duration > 3.0) {
      issues.push(`Transition duration too long: ${duration}s for transition ${i}, setting to 3.0s`);
      duration = 3.0;
    }
    
    // Check if scene duration is sufficient for transition
    const sceneDuration = scene.duration || 5;
    if (sceneDuration < duration) {
      issues.push(`Scene ${scene.id} duration (${sceneDuration}s) is shorter than transition duration (${duration}s)`);
    }
    
    validatedTransitions.push({
      index: i,
      fromScene: scene.id,
      toScene: nextScene.id,
      type: transition.type,
      duration: duration,
      valid: true
    });
    
    console.log(`  Validated: ${transition.type} (${duration}s)`);
  }
  
  if (issues.length > 0) {
    console.warn('Transition validation issues:', issues);
  }
  
  console.log('Validation complete. Valid transitions:', validatedTransitions);
  return { validatedTransitions, issues };
};

// Hàm tạo transition preview info
const createTransitionPreview = (scenes, individualTransitions) => {
  console.log('=== TRANSITION PREVIEW ===');
  
  let totalDuration = 0;
  const transitionInfo = [];
  
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const sceneDuration = scene.duration || 5;
    const transition = individualTransitions?.[i];
    
    console.log(`Scene ${scene.id}: ${sceneDuration}s (${totalDuration.toFixed(1)}s - ${(totalDuration + sceneDuration).toFixed(1)}s)`);
    
    if (transition && transition.type !== 'none') {
      const transitionStart = totalDuration + sceneDuration - transition.duration;
      const transitionEnd = totalDuration + sceneDuration;
      
      console.log(`  → Transition: ${transition.type} (${transition.duration}s) at ${transitionStart.toFixed(1)}s - ${transitionEnd.toFixed(1)}s`);
      
      transitionInfo.push({
        sceneId: scene.id,
        nextSceneId: scenes[i + 1]?.id,
        type: transition.type,
        duration: transition.duration,
        startTime: transitionStart,
        endTime: transitionEnd
      });
    }
    
    totalDuration += sceneDuration;
  }
  
  console.log(`Total video duration: ${totalDuration.toFixed(1)}s`);
  console.log(`Active transitions: ${transitionInfo.length}`);
  
  return { totalDuration, transitionInfo };
};

// Hàm test để kiểm tra aspect ratio handling
export const testAspectRatioPreservation = async (ffmpeg, imageUrl, outputResolution = '854x480') => {
  try {
    console.log('=== TESTING ASPECT RATIO PRESERVATION ===');
    
    // Tải ảnh test
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to load test image: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    await ffmpeg.writeFile('test_image.jpg', new Uint8Array(imageBuffer));
    
    // Lấy thông tin ảnh gốc
    const probeCommand = ['-i', 'test_image.jpg', '-t', '1', '-f', 'null', '-'];
    console.log('Probing image info...');
    
    const [targetWidth, targetHeight] = outputResolution.split('x').map(Number);
    
    // Test với aspect ratio preservation
    const aspectRatioFilter = `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:black`;
    
    const testCommand = [
      '-loop', '1',
      '-i', 'test_image.jpg',
      '-t', '2',
      '-vf', aspectRatioFilter,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-r', '15',
      '-pix_fmt', 'yuv420p',
      '-y',
      'test_aspect_ratio.mp4'
    ];
    
    console.log('Test command:', testCommand.join(' '));
       console.log('Aspect ratio filter:', aspectRatioFilter);
    
    await ffmpeg.exec(testCommand);
    
    // Verify output
    const outputFile = await ffmpeg.readFile('test_aspect_ratio.mp4');
    
    // Cleanup
    await ffmpeg.deleteFile('test_image.jpg');
    await ffmpeg.deleteFile('test_aspect_ratio.mp4');
    
    console.log('=== ASPECT RATIO TEST COMPLETED ===');
    console.log(`Output size: ${outputFile.byteLength} bytes`);
    console.log('✅ Aspect ratio preservation should now work correctly!');
    
    return new Blob([outputFile], { type: 'video/mp4' });
    
  } catch (error) {
    console.error('Aspect ratio test failed:', error);
    throw error;
  }
};

// Hàm áp dụng các filter cho ảnh (scale, rotation, brightness, etc.)
const applyImageFilters = (filters, inputStream = '[scaled]', outputStream = '[filtered]') => {
  if (!filters || typeof filters !== 'object') {
    return null;
  }

  const filterParts = [];
  
  // Scale filter
  if (filters.scale && filters.scale !== 1) {
    filterParts.push(`scale=iw*${filters.scale}:ih*${filters.scale}`);
  }
  
  // Rotation filter (convert degrees to radians)
  if (filters.rotation && filters.rotation !== 0) {
    const radians = filters.rotation * Math.PI / 180;
    filterParts.push(`rotate=${radians}`);
  }
  
  // Brightness, contrast, saturation filter
  const eqParts = [];
  if (filters.brightness && filters.brightness !== 0) {
    eqParts.push(`brightness=${filters.brightness}`);
  }
  if (filters.contrast && filters.contrast !== 1) {
    eqParts.push(`contrast=${filters.contrast}`);
  }
  if (filters.saturation && filters.saturation !== 1) {
    eqParts.push(`saturation=${filters.saturation}`);
  }
  if (filters.hue && filters.hue !== 0) {
    eqParts.push(`hue=${filters.hue}`);
  }
  
  if (eqParts.length > 0) {
    filterParts.push(`eq=${eqParts.join(':')}`);
  }
  
  // Blur filter
  if (filters.blur && filters.blur > 0) {
    filterParts.push(`boxblur=${filters.blur}`);
  }
  
  // Opacity filter
  if (filters.opacity && filters.opacity !== 1) {
    filterParts.push(`format=rgba,colorchannelmixer=aa=${filters.opacity}`);
  }
  
  if (filterParts.length === 0) {
    return null;
  }
  
  // Tạo filter string
  const filterString = `${inputStream}${filterParts.join(',')},format=yuv420p${outputStream}`;
  
  console.log('Generated image filter:', filterString);
  return filterString;
};