/**
 * Camera Capture Component - Live webcam preview and capture
 * @author Dr. Ernesto Lee
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cameraService, type CameraDevice } from '../services/CameraService';

interface Props {
  onCapture: (images: string[]) => void;
  onClose: () => void;
  resolution: number;
}

export function CameraCapture({ onCapture, onClose, resolution }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'single' | 'continuous'>('single');
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initCamera();
    return () => {
      cameraService.stopCamera();
    };
  }, []);

  const initCamera = async () => {
    try {
      // Check if camera is supported
      if (!cameraService.isCameraSupported()) {
        setError('Camera is not supported in this browser.');
        return;
      }

      // Get available cameras
      const devices = await cameraService.getAvailableCameras();
      setCameras(devices);

      // Start default camera
      const mediaStream = await cameraService.startCamera();
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const switchCamera = async (deviceId: string) => {
    try {
      setError('');
      cameraService.stopCamera();

      const mediaStream = await cameraService.startCamera(deviceId);
      setStream(mediaStream);
      setSelectedCamera(deviceId);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCaptureSingle = () => {
    if (!videoRef.current) return;

    try {
      const frame = cameraService.captureFrame(videoRef.current, resolution);
      setCapturedFrames([frame]);
    } catch (err: any) {
      setError('Failed to capture frame: ' + err.message);
    }
  };

  const handleCaptureContinuous = async () => {
    if (!videoRef.current) return;

    try {
      setIsCapturing(true);
      const frames = await cameraService.captureFrames(
        videoRef.current,
        5, // Capture 5 frames
        1000, // 1 second interval
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
      cameraService.stopCamera();
      onClose();
    }
  };

  const handleClose = () => {
    cameraService.stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Camera Capture</h2>
              <p className="text-sm text-blue-100">Take photos to share with AI</p>
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
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Camera Error</h4>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Camera Selection */}
          {cameras.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Camera
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => switchCamera(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video Preview */}
          <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {stream && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>
            )}
          </div>

          {/* Capture Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setCaptureMode('single')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                captureMode === 'single'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Single Photo
            </button>
            <button
              onClick={() => setCaptureMode('continuous')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                captureMode === 'continuous'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              5 Frames (1s apart)
            </button>
          </div>

          {/* Capture Button */}
          <button
            onClick={captureMode === 'single' ? handleCaptureSingle : handleCaptureContinuous}
            disabled={!stream || isCapturing}
            className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Capture {captureMode === 'single' ? 'Photo' : 'Frames'}
              </>
            )}
          </button>

          {/* Preview Captured Frames */}
          {capturedFrames.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Captured ({capturedFrames.length} {capturedFrames.length === 1 ? 'frame' : 'frames'})
              </h4>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {capturedFrames.map((frame, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-500">
                    <img src={frame} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <button
                onClick={handleConfirm}
                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
              >
                Use {capturedFrames.length === 1 ? 'This Photo' : 'These Photos'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
