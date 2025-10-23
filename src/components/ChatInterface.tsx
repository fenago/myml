/**
 * Chat Interface Component
 * Main chat UI with messages and input
 *
 * @author Dr. Ernesto Lee
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { Settings } from './Settings';
import { TextShimmer } from './TextShimmer';
import { getModelConfig } from '../config/models';
import type { MultimodalInput } from './ChatInput';

interface Props {
  onSendMessage: (input: MultimodalInput) => void;
  onChangeModel?: () => void;
}

export function ChatInterface({ onSendMessage, onChangeModel }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentConversationId, conversations, isGenerating, currentModelId, settings } = useStore();
  const [showSettings, setShowSettings] = useState(false);

  const currentConversation = currentConversationId
    ? conversations[currentConversationId]
    : null;

  const currentModel = getModelConfig(currentModelId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, isGenerating]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {settings.microinteractions.textShimmer ? (
            <TextShimmer as="h1" className="text-xl font-semibold" duration={2.5}>
              MyML
            </TextShimmer>
          ) : (
            <h1 className="text-xl font-semibold text-foreground">MyML</h1>
          )}
          <div className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground flex items-center gap-2">
            <span>{currentModel.icon}</span>
            <span>{currentModel.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden sm:flex gap-4 text-sm mr-4">
            <a href="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>
          <button
            onClick={() => setShowSettings(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Settings</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Ready</span>
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {currentConversation && currentConversation.messages.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            {currentConversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isGenerating && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                Start a conversation
              </h3>
              <p className="text-muted-foreground">
                Ask me anything! I'm running entirely in your browser with zero data transmission.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={onSendMessage}
        disabled={isGenerating}
        supportMultimodal={currentModel.capabilities.length > 1}
        placeholder={
          isGenerating ? 'Please wait...' : 'Ask anything... (100% private)'
        }
      />

      {/* Attribution */}
      <div className="text-center py-3 text-xs text-muted-foreground">
        Created by{' '}
        <a
          href="https://drlee.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:underline"
        >
          Dr. Ernesto Lee
        </a>
        {' · '}
        <span>All processing happens in your browser</span>
      </div>

      {/* Settings Modal */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
