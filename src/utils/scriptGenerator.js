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
      filters: {
        brightness: videoSettings.brightness,
        contrast: videoSettings.contrast,
        saturation: videoSettings.saturation,
        hue: videoSettings.hue,
        blur: videoSettings.blur
      },
      transitions: {
        type: videoSettings.transition,
        duration: videoSettings.transitionDuration
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
      // Thêm thông tin về kích thước preview để sử dụng khi chuyển đổi tọa độ
      scenePreviewDimensions: elements.scenePreviewDimensions || {
        width: parseInt(videoSettings.resolution.split('x')[0]),
        height: parseInt(videoSettings.resolution.split('x')[1])
      },
      audio: scene.voice?.audio_base64 ? {
        source: `data:audio/mp3;base64,${scene.voice.audio_base64}`,
        volume: elements.audio.volume,
        fadeIn: elements.audio.fadeIn,
        fadeOut: elements.audio.fadeOut
      } : null,
      overlays: []
    };

    // Thêm stickers
    if (elements.stickers.length > 0) {
      elements.stickers.forEach(sticker => {
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
            unit: 'percentage'
          },
          transform: {
            scale: sticker.scale,
            rotation: sticker.rotation,
            unit: 'degrees'
          },
          timing: {
            start: startTime,
            end: endTime
          }
        });
      });
    }

    // Thêm labels
    if (elements.labels.length > 0) {
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
            fontFamily: label.style.fontFamily
          },
          timing: {
            start: startTime,
            end: endTime
          }
        });
      });
    }

    // Thêm text overlay nếu được bật
    if (videoSettings.textOverlay) {
      sceneConfig.overlays.push({
        type: "text_overlay",
        content: scene.voice_over || "",
        position: videoSettings.textPosition,
        style: {
          color: videoSettings.textColor,
          fontSize: videoSettings.textSize
        }
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

    // Thêm transition nếu không phải scene cuối
    if (index < content.length - 1 && videoSettings.transition !== 'none') {
      sceneConfig.transition = {
        type: videoSettings.transition,
        duration: videoSettings.transitionDuration
      };
    }

    script.scenes.push(sceneConfig);
  }

  return script;
}; 