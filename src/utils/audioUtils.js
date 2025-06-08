// Hàm xử lý base64 audio thành Blob
export const base64ToBlob = async (base64String) => {
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
      
      // Đọc file JSON
      const infoData = await ffmpeg.readFile(infoJsonPath);
      const infoText = new TextDecoder().decode(infoData);
      const info = JSON.parse(infoText);
      
      // Tìm thông tin thời lượng
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
      
      // Xóa các file tạm
      await ffmpeg.deleteFile(tempPath);
      await ffmpeg.deleteFile(infoJsonPath);
      
      if (duration !== null) {
        console.log(`Thời lượng audio: ${duration} giây`);
        return duration;
      }
    } catch (error) {
      console.warn('Lỗi khi đọc thông tin metadata từ FFmpeg:', error);
    }
    
    // Nếu không đọc được bằng probe, thử phương pháp khác: mã hóa lại với thông tin debug
    try {
      // Tạo một file output tạm để đọc thời lượng
      const outputPath = 'temp_output.mp3';
      
      // Chạy FFmpeg với tùy chọn để hiển thị thời lượng
      await ffmpeg.exec([
        '-i', tempPath,
        '-f', 'null',
        '-'
      ]);
      
      // Không thể đọc log trực tiếp (không có getLog), chúng ta sẽ thử xác định thời lượng qua HTML Audio
      await ffmpeg.deleteFile(tempPath);
      
      // Trả về giá trị mặc định trong trường hợp không thể xác định
      console.warn('Không thể đọc thời lượng từ FFmpeg, sử dụng Audio element');
      return 5;
    } catch (error) {
      console.warn('Lỗi khi xác định thời lượng từ FFmpeg:', error);
    }
    
    // Xóa file tạm nếu còn tồn tại
    try {
      await ffmpeg.deleteFile(tempPath);
    } catch (e) {
      // Bỏ qua lỗi nếu file đã bị xóa
    }
    
    // Nếu không thể đọc được thời lượng, trả về thời lượng mặc định
    console.warn('Không thể đọc thời lượng audio, sử dụng thời lượng mặc định');
    return 5;
  } catch (error) {
    console.error('Lỗi khi đọc thời lượng audio:', error);
    return 5;
  }
};

// Hàm lấy thời lượng audio từ HTML Audio element
export const getAudioDurationFromElement = (audioBase64) => {
  return new Promise((resolve, reject) => {
    try {
      if (!audioBase64) {
        console.warn('audioBase64 không được cung cấp');
        return resolve(5);
      }
      
      // Đảm bảo audio base64 có định dạng đúng
      let audioSrc = audioBase64;
      if (!audioBase64.startsWith('data:')) {
        audioSrc = `data:audio/mp3;base64,${audioBase64}`;
      }
      
      // Tạo audio element để lấy thời lượng
      const audio = new Audio(audioSrc);
      
      // Xác định xem đã nhận được thời lượng chưa để tránh resolve nhiều lần
      let durationResolved = false;
      
      audio.addEventListener('loadedmetadata', () => {
        if (durationResolved) return;
        
        // Lấy thời lượng từ audio element
        const duration = audio.duration;
        if (isFinite(duration) && duration > 0) {
          console.log('Thời lượng audio từ element:', duration);
          durationResolved = true;
          resolve(duration);
        } else {
          console.warn('Thời lượng audio không hợp lệ:', duration);
        }
      });
      
      audio.addEventListener('canplaythrough', () => {
        if (durationResolved) return;
        
        const duration = audio.duration;
        if (isFinite(duration) && duration > 0) {
          console.log('Thời lượng audio từ canplaythrough:', duration);
          durationResolved = true;
          resolve(duration);
        }
      });
      
      audio.addEventListener('error', (err) => {
        console.error('Lỗi khi tải audio:', err);
        // Nếu có lỗi, trả về thời lượng mặc định
        if (!durationResolved) {
          durationResolved = true;
          resolve(5);
        }
      });
      
      // Kích hoạt việc tải audio
      audio.load();
      
      // Đặt timeout để tránh treo khi không thể tải được audio
      setTimeout(() => {
        if (!durationResolved) {
          console.warn('Timeout khi tải audio, sử dụng thời lượng mặc định');
          durationResolved = true;
          resolve(5);
        }
      }, 5000);
    } catch (error) {
      console.error('Lỗi khi lấy thời lượng audio:', error);
      resolve(5);
    }
  });
};

// Hàm kết hợp để lấy thời lượng audio với ưu tiên dùng phương thức HTML Audio nếu có thể
export const getAudioDuration = async (audioBase64, ffmpeg = null) => {
  try {
    // Kiểm tra xem audioBase64 có giá trị không
    if (!audioBase64) {
      console.warn('audioBase64 không được cung cấp');
      return 5;
    }
    
    // Thử dùng tính toán từ thông tin âm thanh dựa theo tỉ lệ kích thước
    // Một ước tính: khoảng 12KB/giây cho audio MP3 128kbps
    try {
      let base64Data = audioBase64;
      if (audioBase64.startsWith('data:')) {
        base64Data = audioBase64.split(',')[1];
      }
      
      const bytesPerSecondEstimate = 12 * 1024;  // ~12KB/giây
      const base64Length = base64Data.length;
      const bytes = base64Length * 0.75;  // Base64 encoded data is ~4/3 the size
      const estimatedDuration = bytes / bytesPerSecondEstimate;
      
      console.log(`Thời lượng ước tính từ kích thước (${Math.round(bytes / 1024)}KB): ${estimatedDuration.toFixed(2)} giây`);
      
      // Chỉ sử dụng ước tính này nếu quá trình khác không hoạt động
      const sizeBasedDuration = Math.max(1, Math.min(300, estimatedDuration));  // Giới hạn từ 1-300 giây
      
      // Thử dùng HTML Audio element trước (hoạt động trên trình duyệt)
      if (typeof window !== 'undefined' && window.Audio) {
        try {
          console.log('Đang thử lấy thời lượng từ HTML Audio element...');
          const duration = await getAudioDurationFromElement(audioBase64);
          if (duration && duration > 0 && isFinite(duration)) {
            console.log(`Đã lấy thời lượng từ HTML Audio: ${duration} giây`);
            return duration;
          }
        } catch (error) {
          console.warn('Không thể đọc thời lượng từ Audio element:', error);
        }
      }
      
      // Nếu phương thức HTML không hoạt động và có FFmpeg, dùng FFmpeg
      if (ffmpeg) {
        try {
          console.log('Đang thử lấy thời lượng từ FFmpeg...');
          const duration = await getAudioDurationFromBase64(ffmpeg, audioBase64);
          if (duration && duration > 0 && isFinite(duration)) {
            console.log(`Đã lấy thời lượng từ FFmpeg: ${duration} giây`);
            return duration;
          }
        } catch (error) {
          console.warn('Không thể đọc thời lượng từ FFmpeg:', error);
        }
      }
      
      // Nếu không có phương pháp nào hoạt động, sử dụng ước tính kích thước
      console.log(`Sử dụng thời lượng ước tính từ kích thước: ${sizeBasedDuration.toFixed(2)} giây`);
      return sizeBasedDuration;
    } catch (sizeEstimateError) {
      console.warn('Lỗi khi ước tính thời lượng từ kích thước:', sizeEstimateError);
    }
    
    // Nếu tất cả phương pháp đều thất bại, trả về thời lượng mặc định
    console.warn('Không thể đọc thời lượng audio bằng bất kỳ phương pháp nào, sử dụng thời lượng mặc định');
    return 5;
  } catch (error) {
    console.error('Lỗi khi lấy thời lượng audio:', error);
    return 5;
  }
};
