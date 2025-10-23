/**
 * Language Configuration
 * Supported languages for Gemma 3n models
 * @author Dr. Ernesto Lee
 */

export interface Language {
  code: string; // ISO language code
  name: string; // Display name
  nativeName: string; // Name in native language
  multimodal: boolean; // Supported for multimodal (images/audio/video)
}

/**
 * Top 35 languages supported by Gemma 3n for multimodal
 * Plus additional text-only languages (140 total)
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  // === Multimodal Supported (35 languages) ===
  { code: 'en', name: 'English', nativeName: 'English', multimodal: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', multimodal: true },
  { code: 'fr', name: 'French', nativeName: 'Français', multimodal: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', multimodal: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', multimodal: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', multimodal: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', multimodal: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', multimodal: true },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', multimodal: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', multimodal: true },
  { code: 'ko', name: 'Korean', nativeName: '한국어', multimodal: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', multimodal: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', multimodal: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', multimodal: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', multimodal: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', multimodal: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', multimodal: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', multimodal: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', multimodal: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', multimodal: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', multimodal: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', multimodal: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', multimodal: true },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', multimodal: true },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', multimodal: true },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', multimodal: true },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', multimodal: true },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', multimodal: true },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', multimodal: true },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', multimodal: true },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', multimodal: true },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', multimodal: true },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', multimodal: true },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', multimodal: true },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', multimodal: true },

  // === Text-Only Supported (Additional languages from 140 total) ===
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', multimodal: false },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', multimodal: false },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', multimodal: false },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', multimodal: false },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', multimodal: false },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', multimodal: false },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', multimodal: false },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', multimodal: false },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', multimodal: false },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', multimodal: false },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', multimodal: false },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', multimodal: false },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', multimodal: false },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', multimodal: false },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', multimodal: false },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', multimodal: false },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', multimodal: false },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', multimodal: false },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', multimodal: false },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', multimodal: false },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ', multimodal: false },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', multimodal: false },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', multimodal: false },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', multimodal: false },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', multimodal: false },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', multimodal: false },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', multimodal: false },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', multimodal: false },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', multimodal: false },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', multimodal: false },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', multimodal: false },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek', multimodal: false },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', multimodal: false },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', multimodal: false },
  // ... (140 total - listing most common ones)
];

/**
 * Get languages that support multimodal (images, audio, video)
 */
export function getMultimodalLanguages(): Language[] {
  return SUPPORTED_LANGUAGES.filter(lang => lang.multimodal);
}

/**
 * Get all supported languages (text)
 */
export function getAllLanguages(): Language[] {
  return SUPPORTED_LANGUAGES;
}

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get language name by code
 */
export function getLanguageName(code: string): string {
  const lang = getLanguageByCode(code);
  return lang ? lang.name : code;
}

/**
 * Audio transcription language codes (for Web Speech API)
 */
export const AUDIO_TRANSCRIPTION_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'en-AU', name: 'English (Australia)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'fr-CA', name: 'French (Canada)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)' },
  { code: 'ru-RU', name: 'Russian (Russia)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'zh-CN', name: 'Chinese (Simplified, China)' },
  { code: 'zh-TW', name: 'Chinese (Traditional, Taiwan)' },
  { code: 'ko-KR', name: 'Korean (South Korea)' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'tr-TR', name: 'Turkish (Turkey)' },
  { code: 'vi-VN', name: 'Vietnamese (Vietnam)' },
  { code: 'th-TH', name: 'Thai (Thailand)' },
  { code: 'id-ID', name: 'Indonesian (Indonesia)' },
  { code: 'nl-NL', name: 'Dutch (Netherlands)' },
  { code: 'pl-PL', name: 'Polish (Poland)' },
  { code: 'uk-UA', name: 'Ukrainian (Ukraine)' },
  { code: 'cs-CZ', name: 'Czech (Czech Republic)' },
  { code: 'ro-RO', name: 'Romanian (Romania)' },
  { code: 'sv-SE', name: 'Swedish (Sweden)' },
  { code: 'el-GR', name: 'Greek (Greece)' },
];
