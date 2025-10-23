/**
 * Voice Service
 * Handles speech-to-text (Web Speech API) and text-to-speech (Speech Synthesis API)
 * @author Dr. Ernesto Lee
 */

export interface VoiceInputResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceSettings {
  voice?: string; // Voice name
  rate?: number; // 0.1-10, default 1
  pitch?: number; // 0-2, default 1
  volume?: number; // 0-1, default 1
  lang?: string; // Language code
}

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;

  constructor() {
    // Initialize Speech Recognition (for input)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Stop after one result
      this.recognition.interimResults = true; // Get partial results
      this.recognition.maxAlternatives = 1;
    }

    // Initialize Speech Synthesis (for output)
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Check if speech recognition is supported
   */
  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Check if speech synthesis is supported
   */
  isSynthesisSupported(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Start listening for speech input
   */
  startListening(
    onResult: (result: VoiceInputResult) => void,
    onError?: (error: Error) => void,
    language: string = 'en-US'
  ): void {
    if (!this.recognition) {
      onError?.(new Error('Speech recognition not supported'));
      return;
    }

    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    this.recognition.lang = language;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      onResult({
        transcript,
        confidence,
        isFinal,
      });
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError?.(new Error(event.error || 'Speech recognition error'));
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
    this.isListening = true;
    console.log('🎤 Started listening...');
  }

  /**
   * Stop listening for speech input
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('🛑 Stopped listening');
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Speak text using text-to-speech
   */
  speak(
    text: string,
    settings: VoiceSettings = {},
    onEnd?: () => void,
    onError?: (error: Error) => void
  ): void {
    if (!this.synthesis) {
      onError?.(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply settings
    if (settings.rate !== undefined) utterance.rate = settings.rate;
    if (settings.pitch !== undefined) utterance.pitch = settings.pitch;
    if (settings.volume !== undefined) utterance.volume = settings.volume;
    if (settings.lang) utterance.lang = settings.lang;

    // Set voice if specified
    if (settings.voice) {
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === settings.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Event handlers
    utterance.onend = () => {
      onEnd?.();
      console.log('🔊 Finished speaking');
    };

    utterance.onerror = (event) => {
      onError?.(new Error(event.error || 'Speech synthesis error'));
    };

    this.synthesis.speak(utterance);
    console.log('🔊 Speaking...');
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      console.log('🛑 Stopped speaking');
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  /**
   * Get available voices for text-to-speech
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Get voices for a specific language
   */
  getVoicesForLanguage(lang: string): SpeechSynthesisVoice[] {
    const voices = this.getAvailableVoices();
    return voices.filter(voice => voice.lang.startsWith(lang));
  }
}

// Singleton instance
export const voiceService = new VoiceService();
