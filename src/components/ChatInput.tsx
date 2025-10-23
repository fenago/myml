/**
 * Chat Input Component with Multimodal Support
 * Google-inspired minimal input box
 *
 * @author Dr. Ernesto Lee
 */

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { voiceService } from '../services/VoiceService';
import { useStore } from '../store/useStore';

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
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { settings } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

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

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAudioFiles(prev => [...prev, ...files]);
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
  };

  const removeVideo = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);

    // Categorize files by type
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        setImageFiles(prev => [...prev, file]);
      } else if (file.type.startsWith('audio/')) {
        setAudioFiles(prev => [...prev, file]);
      } else if (file.type.startsWith('video/')) {
        setVideoFiles(prev => [...prev, file]);
      }
    });
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
          {audioFiles.map((file, index) => (
            <div key={`audio-${index}`} className="relative group px-3 py-2 bg-muted rounded-lg border border-border flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <span className="text-xs">{file.name}</span>
              <button
                onClick={() => removeAudio(index)}
                className="ml-2 w-4 h-4 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
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
                  className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'hover:bg-muted'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={disabled}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 relative"
                title="Attach files"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* Attachment Modal */}
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-0 mb-2 w-80 bg-card border border-border rounded-xl shadow-2xl p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-foreground">Attach Media</h3>
                    <button
                      onClick={() => setShowAttachMenu(false)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Images */}
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">Images</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Visual analysis, object detection, scene understanding</div>
                          <div className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP</div>
                        </div>
                      </div>
                    </button>

                    {/* Videos */}
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">Videos</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Video understanding, motion analysis, temporal reasoning</div>
                          <div className="text-xs text-muted-foreground/60 mt-1">MP4, WEBM, OGG</div>
                        </div>
                      </div>
                    </button>

                    {/* Audio */}
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">Audio</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Transcription, translation, speech-to-text (35 languages)</div>
                          <div className="text-xs text-muted-foreground/60 mt-1">MP3, WAV, OGG</div>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      All processing happens locally in your browser. No data is uploaded to servers.
                    </p>
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
          <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={handleSend}
            disabled={disabled || (!input.trim() && imageFiles.length === 0 && audioFiles.length === 0 && videoFiles.length === 0)}
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
          </motion.button>
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
    </div>
  );
}
