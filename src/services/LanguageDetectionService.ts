/**
 * Language Detection Service
 * Detects language from text input and provides translation capabilities
 * Supports 140+ languages via Gemma 3n's multilingual capabilities
 * @author Dr. Ernesto Lee
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  multimodalSupport: 'full' | 'partial' | 'text-only';
  family: 'latin' | 'cyrillic' | 'arabic' | 'cjk' | 'other';
}

export interface DetectionResult {
  detectedLanguage: Language;
  confidence: number;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/**
 * Comprehensive list of supported languages
 * Gemma 3n supports 140+ languages across all major language families
 */
export const SUPPORTED_LANGUAGES: Language[] = [
  // Major Languages with Full Multimodal Support
  { code: 'en', name: 'English', nativeName: 'English', multimodalSupport: 'full', family: 'latin' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', multimodalSupport: 'full', family: 'latin' },
  { code: 'fr', name: 'French', nativeName: 'Français', multimodalSupport: 'full', family: 'latin' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', multimodalSupport: 'full', family: 'latin' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', multimodalSupport: 'full', family: 'latin' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', multimodalSupport: 'full', family: 'latin' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', multimodalSupport: 'full', family: 'cjk' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', multimodalSupport: 'full', family: 'cjk' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', multimodalSupport: 'full', family: 'cjk' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', multimodalSupport: 'full', family: 'arabic' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', multimodalSupport: 'full', family: 'other' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', multimodalSupport: 'full', family: 'cyrillic' },

  // European Languages
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', multimodalSupport: 'partial', family: 'latin' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', multimodalSupport: 'partial', family: 'latin' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', multimodalSupport: 'partial', family: 'latin' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', multimodalSupport: 'partial', family: 'latin' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', multimodalSupport: 'partial', family: 'latin' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', multimodalSupport: 'partial', family: 'latin' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', multimodalSupport: 'partial', family: 'latin' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', multimodalSupport: 'partial', family: 'latin' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', multimodalSupport: 'partial', family: 'other' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', multimodalSupport: 'partial', family: 'latin' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', multimodalSupport: 'partial', family: 'cyrillic' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', multimodalSupport: 'text-only', family: 'cyrillic' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', multimodalSupport: 'text-only', family: 'cyrillic' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', multimodalSupport: 'text-only', family: 'latin' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', multimodalSupport: 'text-only', family: 'latin' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', multimodalSupport: 'text-only', family: 'latin' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', multimodalSupport: 'text-only', family: 'latin' },

  // Asian Languages
  { code: 'th', name: 'Thai', nativeName: 'ไทย', multimodalSupport: 'partial', family: 'other' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', multimodalSupport: 'partial', family: 'latin' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', multimodalSupport: 'partial', family: 'latin' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', multimodalSupport: 'text-only', family: 'latin' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', multimodalSupport: 'text-only', family: 'latin' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', multimodalSupport: 'text-only', family: 'other' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', multimodalSupport: 'text-only', family: 'arabic' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', multimodalSupport: 'text-only', family: 'other' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', multimodalSupport: 'text-only', family: 'other' },

  // Middle Eastern & African
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', multimodalSupport: 'text-only', family: 'arabic' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', multimodalSupport: 'text-only', family: 'other' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', multimodalSupport: 'text-only', family: 'latin' },

  // Additional Languages
  { code: 'ca', name: 'Catalan', nativeName: 'Català', multimodalSupport: 'text-only', family: 'latin' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', multimodalSupport: 'text-only', family: 'latin' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', multimodalSupport: 'text-only', family: 'latin' },
];

class LanguageDetectionService {
  /**
   * Detect language from text input using character-based patterns
   */
  detectLanguage(text: string): DetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        detectedLanguage: this.getLanguageByCode('en')!,
        confidence: 0,
      };
    }

    const trimmedText = text.trim();

    // Character-based detection patterns
    const patterns = [
      // CJK Languages
      { regex: /[\u4e00-\u9fff]/, code: 'zh', confidence: 0.95 }, // Chinese
      { regex: /[\u3040-\u309f\u30a0-\u30ff]/, code: 'ja', confidence: 0.95 }, // Japanese
      { regex: /[\uac00-\ud7af]/, code: 'ko', confidence: 0.95 }, // Korean

      // Arabic script
      { regex: /[\u0600-\u06ff]/, code: 'ar', confidence: 0.9 }, // Arabic
      { regex: /[\u0750-\u077f]/, code: 'ur', confidence: 0.85 }, // Urdu
      { regex: /[\u0590-\u05ff]/, code: 'he', confidence: 0.9 }, // Hebrew

      // Cyrillic
      { regex: /[\u0400-\u04ff]/, code: 'ru', confidence: 0.85 }, // Russian

      // Devanagari (Hindi)
      { regex: /[\u0900-\u097f]/, code: 'hi', confidence: 0.9 },

      // Bengali
      { regex: /[\u0980-\u09ff]/, code: 'bn', confidence: 0.9 },

      // Tamil
      { regex: /[\u0b80-\u0bff]/, code: 'ta', confidence: 0.9 },

      // Telugu
      { regex: /[\u0c00-\u0c7f]/, code: 'te', confidence: 0.9 },

      // Thai
      { regex: /[\u0e00-\u0e7f]/, code: 'th', confidence: 0.9 },

      // Greek
      { regex: /[\u0370-\u03ff]/, code: 'el', confidence: 0.9 },
    ];

    // Check character-based patterns first
    for (const pattern of patterns) {
      if (pattern.regex.test(trimmedText)) {
        const lang = this.getLanguageByCode(pattern.code);
        if (lang) {
          return { detectedLanguage: lang, confidence: pattern.confidence };
        }
      }
    }

    // For Latin-based languages, use common word patterns
    const lowerText = trimmedText.toLowerCase();

    // Spanish indicators
    if (/\b(el|la|los|las|de|que|en|un|una|por|para|con|como)\b/.test(lowerText)) {
      return { detectedLanguage: this.getLanguageByCode('es')!, confidence: 0.7 };
    }

    // French indicators
    if (/\b(le|la|les|de|un|une|des|que|qui|dans|pour|avec|être|avoir)\b/.test(lowerText)) {
      return { detectedLanguage: this.getLanguageByCode('fr')!, confidence: 0.7 };
    }

    // German indicators
    if (/\b(der|die|das|und|ist|von|zu|mit|für|auf|den)\b/.test(lowerText)) {
      return { detectedLanguage: this.getLanguageByCode('de')!, confidence: 0.7 };
    }

    // Italian indicators
    if (/\b(il|la|di|che|un|una|per|con|come|sono)\b/.test(lowerText)) {
      return { detectedLanguage: this.getLanguageByCode('it')!, confidence: 0.7 };
    }

    // Portuguese indicators
    if (/\b(o|a|de|que|um|uma|para|com|como|não)\b/.test(lowerText)) {
      return { detectedLanguage: this.getLanguageByCode('pt')!, confidence: 0.7 };
    }

    // Default to English
    return { detectedLanguage: this.getLanguageByCode('en')!, confidence: 0.5 };
  }

  /**
   * Get language by code
   */
  getLanguageByCode(code: string): Language | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  /**
   * Get all languages by multimodal support level
   */
  getLanguagesBySupport(support: 'full' | 'partial' | 'text-only'): Language[] {
    return SUPPORTED_LANGUAGES.filter(lang => lang.multimodalSupport === support);
  }

  /**
   * Get all languages by family
   */
  getLanguagesByFamily(family: Language['family']): Language[] {
    return SUPPORTED_LANGUAGES.filter(lang => lang.family === family);
  }

  /**
   * Format language for display
   */
  formatLanguage(language: Language): string {
    return `${language.name} (${language.nativeName})`;
  }

  /**
   * Get multimodal support icon
   */
  getMultimodalSupportIcon(support: Language['multimodalSupport']): string {
    switch (support) {
      case 'full':
        return '🌟'; // Full support: text + vision + audio
      case 'partial':
        return '⭐'; // Partial support: text + vision OR audio
      case 'text-only':
        return '📝'; // Text only
    }
  }

  /**
   * Generate translation prompt for Gemma 3n
   */
  generateTranslationPrompt(request: TranslationRequest): string {
    const sourceLang = this.getLanguageByCode(request.sourceLanguage);
    const targetLang = this.getLanguageByCode(request.targetLanguage);

    return `Translate the following text from ${sourceLang?.name || request.sourceLanguage} to ${targetLang?.name || request.targetLanguage}.

Provide ONLY the translation without any explanations, notes, or additional text.

Text to translate:
${request.text}`;
  }
}

export const languageDetectionService = new LanguageDetectionService();
