import { getAudioDuration } from './audioUtils';

// Hàm tổng hợp các tùy chỉnh thành script JSON
export const generateScript = async (content, videoSettings, sceneElements, ffmpeg = null) => {
  const script = {
    version: "1.0",
    scenes: [],
    output: {
      format: "mp4",
      codec: "libx264",
      preset: videoSettings.preset,
      crf: videoSettings.crf,
      resolution: videoSettings.resolution,
      fps: videoSettings.fps,
      
    },
    global: {
      transitions: {
        type: videoSettings.transition,
        duration: videoSettings.transitionDuration,
        individualTransitions: videoSettings.individualTransitions || []
      },
      audio: {
        volume: videoSettings.audioEffects.volume,
        fadeIn: videoSettings.audioEffects.fadeIn,
        fadeOut: videoSettings.audioEffects.fadeOut,
        normalize: videoSettings.audioEffects.normalize,
        bass: videoSettings.audioEffects.bass,
        treble: videoSettings.audioEffects.treble
      },
      // Background Music Settings
      backgroundMusicEnabled: videoSettings.backgroundMusicEnabled || false,
      backgroundMusic: videoSettings.backgroundMusic || null,
      backgroundMusicVolume: videoSettings.backgroundMusicVolume || 0.2,
      effects: {
        brightness: videoSettings.brightness,
        contrast: videoSettings.contrast,
        saturation: videoSettings.saturation,
        hue: videoSettings.hue,
        blur: videoSettings.blur,
        zoomEffect: videoSettings.zoomEffect,
        fadeIn: videoSettings.fadeIn,
        fadeOut: videoSettings.fadeOut
      },
      overlays: {
        text: {
          enabled: videoSettings.textOverlay,
          position: videoSettings.textPosition,
          color: videoSettings.textColor,
          size: videoSettings.textSize,
          background: videoSettings.textBackground,
          backgroundColor: videoSettings.textBackgroundColor,
          backgroundOpacity: videoSettings.textBackgroundOpacity,
          outline: videoSettings.textOutline,
          outlineColor: videoSettings.textOutlineColor,
          outlineWidth: videoSettings.textOutlineWidth,
          shadow: videoSettings.textShadow,
          shadowColor: videoSettings.textShadowColor,
          shadowX: videoSettings.textShadowX,
          shadowY: videoSettings.textShadowY,
          shadowOpacity: videoSettings.textShadowOpacity
        },
        watermark: {
          enabled: videoSettings.watermark,
          position: videoSettings.watermarkPosition,
          opacity: videoSettings.watermarkOpacity
        }
      }
    }
  };

  // Xử lý từng scene
  for (let i = 0; i < content.length; i++) {
    const scene = content[i];
    const index = i;
    const elements = sceneElements[scene.scene_number];
    
    // Tính toán thời lượng dựa trên audio nếu có
    let sceneDuration = 5; // Thời gian mặc định cho mỗi scene
    
    // Kiểm tra xem scene có audio hay không
    if (scene.voice?.audio_base64) {
      try {
        console.log(`Đang tính toán thời lượng audio cho scene ${scene.scene_number}`);
        
        // Tạo đường dẫn đầy đủ cho audio base64
        const audioBase64 = `data:audio/mp3;base64,${scene.voice.audio_base64}`;
        
        // Nếu có ffmpeg, thử sử dụng getAudioDuration
        if (ffmpeg) {
          // Lấy thời lượng audio
          const audioDuration = await getAudioDuration(audioBase64, ffmpeg);
          // Đặt thời lượng scene tương ứng với thời lượng audio cộng thêm khoảng buffer
          sceneDuration = audioDuration + 0.5; // Thêm 0.5 giây buffer
          console.log(`Thời lượng audio scene ${scene.scene_number}: ${audioDuration}s, thời lượng scene: ${sceneDuration}s`);
        } else {
          // Nếu không có ffmpeg, thử ước tính từ kích thước base64
          const base64Length = scene.voice.audio_base64.length;
          const bytesPerSecond = 12 * 1024; // ~12KB/giây cho MP3 128kbps
          const bytes = base64Length * 0.75; // Base64 encoded data is ~4/3 the size
          const estimatedDuration = bytes / bytesPerSecond;
          
          // Giới hạn thời lượng ước tính từ 1-120 giây để tránh giá trị quá lớn
          sceneDuration = Math.max(1, Math.min(120, estimatedDuration + 0.5));
          console.log(`Thời lượng ước tính audio scene ${scene.scene_number} từ kích thước: ${estimatedDuration.toFixed(2)}s, thời lượng scene: ${sceneDuration}s`);
        }
      } catch (error) {
        console.warn(`Không thể tính thời lượng audio cho scene ${scene.scene_number}, sử dụng thời lượng mặc định:`, error);
      }
    }
    
    // Nếu có thời lượng được đặt thủ công trong sceneElements, sử dụng nó
    if (elements.duration) {
      sceneDuration = elements.duration;
      console.log(`Sử dụng thời lượng đặt thủ công cho scene ${scene.scene_number}: ${sceneDuration}s`);
    }
    
    const sceneConfig = {
      id: scene.scene_number,
      duration: sceneDuration,
      image: {
        source: scene.image.url,
        filters: {
          scale: elements.image.scale,
          rotation: elements.image.rotation,
          position: elements.image.position,
          brightness: elements.image.brightness + videoSettings.brightness,
          contrast: elements.image.contrast * videoSettings.contrast,
          saturation: elements.image.saturation * videoSettings.saturation,
          hue: videoSettings.hue,
          blur: videoSettings.blur
        }
      },
      // Thêm thông tin về kích thước để chuyển đổi tọa độ overlay
      outputDimensions: {
        width: parseInt(videoSettings.resolution.split('x')[0]),
        height: parseInt(videoSettings.resolution.split('x')[1])
      },
      previewDimensions: elements.scenePreviewDimensions || {
        width: parseInt(videoSettings.resolution.split('x')[0]),
        height: parseInt(videoSettings.resolution.split('x')[1])
      },
      audio: scene.voice?.audio_base64 ? {
        source: `data:audio/mp3;base64,${scene.voice.audio_base64}`,
        volume: elements.audio.volume * videoSettings.audioEffects.volume,
        fadeIn: Math.max(elements.audio.fadeIn, videoSettings.audioEffects.fadeIn),
        fadeOut: Math.max(elements.audio.fadeOut, videoSettings.audioEffects.fadeOut),
        normalize: videoSettings.audioEffects.normalize,
        bass: videoSettings.audioEffects.bass,
        treble: videoSettings.audioEffects.treble
      } : null,
      overlays: []
    };

    // Thêm stickers
    if (Array.isArray(elements.stickers) && elements.stickers.length > 0) {
      elements.stickers.forEach(sticker => {
        // Lấy kích thước thực tế của video
        const [outputWidth, outputHeight] = videoSettings.resolution.split('x').map(Number);
        // Kích thước preview  
        const previewWidth = elements.scenePreviewDimensions?.width || outputWidth;
        const previewHeight = elements.scenePreviewDimensions?.height || outputHeight;
        
        // Tính tọa độ tuyệt đối cho sticker trong video
        const absoluteX = Math.round(sticker.position.x * outputWidth / 100);
        const absoluteY = Math.round(sticker.position.y * outputHeight / 100);
        
        // Get timing values for stickers if available, default to 0 and sceneDuration
        const startTime = sticker.timing?.start ?? 0;
        // Ensure end time doesn't exceed scene duration
        const endTime = Math.min(
          sticker.timing?.end ?? sceneDuration,
          sceneDuration
        );

        sceneConfig.overlays.push({
          type: "sticker",
          content: sticker.content,
          position: {
            x: sticker.position.x,
            y: sticker.position.y,
            absoluteX,
            absoluteY,
            unit: 'percentage',
            previewDimensions: {
              width: previewWidth,
              height: previewHeight
            }
          },
          transform: {
            scale: sticker.scale,
            rotation: sticker.rotation,
            unit: 'degrees'
          },
          timing: {
            start: startTime,
            end: endTime
          },
          zIndex: sticker.zIndex || 0
        });
      });
    }

    // Thêm labels
    if (Array.isArray(elements.labels) && elements.labels.length > 0) {
      elements.labels.forEach(label => {
        // Lấy kích thước thực tế của video
        const [outputWidth, outputHeight] = videoSettings.resolution.split('x').map(Number);
        // Kích thước preview
        const previewWidth = elements.scenePreviewDimensions?.width || outputWidth;
        const previewHeight = elements.scenePreviewDimensions?.height || outputHeight;
        
        // Tính tọa độ tuyệt đối cho text trong video
        const absoluteX = Math.round(label.position.x * outputWidth / 100);
        const absoluteY = Math.round(label.position.y * outputHeight / 100);
        
        // Lấy thời gian hiển thị từ timing hoặc từ style nếu timing không tồn tại
        const startTime = label.timing?.start ?? label.style?.startTime ?? 0;
        // Giới hạn thời gian kết thúc không vượt quá thời lượng của scene
        const endTime = Math.min(
          label.timing?.end ?? label.style?.endTime ?? sceneDuration,
          sceneDuration
        );
        
        sceneConfig.overlays.push({
          type: "text",
          content: label.text,
          position: {
            // Lưu cả tọa độ phần trăm và tọa độ tuyệt đối
            x: label.position.x,
            y: label.position.y,
            absoluteX,
            absoluteY,
            unit: 'percentage',
            // Thêm thông tin về kích thước preview để có thể chuyển đổi chính xác
            previewDimensions: {
              width: previewWidth,
              height: previewHeight
            }
          },
          style: {
            color: label.style.color,
            fontSize: label.style.fontSize,
            fontFamily: label.style.fontFamily,
            // Thêm các style khác nếu có
            outline: label.style.outline,
            outlineColor: label.style.outlineColor,
            outlineWidth: label.style.outlineWidth,
            shadow: label.style.shadow,
            shadowColor: label.style.shadowColor,
            shadowX: label.style.shadowX,
            shadowY: label.style.shadowY,
            backgroundColor: label.style.backgroundColor,
            backgroundOpacity: label.style.backgroundOpacity,
            backgroundPadding: label.style.backgroundPadding
          },
          timing: {
            start: startTime,
            end: endTime
          },
          zIndex: label.zIndex || 0
        });
      });
    }

    // Thêm subtitle tự động nếu chưa có (chỉ kiểm tra các overlay có position.preset)
    const hasAutoSubtitle = sceneConfig.overlays.some(
      o => o.type === 'text' && o.position && o.position.preset
    );
    if (videoSettings.textOverlay && !hasAutoSubtitle) {
      sceneConfig.overlays.push({
        type: 'text',
        content: scene.voice_over || scene.text || '',
        position: {
          preset: videoSettings.textPosition,
          unit: 'preset',
          previewDimensions: elements.scenePreviewDimensions || {
            width: parseInt(videoSettings.resolution.split('x')[0]),
            height: parseInt(videoSettings.resolution.split('x')[1])
          }
        },
        style: {
          color: videoSettings.textColor,
          fontSize: videoSettings.textSize,
          background: videoSettings.textBackground,
          backgroundColor: videoSettings.textBackgroundColor,
          backgroundOpacity: videoSettings.textBackgroundOpacity,
          outline: videoSettings.textOutline,
          outlineColor: videoSettings.textOutlineColor,
          outlineWidth: videoSettings.textOutlineWidth,
          shadow: videoSettings.textShadow,
          shadowColor: videoSettings.textShadowColor,
          shadowX: videoSettings.textShadowX,
          shadowY: videoSettings.textShadowY,
          shadowOpacity: videoSettings.textShadowOpacity
        },
        timing: {
          start: 0,
          end: sceneDuration
        },
        zIndex: 999 // Đảm bảo subtitle luôn trên cùng
      });
    }

    // Thêm watermark nếu được bật
    if (videoSettings.watermark) {
      sceneConfig.overlays.push({
        type: "watermark",
        position: videoSettings.watermarkPosition,
        opacity: videoSettings.watermarkOpacity
      });
    }

    // Debug: Log elements để kiểm tra imageOverlays
    console.log(`[Script Generator] Scene ${scene.scene_number} elements:`, {
      hasElements: !!elements,
      hasImageOverlays: !!(elements?.imageOverlays),
      imageOverlaysLength: elements?.imageOverlays?.length || 0,
      imageOverlays: elements?.imageOverlays,
      allElementKeys: elements ? Object.keys(elements) : []
    });

    // Thêm image overlays vào sceneConfig
    if (Array.isArray(elements.imageOverlays) && elements.imageOverlays.length > 0) {
      console.log(`[Script Generator] Processing ${elements.imageOverlays.length} image overlays for scene ${scene.scene_number}`);
      
      elements.imageOverlays.forEach((overlay, index) => {
        console.log(`[Script Generator] Processing image overlay ${index}:`, {
          id: overlay.id,
          source: overlay.source,
          scale: overlay.scale,
          rotation: overlay.rotation,
          opacity: overlay.opacity,
          position: overlay.position,
          timing: overlay.timing
        });
        
        // Lấy kích thước thực tế của video
        const [outputWidth, outputHeight] = videoSettings.resolution.split('x').map(Number);
        // Kích thước preview
        const previewWidth = elements.scenePreviewDimensions?.width || outputWidth;
        const previewHeight = elements.scenePreviewDimensions?.height || outputHeight;
        
        // Tính toán kích thước thực tế của overlay trong video output
        const originalWidth = overlay.originalDimensions.width;
        const originalHeight = overlay.originalDimensions.height;
        
        // Tính toán kích thước mới dựa trên tỷ lệ với preview
        const previewOverlayWidth = originalWidth * (previewWidth / outputWidth);
        const previewOverlayHeight = originalHeight * (previewHeight / outputHeight);
        
        // Tính toán scale factor để giữ nguyên tỷ lệ kích thước
        // Sử dụng finalScale đã được tính toán chính xác trong TimelineUI
        const finalScaleFactor = overlay.scaleInfo?.finalScale || 1;
        
        console.log(`[Script Generator] Scale calculation for overlay ${index}:`, {
          finalScaleFactor,
          originalDimensions: { width: originalWidth, height: originalHeight },
          previewDimensions: { width: previewWidth, height: previewHeight },
          outputDimensions: { width: outputWidth, height: outputHeight },
          scaleInfo: overlay.scaleInfo
        });
        
        // Tính toán vị trí tuyệt đối trong video output
        const absoluteX = Math.round(overlay.position.x * outputWidth / 100);
        const absoluteY = Math.round(overlay.position.y * outputHeight / 100);
        
        sceneConfig.overlays.push({
          type: "image",
          source: overlay.source,
          position: {
            x: overlay.position.x,
            y: overlay.position.y,
            absoluteX,
            absoluteY,
            unit: 'percentage',
            previewDimensions: {
              width: previewWidth,
              height: previewHeight
            }
          },
          dimensions: {
            original: {
              width: originalWidth,
              height: originalHeight
            },
            preview: {
              width: previewOverlayWidth,
              height: previewOverlayHeight
            },
            output: {
              width: originalWidth * finalScaleFactor,
              height: originalHeight * finalScaleFactor
            }
          },
          transform: {
            scale: finalScaleFactor,
            rotation: overlay.rotation || 0,
            opacity: overlay.opacity || 1,
            // Thêm các effect khác nếu có trong overlay
            brightness: overlay.brightness || 0,
            contrast: overlay.contrast || 1,
            saturation: overlay.saturation || 1,
            hue: overlay.hue || 0,
            blur: overlay.blur || 0
          },
          timing: {
            start: overlay.timing.start,
            end: overlay.timing.end
          },
          // Thêm thông tin scaleInfo để ffmpegUtils sử dụng chính xác
          scaleInfo: overlay.scaleInfo || {
            displayScale: 1,
            finalScale: finalScaleFactor,
            previewDimensions: {
              width: previewWidth,
              height: previewHeight
            },
            outputDimensions: {
              width: outputWidth,
              height: outputHeight
            },
            scaleRatio: outputWidth / previewWidth
          }
        });
      });
    }

    // Thêm transition nếu không phải scene cuối
    // Transition đã được chuyển lên global để xử lý trong ffmpegUtils
    if (index < content.length - 1) {
      // Kiểm tra xem có individual transition cho cặp scene này không
      const individualTransition = videoSettings.individualTransitions?.[index];
      if (individualTransition && individualTransition.type !== 'none') {
        sceneConfig.transition = {
          type: individualTransition.type,
          duration: individualTransition.duration,
          fromScene: individualTransition.fromScene,
          toScene: individualTransition.toScene
        };
        console.log(`Scene ${scene.scene_number}: Added individual transition:`, sceneConfig.transition);
      } else if (videoSettings.transition !== 'none') {
        // Fallback về transition chung nếu không có individual transition
        sceneConfig.transition = {
          type: videoSettings.transition,
          duration: videoSettings.transitionDuration
        };
        console.log(`Scene ${scene.scene_number}: Added global transition:`, sceneConfig.transition);
      }
    }

    script.scenes.push(sceneConfig);
  }

  // Thêm logging để debug
  console.log('Generated script:', {
    version: script.version,
    scenesCount: script.scenes.length,
    globalTransitions: script.global.transitions,
    individualTransitions: script.global.transitions.individualTransitions
  });

  return script;
}; 