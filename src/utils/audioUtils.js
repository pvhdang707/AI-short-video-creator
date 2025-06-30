// Hàm xử lý base64 audio thành Blob
export const base64ToBlob = async (base64String) => {
  try {
    if (!base64String.startsWith('data:')) {
      throw new Error('Base64 string is not in the correct format');
    }
    const [metadata, base64Data] = base64String.split(',');
    const mimeType = metadata.match(/data:(.*?);/)?.[1];
    if (!mimeType) throw new Error('Cannot determine MIME type');
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
    console.error('Error processing base64 audio:', error);
    throw new Error(`Error processing base64 audio: ${error.message}`);
  }
};

// Hàm đọc thời lượng audio từ base64 - Phương pháp FFmpeg
export const getAudioDurationFromBase64 = async (ffmpeg, base64Audio) => {
  try {
    // Chuyển base64 thành file tạm
    const audioBlob = await base64ToBlob(base64Audio);
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioData = new Uint8Array(arrayBuffer);
    
    // Lưu file tạm
    const tempPath = 'temp_audio.mp3';
    await ffmpeg.writeFile(tempPath, audioData);
    
    // Thử đọc thời lượng bằng phương pháp trích xuất metadata thành file JSON
    const infoJsonPath = 'info.json';
    try {
      // Sử dụng FFmpeg probe để lấy thông tin audio và lưu vào file JSON
      await ffmpeg.exec([
        '-i', tempPath,
        '-hide_banner',
        '-print_format', 'json',
        '-show_format',
        '-show_streams',
        '-f', 'json',
        infoJsonPath
      ]);
      
      // Read JSON file
      const infoData = await ffmpeg.readFile(infoJsonPath);
      const infoText = new TextDecoder().decode(infoData);
      const info = JSON.parse(infoText);
      
      // Find duration information
      let duration = null;
      
      if (info.format && info.format.duration) {
        duration = parseFloat(info.format.duration);
      } else if (info.streams && info.streams.length > 0) {
        for (const stream of info.streams) {
          if (stream.duration) {
            duration = parseFloat(stream.duration);
            break;
          }
        }
      }
      
      // Delete temp files
      await ffmpeg.deleteFile(tempPath);
      await ffmpeg.deleteFile(infoJsonPath);
      
      if (duration !== null) {
        console.log(`Audio duration: ${duration} seconds`);
        return duration;
      }
    } catch (error) {
      console.warn('Error reading metadata from FFmpeg:', error);
    }
    
    // If unable to read duration by probe, try another method: re-encode with debug information
    try {
      // Create a temp output file to read duration
      const outputPath = 'temp_output.mp3';
      
      // Run FFmpeg with options to display duration
      await ffmpeg.exec([
        '-i', tempPath,
        '-f', 'null',
        '-'
      ]);
      
      // Cannot read log directly (no getLog), we will try to determine duration via HTML Audio
      await ffmpeg.deleteFile(tempPath);
      
      // Return default value in case unable to determine
      console.warn('Cannot read duration from FFmpeg, using Audio element');
      return 5;
    } catch (error) {
      console.warn('Error determining duration from FFmpeg:', error);
    }
    
    // Delete temp file if still exists
    try {
      await ffmpeg.deleteFile(tempPath);
    } catch (e) {
      // Ignore error if file already deleted
    }
    
    // If unable to read duration, return default duration
    console.warn('Cannot read audio duration, using default duration');
    return 5;
  } catch (error) {
    console.error('Error reading audio duration:', error);
    return 5;
  }
};

// Function to get audio duration from HTML Audio element
export const getAudioDurationFromElement = (audioBase64) => {
  return new Promise((resolve, reject) => {
    try {
      if (!audioBase64) {
        console.warn('audioBase64 not provided');
        return resolve(5);
      }
      
      // Ensure audio base64 is in correct format
      let audioSrc = audioBase64;
      if (!audioBase64.startsWith('data:')) {
        audioSrc = `data:audio/mp3;base64,${audioBase64}`;
      }
      
      // Create audio element to get duration
      const audio = new Audio(audioSrc);
      
      // Determine if duration has been received to avoid multiple resolves
      let durationResolved = false;
      
      audio.addEventListener('loadedmetadata', () => {
        if (durationResolved) return;
        
        // Get duration from audio element
        const duration = audio.duration;
        if (isFinite(duration) && duration > 0) {
          console.log('Audio duration from element:', duration);
          durationResolved = true;
          resolve(duration);
        } else {
          console.warn('Invalid audio duration:', duration);
        }
      });
      
      audio.addEventListener('canplaythrough', () => {
        if (durationResolved) return;
        
        const duration = audio.duration;
        if (isFinite(duration) && duration > 0) {
          console.log('Audio duration from canplaythrough:', duration);
          durationResolved = true;
          resolve(duration);
        }
      });
      
      audio.addEventListener('error', (err) => {
        console.error('Error loading audio:', err);
        // If there's an error, return default duration
        if (!durationResolved) {
          durationResolved = true;
          resolve(5);
        }
      });
      
      // Trigger audio load
      audio.load();
      
      // Set timeout to avoid hang when unable to load audio
      setTimeout(() => {
        if (!durationResolved) {
          console.warn('Timeout when loading audio, using default duration');
          durationResolved = true;
          resolve(5);
        }
      }, 5000);
    } catch (error) {
      console.error('Error getting audio duration:', error);
      resolve(5);
    }
  });
};

// Function to combine to get audio duration with priority using HTML Audio method if possible
export const getAudioDuration = async (audioBase64, ffmpeg = null) => {
  try {
    // Check if audioBase64 has value
    if (!audioBase64) {
      console.warn('audioBase64 not provided');
      return 5;
    }
    
    // Try calculating duration from audio information based on size ratio
    // Estimate: ~12KB/second for 128kbps MP3
    try {
      let base64Data = audioBase64;
      if (audioBase64.startsWith('data:')) {
        base64Data = audioBase64.split(',')[1];
      }
      
      const bytesPerSecondEstimate = 12 * 1024;  // ~12KB/second
      const base64Length = base64Data.length;
      const bytes = base64Length * 0.75;  // Base64 encoded data is ~4/3 the size
      const estimatedDuration = bytes / bytesPerSecondEstimate;
      
      console.log(`Estimated duration from size (${Math.round(bytes / 1024)}KB): ${estimatedDuration.toFixed(2)} seconds`);
      
      // Only use this estimate if other methods fail
      const sizeBasedDuration = Math.max(1, Math.min(300, estimatedDuration));  // Limit from 1-300 seconds
      
      // Try HTML Audio element first (works on browser)
      if (typeof window !== 'undefined' && window.Audio) {
        try {
          console.log('Trying to get duration from HTML Audio element...');
          const duration = await getAudioDurationFromElement(audioBase64);
          if (duration && duration > 0 && isFinite(duration)) {
            console.log(`Got duration from HTML Audio: ${duration} seconds`);
            return duration;
          }
        } catch (error) {
          console.warn('Cannot get duration from Audio element:', error);
        }
      }
      
      // If HTML method fails and there's FFmpeg, use FFmpeg
      if (ffmpeg) {
        try {
          console.log('Trying to get duration from FFmpeg...');
          const duration = await getAudioDurationFromBase64(ffmpeg, audioBase64);
          if (duration && duration > 0 && isFinite(duration)) {
            console.log(`Got duration from FFmpeg: ${duration} seconds`);
            return duration;
          }
        } catch (error) {
          console.warn('Cannot get duration from FFmpeg:', error);
        }
      }
      
      // If no method works, use size-based estimate
      console.log(`Using size-based estimated duration: ${sizeBasedDuration.toFixed(2)} seconds`);
      return sizeBasedDuration;
    } catch (sizeEstimateError) {
      console.warn('Error calculating duration from size:', sizeEstimateError);
    }
    
    // If all methods fail, return default duration
    console.warn('Cannot get audio duration using any method, using default duration');
    return 5;
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return 5;
  }
};
