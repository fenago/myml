/**
 * Chat Message Component
 * Displays user and assistant messages
 *
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import type { Message } from '../types';

interface Props {
  message: Message;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start gap-3 max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🤖</span>
          </div>
        )}

        {/* Message Content */}
        <div className="flex-1">
          <div
            className={`
              px-4 py-3 rounded-2xl
              ${
                isUser
                  ? 'bg-muted text-foreground rounded-br-sm'
                  : 'bg-card border border-border text-foreground rounded-bl-sm'
              }
            `}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>

          {/* Metadata */}
          {!isUser && message.tokensPerSecond && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground px-2">
              <span>⚡ {message.tokensPerSecond.toFixed(1)} tok/s</span>
              <span>·</span>
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
