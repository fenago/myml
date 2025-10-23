/**
 * Chat Interface - Modern design with glassmorphism
 * Inspired by 21st.dev aesthetics
 * @author Dr. Ernesto Lee
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { getModelConfig } from '../config/models';
import { AuroraBackground } from './AuroraBackground';
import type { MultimodalInput } from './ChatInput';

interface Props {
  onSendMessage: (input: MultimodalInput) => void;
  onChangeModel?: () => void;
}

export function ChatInterfaceNew({ onSendMessage, onChangeModel }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentConversationId, conversations, isGenerating, currentModelId } = useStore();

  const currentConversation = currentConversationId
    ? conversations[currentConversationId]
    : null;

  const currentModel = getModelConfig(currentModelId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, isGenerating]);

  return (
    <AuroraBackground>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-20"
        >
          <div className="flex items-center gap-4">
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              BrowserGPT
            </motion.h1>

            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <span className="text-2xl">{currentModel.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{currentModel.name}</span>
                {currentModel.capabilities.length > 1 && (
                  <span className="text-xs text-white/60">Multimodal</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {onChangeModel && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onChangeModel}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-medium transition-all duration-200"
              >
                Change Model
              </motion.button>
            )}

            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-100">Ready</span>
            </div>
          </div>
        </motion.header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {currentConversation && currentConversation.messages.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <AnimatePresence mode="popLayout">
                {currentConversation.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center max-w-md">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-8xl mb-8"
                >
                  💬
                </motion.div>

                <h3 className="text-3xl font-bold text-white mb-4">
                  Start a conversation
                </h3>

                <p className="text-lg text-white/60 mb-8">
                  Ask me anything! I'm running entirely in your browser with{' '}
                  <span className="font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    zero data transmission
                  </span>
                  .
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    '💡 Explain quantum computing',
                    '✍️ Write a creative story',
                    '🔬 Help with my homework',
                  ].map((prompt, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSendMessage({ text: prompt.substring(4) })}
                      className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-left transition-all duration-200"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="backdrop-blur-xl bg-white/5 border-t border-white/10 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSend={onSendMessage}
              disabled={isGenerating}
              placeholder={
                isGenerating ? 'Please wait...' : 'Ask anything... (100% private)'
              }
            />
          </div>
        </div>

        {/* Attribution */}
        <div className="text-center py-3 text-xs text-white/30 backdrop-blur-xl bg-white/5 border-t border-white/10">
          Created by{' '}
          <a
            href="https://drlee.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white transition-colors underline decoration-white/20"
          >
            Dr. Ernesto Lee
          </a>
          {' · '}
          <span>All processing happens in your browser</span>
        </div>
      </div>
    </AuroraBackground>
  );
}
