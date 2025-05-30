import { franc } from 'franc';

// Map ngôn ngữ từ franc sang mã ngôn ngữ của Google Cloud TTS
const LANGUAGE_MAP = {
    'eng': 'en-US', // Tiếng Anh
    'vie': 'vi-VN', // Tiếng Việt
    'cmn': 'zh-CN', // Tiếng Trung (Phổ thông)
    'jpn': 'ja-JP', // Tiếng Nhật
    'kor': 'ko-KR', // Tiếng Hàn
    'fra': 'fr-FR', // Tiếng Pháp
    'deu': 'de-DE', // Tiếng Đức
    'spa': 'es-ES', // Tiếng Tây Ban Nha
    'ita': 'it-IT', // Tiếng Ý
    'por': 'pt-BR', // Tiếng Bồ Đào Nha
    'rus': 'ru-RU', // Tiếng Nga
    'hin': 'hi-IN', // Tiếng Hindi
    'ara': 'ar-XA', // Tiếng Ả Rập
    'tha': 'th-TH', // Tiếng Thái
    'ind': 'id-ID', // Tiếng Indonesia
};

// Lọc giọng đọc dựa trên ngôn ngữ
export const filterVoicesByLanguage = (voices, languageCode) => {
    return voices.filter(voice => voice.language === languageCode);
};

// Nhận diện ngôn ngữ và trả về mã ngôn ngữ phù hợp
export const detectLanguage = (text) => {
    if (!text || text.trim().length === 0) {
        return 'vi-VN'; // Mặc định là tiếng Việt
    }

    const detectedLang = franc(text, { minLength: 3 });
    console.log('Detected language:', detectedLang); // Để debug
    return LANGUAGE_MAP[detectedLang] || 'vi-VN'; // Nếu không nhận diện được, mặc định là tiếng Việt
};

// Lấy giọng đọc mặc định cho ngôn ngữ
export const getDefaultVoiceForLanguage = (voices, languageCode) => {
    const languageVoices = filterVoicesByLanguage(voices, languageCode);
    if (languageVoices.length === 0) {
        return null;
    }
    
    // Ưu tiên giọng nữ đầu tiên
    const femaleVoice = languageVoices.find(voice => voice.gender === 'female');
    return femaleVoice || languageVoices[0];
};

// Kiểm tra xem giọng đọc hiện tại có phù hợp với ngôn ngữ không
export const isVoiceCompatibleWithLanguage = (voice, languageCode) => {
    return voice.language === languageCode;
};

// Lấy tên ngôn ngữ từ mã ngôn ngữ
export const getLanguageName = (languageCode) => {
    const languageNames = {
        'vi-VN': 'Vietnamese',
        'en-US': 'English',
        'zh-CN': 'Chinese',
        'ja-JP': 'Japanese',
        'ko-KR': 'Korean',
        'fr-FR': 'French',
        'de-DE': 'German',
        'es-ES': 'Spanish',
        'it-IT': 'Italian',
        'pt-BR': 'Portuguese',
        'ru-RU': 'Russian',
        'hi-IN': 'Hindi',
        'ar-XA': 'Arabic',
        'th-TH': 'Thai',
        'id-ID': 'Indonesian',
    };
    return languageNames[languageCode] || languageCode;
}; 