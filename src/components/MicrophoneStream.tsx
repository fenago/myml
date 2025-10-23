/**
 * Microphone Stream Component - Real-time audio recording with waveform
 * @author Dr. Ernesto Lee
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { microphoneStreamService } from '../services/MicrophoneStreamService';

interface Props {
  onCapture: (audioBase64: string, duration: number) => void;
  onClose: () => void;
}

export function MicrophoneStream({ onCapture, onClose }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number>();

  useEffect(() => {
    return () => {
      microphoneStreamService.stopMicrophone();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      animateWaveform();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isRecording]);

  const animateWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Get frequency data
    const frequencyData = microphoneStreamService.getFrequencyData();
    const level = microphoneStreamService.getAudioLevel();
    setAudioLevel(level);

    if (frequencyData.length > 0) {
      const barWidth = width / frequencyData.length * 2;
      const barGap = 2;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#ec4899');

      ctx.fillStyle = gradient;

      // Draw bars
      for (let i = 0; i < frequencyData.length; i += 2) {
        const barHeight = (frequencyData[i] / 255) * height * 0.8;
        const x = i * (barWidth + barGap);
        const y = height - barHeight;

        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animateWaveform);
  };

  const startRecording = async () => {
    try {
      setError('');
      setIsPreparing(true);

      // Check if microphone is supported
      if (!microphoneStreamService.isMicrophoneSupported()) {
        setError('Microphone recording is not supported in this browser.');
        setIsPreparing(false);
        return;
      }

      // Start microphone stream
      await microphoneStreamService.startMicrophone();

      // Start recording
      microphoneStreamService.startRecording();

      setIsRecording(true);
      setIsPreparing(false);
      startTimeRef.current = Date.now();

      // Update duration every second
      durationIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setIsPreparing(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      const audioBase64 = await microphoneStreamService.stopRecording();
      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      onCapture(audioBase64, finalDuration);
      onClose();
    } catch (err: any) {
      setError('Failed to save recording: ' + err.message);
    }
  };

  const handleClose = () => {
    microphoneStreamService.stopMicrophone();
    onClose();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Audio Recording</h2>
              <p className="text-sm text-pink-100">Record audio message for AI</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Microphone Error</h4>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Waveform Visualization */}
          <div className="mb-6">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-48 bg-gray-900 rounded-xl"
            />
          </div>

          {/* Duration Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 dark:text-white font-mono">
              {formatDuration(duration)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {isRecording ? 'Recording in progress...' : 'Ready to record'}
            </p>
          </div>

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="mb-6">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 to-red-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${audioLevel * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isPreparing}
                className="flex-1 py-4 px-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isPreparing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Preparing...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                    Start Recording
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 py-4 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop & Save Recording
              </button>
            )}
          </div>

          {/* Info */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            💡 Maximum recording duration: 60 seconds
          </p>
        </div>
      </motion.div>
    </div>
  );
}
