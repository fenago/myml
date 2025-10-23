/**
 * Screen Capture Component - Screen sharing and capture
 * @author Dr. Ernesto Lee
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { screenCaptureService } from '../services/ScreenCaptureService';

interface Props {
  onCapture: (images: string[]) => void;
  onClose: () => void;
  resolution: number;
}

export function ScreenCapture({ onCapture, onClose, resolution }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'single' | 'continuous'>('single');
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      screenCaptureService.stopScreenCapture();
    };
  }, []);

  const startSharing = async () => {
    try {
      setError('');

      // Check if screen capture is supported
      if (!screenCaptureService.isScreenCaptureSupported()) {
        setError('Screen sharing is not supported in this browser.');
        return;
      }

      const mediaStream = await screenCaptureService.startScreenCapture();
      setStream(mediaStream);
      setIsSharing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Listen for when user stops sharing via browser UI
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        setIsSharing(false);
        setStream(null);
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stopSharing = () => {
    screenCaptureService.stopScreenCapture();
    setIsSharing(false);
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCaptureSingle = () => {
    if (!videoRef.current) return;

    try {
      const frame = screenCaptureService.captureFrame(videoRef.current, resolution);
      setCapturedFrames([frame]);
    } catch (err: any) {
      setError('Failed to capture frame: ' + err.message);
    }
  };

  const handleCaptureContinuous = async () => {
    if (!videoRef.current) return;

    try {
      setIsCapturing(true);
      const frames = await screenCaptureService.captureFrames(
        videoRef.current,
        3, // Capture 3 frames
        2000, // 2 second interval
        resolution
      );
      setCapturedFrames(frames);
      setIsCapturing(false);
    } catch (err: any) {
      setError('Failed to capture frames: ' + err.message);
      setIsCapturing(false);
    }
  };

  const handleConfirm = () => {
    if (capturedFrames.length > 0) {
      onCapture(capturedFrames);
      screenCaptureService.stopScreenCapture();
      onClose();
    }
  };

  const handleClose = () => {
    screenCaptureService.stopScreenCapture();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Screen Capture</h2>
              <p className="text-sm text-purple-100">Share your screen with AI</p>
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
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Screen Capture Error</h4>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          ) : null}

          {!isSharing ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Share Your Screen
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Click the button below to select a window, tab, or your entire screen to share with the AI.
              </p>
              <button
                onClick={startSharing}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Start Screen Sharing
              </button>
            </div>
          ) : (
            <>
              {/* Video Preview */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    SHARING SCREEN
                  </div>
                  <button
                    onClick={stopSharing}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-full transition-colors"
                  >
                    Stop Sharing
                  </button>
                </div>
              </div>

              {/* Capture Mode Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setCaptureMode('single')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    captureMode === 'single'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Single Screenshot
                </button>
                <button
                  onClick={() => setCaptureMode('continuous')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                    captureMode === 'continuous'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  3 Frames (2s apart)
                </button>
              </div>

              {/* Capture Button */}
              <button
                onClick={captureMode === 'single' ? handleCaptureSingle : handleCaptureContinuous}
                disabled={!stream || isCapturing}
                className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isCapturing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Capturing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Capture {captureMode === 'single' ? 'Screenshot' : 'Frames'}
                  </>
                )}
              </button>

              {/* Preview Captured Frames */}
              {capturedFrames.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Captured ({capturedFrames.length} {capturedFrames.length === 1 ? 'frame' : 'frames'})
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {capturedFrames.map((frame, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden border-2 border-purple-500">
                        <img src={frame} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleConfirm}
                    className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Use {capturedFrames.length === 1 ? 'This Screenshot' : 'These Screenshots'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
