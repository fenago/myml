/**
 * Chat Input Component with Multimodal Support
 * Google-inspired minimal input box
 *
 * @author Dr. Ernesto Lee
 */

import { useState, useRef, KeyboardEvent, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService } from '../services/VoiceService';
import { useStore } from '../store/useStore';
import { NeonGlowButton } from './microinteractions/NeonGlowButton';
import { useRipple } from '../hooks/useRipple';

// Lazy load heavy modal components for better performance
const CameraCapture = lazy(() => import('./CameraCapture').then(m => ({ default: m.CameraCapture })));
const ScreenCapture = lazy(() => import('./ScreenCapture').then(m => ({ default: m.ScreenCapture })));
const MicrophoneStream = lazy(() => import('./MicrophoneStream').then(m => ({ default: m.MicrophoneStream })));

export interface MultimodalInput {
  text?: string;
  imageFiles?: File[];
  audioFiles?: File[];
  videoFiles?: File[];
}

interface Props {
  onSend: (input: MultimodalInput) => void;
  disabled?: boolean;
  placeholder?: string;
  supportMultimodal?: boolean;
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Ask anything...', supportMultimodal = false }: Props) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [audioFileDurations, setAudioFileDurations] = useState<number[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showScreenCapture, setShowScreenCapture] = useState(false);
  const [showMicrophoneStream, setShowMicrophoneStream] = useState(false);
  const { settings } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Microinteraction hooks
  const attachButtonRef = useRipple();

  const handleSend = () => {
    if ((input.trim() || imageFiles.length > 0 || audioFiles.length > 0 || videoFiles.length > 0) && !disabled) {
      onSend({
        text: input.trim() || undefined,
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
        audioFiles: audioFiles.length > 0 ? audioFiles : undefined,
        videoFiles: videoFiles.length > 0 ? videoFiles : undefined,
      });
      setInput('');
      setImageFiles([]);
      setAudioFiles([]);
      setAudioFileDurations([]);
      setVideoFiles([]);
      setShowAttachMenu(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  // Calculate audio duration
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        resolve(0); // Return 0 if duration can't be determined
      });
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Calculate durations for all audio files
    const durations = await Promise.all(files.map(file => getAudioDuration(file)));

    setAudioFiles(prev => [...prev, ...files]);
    setAudioFileDurations(prev => [...prev, ...durations]);
    setShowAttachMenu(false);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVideoFiles(prev => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
    setAudioFileDurations(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Camera capture handler
  const handleCameraCapture = (images: string[]) => {
    // Convert base64 images to File objects
    const files = images.map((base64, index) => {
      const blob = base64ToBlob(base64);
      return new File([blob], `camera-capture-${Date.now()}-${index}.jpg`, { type: 'image/jpeg' });
    });
    setImageFiles(prev => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  // Screen capture handler
  const handleScreenCapture = (images: string[]) => {
    // Convert base64 images to File objects
    const files = images.map((base64, index) => {
      const blob = base64ToBlob(base64);
      return new File([blob], `screen-capture-${Date.now()}-${index}.jpg`, { type: 'image/jpeg' });
    });
    setImageFiles(prev => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  // Microphone capture handler
  const handleMicrophoneCapture = async (audioBase64: string, duration: number) => {
    // Convert base64 audio to File object
    const blob = base64ToBlob(audioBase64);
    const file = new File([blob], `microphone-${Date.now()}.webm`, { type: 'audio/webm' });
    setAudioFiles(prev => [...prev, file]);
    setAudioFileDurations(prev => [...prev, duration]);
    setShowAttachMenu(false);
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  // Drag and Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);

    // Separate files by type
    const imageFilesToAdd: File[] = [];
    const audioFilesToAdd: File[] = [];
    const videoFilesToAdd: File[] = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        imageFilesToAdd.push(file);
      } else if (file.type.startsWith('audio/')) {
        audioFilesToAdd.push(file);
      } else if (file.type.startsWith('video/')) {
        videoFilesToAdd.push(file);
      }
    });

    // Add files with duration calculation for audio
    if (imageFilesToAdd.length > 0) {
      setImageFiles(prev => [...prev, ...imageFilesToAdd]);
    }
    if (audioFilesToAdd.length > 0) {
      // Calculate durations for audio files
      const durations = await Promise.all(audioFilesToAdd.map(file => getAudioDuration(file)));
      setAudioFiles(prev => [...prev, ...audioFilesToAdd]);
      setAudioFileDurations(prev => [...prev, ...durations]);
    }
    if (videoFilesToAdd.length > 0) {
      setVideoFiles(prev => [...prev, ...videoFilesToAdd]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  // Voice input handlers
  const toggleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
      // Add transcript to input
      if (transcript) {
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setTranscript('');
      }
    } else {
      if (!voiceService.isRecognitionSupported()) {
        alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
        return;
      }

      voiceService.startListening(
        (result) => {
          setTranscript(result.transcript);
          if (result.isFinal) {
            setInput(prev => prev ? `${prev} ${result.transcript}` : result.transcript);
            setTranscript('');
            setIsListening(false);
          }
        },
        (error) => {
          console.error('Voice input error:', error);
          setIsListening(false);
          setTranscript('');
        },
        settings.language.audioTranscriptionLanguage
      );
      setIsListening(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        voiceService.stopListening();
      }
    };
  }, [isListening]);

  return (
    <div
      className="w-full max-w-3xl mx-auto px-4 pb-6 relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && supportMultimodal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-2xl z-50 flex items-center justify-center"
        >
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-blue-600">Drop files here</p>
            <p className="text-sm text-blue-500 mt-1">Images, videos, and audio supported</p>
          </div>
        </motion.div>
      )}

      {/* File Previews */}
      {(imageFiles.length > 0 || audioFiles.length > 0 || videoFiles.length > 0) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {imageFiles.map((file, index) => (
            <div key={`img-${index}`} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-20 w-20 object-cover rounded-lg border border-border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {videoFiles.map((file, index) => (
            <div key={`video-${index}`} className="relative group">
              <video
                src={URL.createObjectURL(file)}
                className="h-20 w-32 object-cover rounded-lg border border-border"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <button
                onClick={() => removeVideo(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {audioFiles.map((file, index) => {
            const duration = audioFileDurations[index] || 0;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const durationText = duration > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : 'Loading...';

            return (
              <div key={`audio-${index}`} className="relative group px-3 py-2 bg-muted rounded-lg border border-border flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{durationText}</p>
                </div>
                <button
                  onClick={() => removeAudio(index)}
                  className="w-4 h-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 32px 56px -12px rgba(0, 0, 0, 0.08), 0 6px 12px -3px rgba(0, 0, 0, 0.03)'
            : '0 32px 56px -12px rgba(0, 0, 0, 0.02), 0 6px 12px -3px rgba(0, 0, 0, 0.02)',
        }}
        className="
          bg-card border border-border rounded-2xl
          transition-all duration-200
        "
      >
        <div className="flex items-end gap-2 p-3">
          {/* Voice Input & Multimodal Buttons */}
          {(supportMultimodal || settings.voice.enableInput) && (
            <div className="flex gap-1 flex-shrink-0">
              {/* Voice Input Button */}
              {settings.voice.enableInput && (
                <button
                  onClick={toggleVoiceInput}
                  disabled={disabled}
                  className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'hover:bg-muted'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}

              {/* Unified Attachment Button */}
              {supportMultimodal && (
                <div className="relative flex-shrink-0">
              {/* Hidden File Inputs */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleAudioUpload}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
              />

              {/* Attach Button */}
              <button
                ref={attachButtonRef}
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={disabled}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 relative"
                title="Attach files"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Attachment Modal */}
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-0 mb-2 w-56 bg-card border border-border rounded-lg shadow-2xl p-2 z-50 max-h-[400px] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="font-semibold text-xs text-foreground">Add Media</h3>
                    <button
                      onClick={() => setShowAttachMenu(false)}
                      className="p-0.5 hover:bg-muted rounded text-muted-foreground"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Upload Files Section */}
                  <div className="mb-2">
                    <div className="text-[10px] font-medium text-muted-foreground px-1 mb-1">UPLOAD</div>
                    <div className="space-y-1">
                    {/* Images */}
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="font-medium text-xs text-foreground">Images</span>
                      </div>
                    </button>

                    {/* Videos */}
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        <span className="font-medium text-xs text-foreground">Videos</span>
                      </div>
                    </button>

                    {/* Audio */}
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <span className="font-medium text-xs text-foreground">Audio Files</span>
                      </div>
                    </button>
                    </div>
                  </div>

                  {/* Capture Section */}
                  <div>
                    <div className="text-[10px] font-medium text-muted-foreground px-1 mb-1">CAPTURE</div>
                    <div className="space-y-1">
                    {/* Camera Capture */}
                    <button
                      onClick={() => {
                        setShowCameraCapture(true);
                        setShowAttachMenu(false);
                      }}
                      className="w-full p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="font-medium text-xs text-foreground">Live Camera</span>
                      </div>
                    </button>

                    {/* Screen Capture */}
                    <button
                      onClick={() => {
                        setShowScreenCapture(true);
                        setShowAttachMenu(false);
                      }}
                      className="w-full p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="font-medium text-xs text-foreground">Screen Share</span>
                      </div>
                    </button>

                    {/* Microphone Stream */}
                    <button
                      onClick={() => {
                        setShowMicrophoneStream(true);
                        setShowAttachMenu(false);
                      }}
                      className="w-full p-2 bg-muted hover:bg-muted/80 rounded-md transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <span className="font-medium text-xs text-foreground">Record Audio</span>
                      </div>
                    </button>
                    </div>
                  </div>
                </motion.div>
              )}
                </div>
              )}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="
              flex-1 resize-none bg-transparent
              text-foreground placeholder:text-muted-foreground
              outline-none text-base py-2 px-2
              max-h-[200px] overflow-y-auto
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />

          {/* Send Button */}
          <NeonGlowButton
            onClick={handleSend}
            disabled={disabled || (!input.trim() && imageFiles.length === 0 && audioFiles.length === 0 && videoFiles.length === 0)}
            loading={disabled}
            className={`
              p-3 rounded-xl flex-shrink-0
              transition-all duration-200
              ${
                disabled || (!input.trim() && imageFiles.length === 0 && audioFiles.length === 0 && videoFiles.length === 0)
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer'
              }
            `}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2 11 13" />
              <path d="m22 2-7 20-4-9-9-4z" />
            </svg>
          </NeonGlowButton>
        </div>
      </motion.div>

      {/* Live Transcript Indicator */}
      {isListening && transcript && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-900 italic">"{transcript}"</span>
          </div>
        </motion.div>
      )}

      {/* Hint */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift + Enter</kbd> for new line
        {supportMultimodal && <span className="ml-2">· Attach images, videos & audio for multimodal analysis</span>}
        {settings.voice.enableInput && <span className="ml-2">· Click mic to speak</span>}
      </p>

      {/* Camera Capture Modal */}
      <AnimatePresence>
        {showCameraCapture && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"><div className="text-white">Loading camera...</div></div>}>
            <CameraCapture
              onCapture={handleCameraCapture}
              onClose={() => setShowCameraCapture(false)}
              resolution={parseInt(settings.imageResolution)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Screen Capture Modal */}
      <AnimatePresence>
        {showScreenCapture && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"><div className="text-white">Loading screen capture...</div></div>}>
            <ScreenCapture
              onCapture={handleScreenCapture}
              onClose={() => setShowScreenCapture(false)}
              resolution={parseInt(settings.imageResolution)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Microphone Stream Modal */}
      <AnimatePresence>
        {showMicrophoneStream && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"><div className="text-white">Loading recorder...</div></div>}>
            <MicrophoneStream
              onCapture={handleMicrophoneCapture}
              onClose={() => setShowMicrophoneStream(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
