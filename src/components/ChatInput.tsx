/**
 * Chat Input Component with Multimodal Support
 * Google-inspired minimal input box
 *
 * @author Dr. Ernesto Lee
 */

import { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

export interface MultimodalInput {
  text?: string;
  imageFiles?: File[];
  audioFiles?: File[];
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || imageFiles.length > 0 || audioFiles.length > 0) && !disabled) {
      onSend({
        text: input.trim() || undefined,
        imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
        audioFiles: audioFiles.length > 0 ? audioFiles : undefined,
      });
      setInput('');
      setImageFiles([]);
      setAudioFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAudioFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
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

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      {/* File Previews */}
      {(imageFiles.length > 0 || audioFiles.length > 0) && (
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
          {/* Multimodal Upload Buttons */}
          {supportMultimodal && (
            <div className="flex gap-1 flex-shrink-0">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={disabled}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                title="Upload image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleAudioUpload}
                className="hidden"
              />
              <button
                onClick={() => audioInputRef.current?.click()}
                disabled={disabled}
                className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                title="Upload audio"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
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
            disabled={disabled || (!input.trim() && imageFiles.length === 0 && audioFiles.length === 0)}
            className={`
              p-3 rounded-xl flex-shrink-0
              transition-all duration-200
              ${
                disabled || (!input.trim() && imageFiles.length === 0 && audioFiles.length === 0)
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

      {/* Hint */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift + Enter</kbd> for new line
        {supportMultimodal && <span className="ml-2">· Upload images & audio for multimodal chat</span>}
      </p>
    </div>
  );
}
