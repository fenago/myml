/**
 * Audio Service
 * Handles audio transcription, translation, and analysis using Gemma 3n
 * @author Dr. Ernesto Lee
 */

import type { InferenceEngine } from './InferenceEngine';

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
  duration: number;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  duration: number;
}

export interface AnalysisResult {
  type: 'speech' | 'sounds' | 'emotion' | 'scene';
  findings: string;
  details: Record<string, any>;
  duration: number;
}

export class AudioService {
  private inferenceEngine: InferenceEngine;

  constructor(inferenceEngine: InferenceEngine) {
    this.inferenceEngine = inferenceEngine;
  }

  /**
   * Transcribe audio using Gemma 3n native ASR
   */
  async transcribeWithGemma(audioSource: string): Promise<TranscriptionResult> {
    console.log('🎤 Transcribing audio with Gemma 3n...');

    const startTime = Date.now();

    try {
      const result = await this.inferenceEngine.generateMultimodal(
        [
          { text: 'Please transcribe the speech in this audio file. Provide only the transcription text, nothing else.' },
          { audioSource },
        ],
        {
          maxTokens: 512,
          temperature: 0.3, // Lower temperature for more accurate transcription
          topP: 0.9,
          streamTokens: false,
        }
      );

      const duration = (Date.now() - startTime) / 1000;

      return {
        text: result.text.trim(),
        duration,
      };
    } catch (error) {
      console.error('❌ Gemma transcription failed:', error);
      throw new Error(`Transcription failed: ${error}`);
    }
  }

  /**
   * Translate audio between languages using Gemma 3n
   * Supports: English ↔ Spanish, French, Italian, Portuguese
   */
  async translateAudio(
    audioSource: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationResult> {
    console.log(`🌐 Translating audio from ${sourceLanguage} to ${targetLanguage}...`);

    const startTime = Date.now();

    const languageNames: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      it: 'Italian',
      pt: 'Portuguese',
    };

    const sourceLang = languageNames[sourceLanguage] || sourceLanguage;
    const targetLang = languageNames[targetLanguage] || targetLanguage;

    try {
      // First, get the transcription in original language
      const transcriptionResult = await this.inferenceEngine.generateMultimodal(
        [
          {
            text: `Transcribe the speech in this ${sourceLang} audio file. Provide only the transcription, nothing else.`,
          },
          { audioSource },
        ],
        {
          maxTokens: 512,
          temperature: 0.3,
          topP: 0.9,
          streamTokens: false,
        }
      );

      const originalText = transcriptionResult.text.trim();

      // Then translate it
      const translationResult = await this.inferenceEngine.generate(
        `Translate the following ${sourceLang} text to ${targetLang}. Provide only the translation, nothing else:\n\n${originalText}`,
        {
          maxTokens: 512,
          temperature: 0.3,
          topP: 0.9,
          streamTokens: false,
        }
      );

      const duration = (Date.now() - startTime) / 1000;

      return {
        originalText,
        translatedText: translationResult.text.trim(),
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        duration,
      };
    } catch (error) {
      console.error('❌ Audio translation failed:', error);
      throw new Error(`Translation failed: ${error}`);
    }
  }

  /**
   * Analyze audio beyond speech
   * Supports: sound recognition, emotion detection, scene understanding
   */
  async analyzeAudio(
    audioSource: string,
    analysisType: 'speech' | 'sounds' | 'emotion' | 'scene'
  ): Promise<AnalysisResult> {
    console.log(`🔍 Analyzing audio (${analysisType})...`);

    const startTime = Date.now();

    const prompts: Record<typeof analysisType, string> = {
      speech: 'Analyze the speech in this audio. Provide: 1) Transcription, 2) Speaking style, 3) Clarity, 4) Pace.',
      sounds:
        'Analyze the sounds in this audio. Identify: 1) All audible sounds, 2) Background noises, 3) Music or ambient sounds, 4) Any notable audio characteristics.',
      emotion:
        'Analyze the emotion and tone in this audio. Describe: 1) Primary emotion, 2) Tone of voice, 3) Energy level, 4) Mood indicators.',
      scene:
        'Analyze the audio scene and context. Describe: 1) Environment/location, 2) Number of speakers, 3) Background activity, 4) Overall context.',
    };

    try {
      const result = await this.inferenceEngine.generateMultimodal(
        [{ text: prompts[analysisType] }, { audioSource }],
        {
          maxTokens: 512,
          temperature: 0.7,
          topP: 0.9,
          streamTokens: false,
        }
      );

      const duration = (Date.now() - startTime) / 1000;

      return {
        type: analysisType,
        findings: result.text.trim(),
        details: {
          processingTime: result.metadata.totalGenerationTime,
          audioProcessingTime: result.metadata.audioProcessingTime,
        },
        duration,
      };
    } catch (error) {
      console.error('❌ Audio analysis failed:', error);
      throw new Error(`Analysis failed: ${error}`);
    }
  }

  /**
   * Get quick audio analysis preset prompts
   */
  static getPresetPrompts(): Array<{ label: string; prompt: string; icon: string }> {
    return [
      {
        label: 'Transcribe',
        prompt: 'Please transcribe this audio file.',
        icon: '🎤',
      },
      {
        label: 'What sounds?',
        prompt: 'What sounds do you hear in this audio?',
        icon: '🔊',
      },
      {
        label: 'Emotion',
        prompt: 'Analyze the emotion and tone in this audio.',
        icon: '😊',
      },
      {
        label: 'Scene',
        prompt: 'Describe the audio scene and environment.',
        icon: '🎬',
      },
      {
        label: 'Identify music',
        prompt: 'Identify any music, instruments, or musical elements in this audio.',
        icon: '🎵',
      },
      {
        label: 'Speaker count',
        prompt: 'How many different speakers are in this audio?',
        icon: '👥',
      },
    ];
  }
}
