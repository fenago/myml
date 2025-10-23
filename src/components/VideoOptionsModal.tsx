/**
 * Video Options Modal
 * Shows options for uploaded video files: describe, analyze, summarize, or Q&A
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '../store/useStore';

export type VideoAction = 'attach' | 'describe' | 'analyze' | 'summarize' | 'qa';

export interface VideoAnalysisOptions {
  analysisType: 'scene' | 'action' | 'object' | 'emotion';
}

export interface VideoQAOptions {
  question: string;
}

interface Props {
  isOpen: boolean;
  fileName: string;
  duration: number;
  onClose: () => void;
  onAction: (
    action: VideoAction,
    analysisOptions?: VideoAnalysisOptions,
    qaOptions?: VideoQAOptions
  ) => void;
}

const ANALYSIS_TYPES = [
  {
    type: 'scene' as const,
    icon: '🎬',
    title: 'Scene Detection',
    description: 'Identify scene changes and settings',
  },
  {
    type: 'action' as const,
    icon: '🏃',
    title: 'Action Recognition',
    description: 'Detect activities and movements',
  },
  {
    type: 'object' as const,
    icon: '🔍',
    title: 'Object Tracking',
    description: 'Identify and track objects/people',
  },
  {
    type: 'emotion' as const,
    icon: '😊',
    title: 'Emotion Analysis',
    description: 'Analyze facial expressions and mood',
  },
];

const PRESET_QUESTIONS = [
  'What is happening in this video?',
  'Who are the main people or objects?',
  'What is the setting or location?',
  'What actions are taking place?',
  'What is the overall mood or tone?',
];

export function VideoOptionsModal({ isOpen, fileName, duration, onClose, onAction }: Props) {
  const { settings } = useStore();
  const [selectedAction, setSelectedAction] = useState<VideoAction>('attach');
  const [analysisType, setAnalysisType] = useState<'scene' | 'action' | 'object' | 'emotion'>('scene');
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleAction = () => {
    if (selectedAction === 'analyze') {
      onAction(selectedAction, { analysisType });
    } else if (selectedAction === 'qa') {
      const question = customQuestion || selectedPreset;
      if (question) {
        onAction(selectedAction, undefined, { question });
      } else {
        alert('Please enter or select a question');
        return;
      }
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
          className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Video Options</h2>
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
                  <div className="text-sm text-muted-foreground">Send video with your message</div>
                </div>
              </div>
            </button>

            {/* Describe */}
            <button
              onClick={() => setSelectedAction('describe')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedAction === 'describe'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-border hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">📝</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Describe Video</div>
                  <div className="text-sm text-muted-foreground">
                    Get a detailed description of what's happening
                  </div>
                </div>
              </div>
            </button>

            {/* Analyze */}
            {settings.video.enableAnalysis && (
              <button
                onClick={() => setSelectedAction('analyze')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAction === 'analyze'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-green-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔍</div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Analyze Video</div>
                    <div className="text-sm text-muted-foreground">
                      Detect scenes, actions, objects, emotions
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
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-border hover:border-green-500/50'
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

            {/* Summarize */}
            <button
              onClick={() => setSelectedAction('summarize')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedAction === 'summarize'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-border hover:border-orange-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">📋</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Summarize Video</div>
                  <div className="text-sm text-muted-foreground">
                    Get key moments and overview
                  </div>
                </div>
              </div>
            </button>

            {/* Q&A */}
            {settings.video.enableQA && (
              <button
                onClick={() => setSelectedAction('qa')}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAction === 'qa'
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-border hover:border-pink-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">❓</div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Ask About Video</div>
                    <div className="text-sm text-muted-foreground">
                      Ask specific questions about the content
                    </div>
                  </div>
                </div>

                {selectedAction === 'qa' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Question
                      </label>
                      <textarea
                        value={customQuestion}
                        onChange={(e) => {
                          setCustomQuestion(e.target.value);
                          setSelectedPreset('');
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="What would you like to know about this video?"
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground resize-none"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Or choose a preset:
                      </label>
                      <div className="space-y-1">
                        {PRESET_QUESTIONS.map((question, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPreset(question);
                              setCustomQuestion('');
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                              selectedPreset === question
                                ? 'bg-pink-500/10 border border-pink-500'
                                : 'bg-background border border-border hover:border-pink-500/50'
                            }`}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
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
              {selectedAction === 'attach' && 'Attach Video'}
              {selectedAction === 'describe' && 'Describe'}
              {selectedAction === 'analyze' && 'Analyze'}
              {selectedAction === 'summarize' && 'Summarize'}
              {selectedAction === 'qa' && 'Ask Question'}
            </button>
          </div>

          {/* Info Footer */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">
              <strong>Tip:</strong> You can change default video behavior in Settings → Language & Voice
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
