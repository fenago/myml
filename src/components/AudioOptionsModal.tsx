/**
 * Audio Options Modal
 * Shows options for uploaded audio files: transcribe, translate, analyze, or just attach
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '../store/useStore';

export type AudioAction = 'attach' | 'transcribe' | 'translate' | 'analyze';

export interface AudioTranslationOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface AudioAnalysisOptions {
  analysisType: 'speech' | 'sounds' | 'emotion' | 'scene';
}

interface Props {
  isOpen: boolean;
  fileName: string;
  duration: number;
  onClose: () => void;
  onAction: (
    action: AudioAction,
    translationOptions?: AudioTranslationOptions,
    analysisOptions?: AudioAnalysisOptions
  ) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
];

const ANALYSIS_TYPES = [
  {
    type: 'speech' as const,
    icon: '🗣️',
    title: 'Speech Transcription',
    description: 'Convert speech to text',
  },
  {
    type: 'sounds' as const,
    icon: '🔊',
    title: 'Sound Recognition',
    description: 'Identify sounds, music, ambient noise',
  },
  {
    type: 'emotion' as const,
    icon: '😊',
    title: 'Emotion Detection',
    description: 'Analyze voice tone and emotion',
  },
  {
    type: 'scene' as const,
    icon: '🎬',
    title: 'Scene Understanding',
    description: 'Understand audio context and environment',
  },
];

export function AudioOptionsModal({ isOpen, fileName, duration, onClose, onAction }: Props) {
  const { settings } = useStore();
  const [selectedAction, setSelectedAction] = useState<AudioAction>('attach');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [analysisType, setAnalysisType] = useState<'speech' | 'sounds' | 'emotion' | 'scene'>('speech');

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleAction = () => {
    if (selectedAction === 'translate') {
      onAction(selectedAction, { sourceLanguage, targetLanguage });
    } else if (selectedAction === 'analyze') {
      onAction(selectedAction, undefined, { analysisType });
    } else {
      onAction(selectedAction);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Audio Options</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {fileName} • {durationText}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Options */}
          <div className="space-y-3 mb-6">
            {/* Attach */}
            <button
              onClick={() => setSelectedAction('attach')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedAction === 'attach'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">📎</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Just Attach</div>
                  <div className="text-sm text-muted-foreground">Send audio with your message</div>
                </div>
              </div>
            </button>

            {/* Transcribe */}
            <button
              onClick={() => setSelectedAction('transcribe')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedAction === 'transcribe'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-border hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎤</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Transcribe Audio</div>
                  <div className="text-sm text-muted-foreground">
                    Convert speech to text using {settings.audio.asrProvider === 'gemma' ? 'Gemma 3n' : 'Web Speech API'}
                  </div>
                </div>
              </div>
            </button>

            {/* Translate */}
            {settings.audio.enableTranslation && (
              <button
                onClick={() => setSelectedAction('translate')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAction === 'translate'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-green-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🌐</div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Translate Audio</div>
                    <div className="text-sm text-muted-foreground">
                      Translate speech between languages (Gemma 3n)
                    </div>
                  </div>
                </div>

                {selectedAction === 'translate' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-center gap-3"
                  >
                    <select
                      value={sourceLanguage}
                      onChange={(e) => setSourceLanguage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                    <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </button>
            )}

            {/* Analyze */}
            {settings.audio.enableAnalysis && (
              <button
                onClick={() => setSelectedAction('analyze')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAction === 'analyze'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-border hover:border-orange-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔍</div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Analyze Audio</div>
                    <div className="text-sm text-muted-foreground">
                      Detect sounds, emotions, and context
                    </div>
                  </div>
                </div>

                {selectedAction === 'analyze' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 grid grid-cols-2 gap-2"
                  >
                    {ANALYSIS_TYPES.map((type) => (
                      <button
                        key={type.type}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnalysisType(type.type);
                        }}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          analysisType === type.type
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-border hover:border-orange-500/50'
                        }`}
                      >
                        <div className="text-xl mb-1">{type.icon}</div>
                        <div className="text-sm font-medium text-foreground">{type.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{type.description}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              {selectedAction === 'attach' && 'Attach Audio'}
              {selectedAction === 'transcribe' && 'Transcribe'}
              {selectedAction === 'translate' && 'Translate'}
              {selectedAction === 'analyze' && 'Analyze'}
            </button>
          </div>

          {/* Info Footer */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">
              <strong>Tip:</strong> You can change default audio behavior in Settings → Audio Features
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
