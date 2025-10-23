/**
 * Pinned Messages Component
 * Shows all pinned messages from the current conversation in a collapsible section
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Message } from '../types';

interface Props {
  pinnedMessages: Message[];
  onNavigateToMessage?: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
}

export function PinnedMessages({ pinnedMessages, onNavigateToMessage, onUnpin }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (pinnedMessages.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 border-b border-border pb-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-muted rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-yellow-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
          </svg>
          <span className="text-sm font-medium text-foreground">
            Pinned Messages ({pinnedMessages.length})
          </span>
        </div>
      </button>

      {/* Pinned Messages List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2 px-2"
          >
            {pinnedMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="group relative p-3 bg-muted/50 rounded-lg border border-border hover:border-yellow-500/50 transition-all cursor-pointer"
                onClick={() => onNavigateToMessage?.(message.id)}
              >
                {/* Role Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      message.role === 'user'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-purple-500/10 text-purple-600'
                    }`}
                  >
                    {message.role === 'user' ? '👤 User' : '🤖 Assistant'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Message Preview */}
                <p className="text-sm text-foreground line-clamp-3 mb-2">
                  {message.content}
                </p>

                {/* Unpin Button */}
                {onUnpin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpin(message.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    title="Unpin message"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
                      <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}

                {/* Click to navigate hint */}
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to navigate →
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
