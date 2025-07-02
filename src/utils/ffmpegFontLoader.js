// Hàm này dùng cho ffmpeg.wasm
// Đảm bảo font đã có trong FS ảo, nếu chưa thì fetch từ public/fonts và ghi vào /fonts

// Global cache cho các font đã nạp vào FS ảo
const fontCache = new Map();

export async function ensureFontInFS(ffmpeg, fontFile) {
  if (
    !ffmpeg ||
    typeof ffmpeg.writeFile !== 'function' ||
    typeof ffmpeg.readFile !== 'function' ||
    typeof ffmpeg.listDir !== 'function'
  ) {
    console.error("[ensureFontInFS] FFmpeg instance is invalid!", ffmpeg);
    throw new Error("FFmpeg instance is not ready or invalid!");
  }

  // Nếu đã có promise nạp font, chỉ chờ promise đó
  if (fontCache.has(fontFile)) {
    return fontCache.get(fontFile);
  }

  // Tạo promise nạp font và lưu vào cache
  const fontPromise = (async () => {
    let ffmpegFontPath = `/fonts/${fontFile}`;
    try {
      await ffmpeg.readFile(ffmpegFontPath);
      console.log(`[ensureFontInFS] Font đã có trong FS: ${ffmpegFontPath}`);
      return ffmpegFontPath;
    } catch (e) {
      // Nếu chưa có, fetch font
      console.log(`[ensureFontInFS] Đang fetch font: ${fontFile}`);
      const response = await fetch(`/fonts/${fontFile}`);
      if (!response.ok) {
        console.error("[ensureFontInFS] Không tải được font:", fontFile, response);
        throw new Error("Không tải được font: " + fontFile);
      }
      // Lấy buffer tại đây, chỉ dùng 1 lần duy nhất
      const fontData = await response.arrayBuffer();
      if (!fontData || fontData.byteLength === 0) {
        console.error("[ensureFontInFS] fontData rỗng hoặc detached!", fontData);
        throw new Error("Font data is empty or detached!");
      }
      // Luôn tạo bản sao buffer để tránh lỗi detached
      const fontBuffer1 = new Uint8Array(fontData.slice(0)); // buffer cho lần ghi đầu
      // Thử ghi vào /fonts/fontFile
      try {
        await ffmpeg.writeFile(ffmpegFontPath, fontBuffer1);
        console.log(`[ensureFontInFS] Đã ghi font vào: ${ffmpegFontPath}`);
        return ffmpegFontPath;
      } catch (err) {
        // Nếu ghi vào /fonts lỗi, thử ghi vào /
        console.warn("[ensureFontInFS] Lỗi ghi vào /fonts, thử ghi vào /", err);
        ffmpegFontPath = `/${fontFile}`;
        // Tạo lại buffer mới từ fontData cho lần ghi tiếp theo
        const fontBuffer2 = new Uint8Array(fontData.slice(0));
        try {
          await ffmpeg.writeFile(ffmpegFontPath, fontBuffer2);
          console.log(`[ensureFontInFS] Đã ghi font vào: ${ffmpegFontPath}`);
          return ffmpegFontPath;
        } catch (err2) {
          console.error("[ensureFontInFS] Lỗi ghi font vào FS:", err2);
          throw err2;
        }
      }
    }
  })();

  fontCache.set(fontFile, fontPromise);
  try {
    const result = await fontPromise;
    return result;
  } catch (err) {
    fontCache.delete(fontFile); // Nếu lỗi, xóa cache để lần sau thử lại
    throw err;
  }
} 