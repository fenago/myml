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
import { exportService } from '../services/ExportService';
import type { MultimodalInput } from './ChatInput';

interface Props {
  onSendMessage: (input: MultimodalInput) => void;
  onChangeModel?: () => void;
}

export function ChatInterface({ onSendMessage }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentConversationId, conversations, isGenerating, currentModelId, settings } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const currentConversation = currentConversationId
    ? conversations[currentConversationId]
    : null;

  const currentModel = getModelConfig(currentModelId);

  // Calculate token usage (rough estimate)
  const estimateTokens = (text: string): number => {
    // Simple estimation: ~1 token per 4 characters or 1 token per word (whichever is higher)
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    return Math.round(Math.max(words, chars / 4));
  };

  const contextLimit = 32000; // GEMMA 3n context window
  const tokensUsed = currentConversation
    ? currentConversation.messages.reduce((total, msg) => total + estimateTokens(msg.content), 0)
    : 0;
  const tokenPercentage = (tokensUsed / contextLimit) * 100;

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages, isGenerating]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element).closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExportMenu]);

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

          {/* Export Menu */}
          {currentConversation && currentConversation.messages.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-2"
                title="Export Conversation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Export</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      exportService.exportAsJSON(currentConversation);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 rounded-t-lg"
                  >
                    <span>📄</span>
                    <span>Export as JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      exportService.exportAsMarkdown(currentConversation);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <span>📝</span>
                    <span>Export as Markdown</span>
                  </button>
                  <button
                    onClick={() => {
                      exportService.exportAsText(currentConversation);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <span>📋</span>
                    <span>Export as Text</span>
                  </button>
                  <button
                    onClick={() => {
                      exportService.exportAsHTML(currentConversation);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 rounded-b-lg"
                  >
                    <span>🌐</span>
                    <span>Export as HTML</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Context Indicator - Always visible */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50"
            title={`${tokensUsed.toLocaleString()} / ${contextLimit.toLocaleString()} tokens (${tokenPercentage.toFixed(1)}%)`}
          >
            <span className="text-xs text-muted-foreground hidden sm:inline">Context:</span>
            <div className="w-16 sm:w-24 h-2 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  tokenPercentage < 50
                    ? 'bg-green-500'
                    : tokenPercentage < 75
                    ? 'bg-yellow-500'
                    : tokenPercentage < 90
                    ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(tokenPercentage, 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {(tokensUsed / 1000).toFixed(1)}K
            </span>
          </div>

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
