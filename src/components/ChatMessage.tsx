/**
 * Chat Message Component
 * Displays user and assistant messages
 *
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { voiceService } from '../services/VoiceService';
import type { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useCardTilt } from '../hooks/useCardTilt';

interface Props {
  message: Message;
  onFork?: (messageId: string) => void;
}

export function ChatMessage({ message, onFork }: Props) {
  const isUser = message.role === 'user';
  const { settings } = useStore();
  const [showAllMetadata, setShowAllMetadata] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Card tilt effect for message cards
  const { ref: cardRef, style: cardStyle } = useCardTilt();

  const metadata = message.metadata || {};

  // Build metadata sections based on settings
  const metadataSections: { label: string; items: { key: string; value: string }[] }[] = [];

  // Performance metrics
  if (settings.metadata.showPerformance && !isUser) {
    const perfItems: { key: string; value: string }[] = [];
    if (metadata.tokensPerSecond || message.tokensPerSecond) {
      perfItems.push({ key: '⚡ Speed', value: `${(metadata.tokensPerSecond || message.tokensPerSecond)?.toFixed(1)} tok/s` });
    }
    if (metadata.responseLatency) {
      perfItems.push({ key: '⏱️ First token', value: `${metadata.responseLatency.toFixed(0)}ms` });
    }
    if (metadata.totalGenerationTime) {
      perfItems.push({ key: '🕐 Total time', value: `${(metadata.totalGenerationTime / 1000).toFixed(2)}s` });
    }
    if (perfItems.length > 0) {
      metadataSections.push({ label: 'Performance', items: perfItems });
    }
  }

  // Model info
  if (settings.metadata.showModelInfo && !isUser) {
    const modelItems: { key: string; value: string }[] = [];
    if (metadata.modelName) {
      modelItems.push({ key: '🤖 Model', value: metadata.modelName });
    }
    if (metadata.temperature !== undefined) {
      modelItems.push({ key: '🌡️ Temp', value: metadata.temperature.toFixed(2) });
    }
    if (metadata.topP !== undefined) {
      modelItems.push({ key: '🎯 Top-P', value: metadata.topP.toFixed(2) });
    }
    if (modelItems.length > 0) {
      metadataSections.push({ label: 'Model', items: modelItems });
    }
  }

  // Token counts
  if (settings.metadata.showTokenCounts && !isUser) {
    const tokenItems: { key: string; value: string }[] = [];
    if (metadata.inputTokens) {
      tokenItems.push({ key: '📥 Input', value: `${metadata.inputTokens} tokens` });
    }
    if (metadata.totalTokens) {
      tokenItems.push({ key: '📤 Output', value: `${metadata.totalTokens} tokens` });
    }
    if (tokenItems.length > 0) {
      metadataSections.push({ label: 'Tokens', items: tokenItems });
    }
  }

  // Multimodal info
  if (settings.metadata.showMultimodalInfo && !isUser) {
    const multimodalItems: { key: string; value: string }[] = [];
    if (metadata.imageProcessingTime) {
      multimodalItems.push({ key: '🖼️ Image proc', value: `${metadata.imageProcessingTime.toFixed(0)}ms` });
    }
    if (metadata.imageResolution) {
      multimodalItems.push({ key: '📐 Resolution', value: metadata.imageResolution });
    }
    if (metadata.audioProcessingTime) {
      multimodalItems.push({ key: '🎵 Audio proc', value: `${metadata.audioProcessingTime.toFixed(0)}ms` });
    }
    if (metadata.audioDuration) {
      multimodalItems.push({ key: '⏲️ Audio duration', value: `${metadata.audioDuration.toFixed(1)}s` });
    }
    if (metadata.videoProcessingTime) {
      multimodalItems.push({ key: '🎬 Video proc', value: `${metadata.videoProcessingTime.toFixed(0)}ms` });
    }
    if (metadata.videoDuration) {
      multimodalItems.push({ key: '⏲️ Video duration', value: `${metadata.videoDuration.toFixed(1)}s` });
    }
    if (multimodalItems.length > 0) {
      metadataSections.push({ label: 'Multimodal', items: multimodalItems });
    }
  }

  const hasAnyMetadata = metadataSections.length > 0 || (settings.metadata.showTimestamp && !isUser);

  // Text-to-speech handler
  const toggleSpeech = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      if (!voiceService.isSynthesisSupported()) {
        alert('Text-to-speech is not supported in this browser.');
        return;
      }

      voiceService.speak(
        message.content,
        {
          voice: settings.voice.outputVoice,
          rate: settings.voice.outputRate,
          pitch: settings.voice.outputPitch,
          lang: settings.language.responseLanguage,
        },
        () => {
          setIsSpeaking(false);
        },
        (error) => {
          console.error('TTS error:', error);
          setIsSpeaking(false);
        }
      );
      setIsSpeaking(true);
    }
  };

  // Copy to clipboard handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        voiceService.stopSpeaking();
      }
    };
  }, [isSpeaking]);

  return (
    <motion.div
      initial={
        isUser
          ? { opacity: 0, x: 50, scale: 0.95 }
          : { opacity: 0, scale: 0.95, y: 10 }
      }
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={
        isUser
          ? {
              duration: 0.4,
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }
          : {
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
            }
      }
      className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start gap-3 max-w-[70%] min-w-0 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        )}

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div
            ref={cardRef}
            className={`
              px-4 py-3 rounded-2xl overflow-hidden
              ${
                isUser
                  ? 'bg-muted text-foreground rounded-br-sm'
                  : 'bg-card border border-border text-foreground rounded-bl-sm'
              }
            `}
            style={{ wordWrap: 'break-word', overflowWrap: 'break-word', ...cardStyle }}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                style={{
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  maxWidth: '100%'
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Custom styling for paragraphs
                    p: ({children}: any) => (
                      <p
                        className="mb-2 last:mb-0"
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {children}
                      </p>
                    ),
                    // Custom styling for code blocks
                    code: ({node, inline, className, children, ...props}: any) => {
                      return inline ? (
                        <code
                          className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono"
                          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <code
                          className={`${className} text-xs block`}
                          style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    // Custom styling for pre blocks
                    pre: ({children}: any) => (
                      <pre
                        className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-2"
                        style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                      >
                        {children}
                      </pre>
                    ),
                    // Custom styling for links
                    a: ({children, href}: any) => (
                      <a
                        href={href}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Compact Metadata */}
          {(hasAnyMetadata || (settings.voice.enableOutput && !isUser) || onFork || true) && !showAllMetadata && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground px-2 flex-wrap">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted transition-colors ${
                  copied ? 'text-green-600' : ''
                }`}
                title="Copy message"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>

              {(hasAnyMetadata || settings.voice.enableOutput || onFork) && <span>·</span>}

              {/* Voice Output Button */}
              {settings.voice.enableOutput && !isUser && (
                <button
                  onClick={toggleSpeech}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted transition-colors ${
                    isSpeaking ? 'text-blue-600' : ''
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  {isSpeaking ? (
                    <>
                      <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                      <span>Listen</span>
                    </>
                  )}
                </button>
              )}

              {/* Fork Conversation Button */}
              {onFork && (
                <>
                  {settings.voice.enableOutput && !isUser && <span>·</span>}
                  <button
                    onClick={() => onFork(message.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted transition-colors"
                    title="Fork conversation from this message"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>Fork</span>
                  </button>
                </>
              )}

              {hasAnyMetadata && (settings.voice.enableOutput && !isUser || onFork) && <span>·</span>}

              {settings.metadata.showPerformance && (metadata.tokensPerSecond || message.tokensPerSecond) && (
                <span>⚡ {(metadata.tokensPerSecond || message.tokensPerSecond)?.toFixed(1)} tok/s</span>
              )}
              {settings.metadata.showTimestamp && (
                <>
                  {settings.metadata.showPerformance && (metadata.tokensPerSecond || message.tokensPerSecond) && <span>·</span>}
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                </>
              )}
              {metadataSections.length > 0 && (
                <>
                  <span>·</span>
                  <button
                    onClick={() => setShowAllMetadata(true)}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Show details
                  </button>
                </>
              )}
            </div>
          )}

          {/* Expanded Metadata */}
          {hasAnyMetadata && showAllMetadata && (
            <div className="mt-2 px-2">
              <div className="bg-muted/50 rounded-lg p-3 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-muted-foreground">Response Metadata</span>
                  <button
                    onClick={() => setShowAllMetadata(false)}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Hide
                  </button>
                </div>

                <div className="space-y-2">
                  {metadataSections.map((section, idx) => (
                    <div key={idx}>
                      <div className="font-medium text-muted-foreground/80 mb-1">{section.label}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-2">
                        {section.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between">
                            <span className="text-muted-foreground/60">{item.key}</span>
                            <span className="text-foreground font-mono">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {settings.metadata.showTimestamp && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground/60">🕐 Timestamp</span>
                        <span className="text-foreground font-mono">{new Date(message.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
