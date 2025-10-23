/**
 * Enhanced Context Indicator
 * Shows token usage with smooth animations and color transitions
 * @author Dr. Ernesto Lee
 */

import { motion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

interface Props {
  tokensUsed: number;
  contextLimit: number;
}

export function ContextIndicator({ tokensUsed, contextLimit }: Props) {
  const { settings } = useStore();
  const tokenPercentage = (tokensUsed / contextLimit) * 100;
  const [displayValue, setDisplayValue] = useState((tokensUsed / 1000).toFixed(1));

  // Animated token counter with spring physics
  const springTokens = useSpring(tokensUsed, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  useEffect(() => {
    springTokens.set(tokensUsed);
    const unsubscribe = springTokens.on('change', (latest) => {
      setDisplayValue((latest / 1000).toFixed(1));
    });
    return unsubscribe;
  }, [tokensUsed, springTokens]);

  // Determine color based on percentage
  const getColor = () => {
    if (tokenPercentage < 50) return { bg: 'bg-green-500', shadow: 'shadow-green-500/50' };
    if (tokenPercentage < 75) return { bg: 'bg-yellow-500', shadow: 'shadow-yellow-500/50' };
    if (tokenPercentage < 90) return { bg: 'bg-orange-500', shadow: 'shadow-orange-500/50' };
    return { bg: 'bg-red-500', shadow: 'shadow-red-500/50' };
  };

  const colors = getColor();
  const isNearLimit = tokenPercentage >= 80;

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 group relative"
      animate={isNearLimit ? {
        scale: [1, 1.02, 1],
      } : {}}
      transition={isNearLimit ? {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      } : {}}
    >
      {/* Enhanced Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
        <div className="font-semibold mb-1">Conversation Context</div>
        <div className="font-mono text-center">{tokensUsed.toLocaleString()} / {contextLimit.toLocaleString()} tokens</div>
        <div className="text-gray-400 mt-1">{tokenPercentage.toFixed(1)}% of context used</div>
        <div className="text-gray-500 text-[10px] mt-2 max-w-[200px]">
          Context tracks how much of the conversation history is being used. Color changes from green to red as you approach the limit.
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>

      <span className="text-xs text-muted-foreground hidden sm:inline">Context:</span>

      {/* Progress bar */}
      <div className="w-16 sm:w-24 h-2 bg-background rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full ${colors.bg} ${isNearLimit ? colors.shadow : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(tokenPercentage, 100)}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
          }}
        />
        {isNearLimit && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Animated token count */}
      <motion.span className="text-xs font-mono text-muted-foreground">
        {settings.microinteractions.allEnabled ? (
          <span>{displayValue}K</span>
        ) : (
          <span>{(tokensUsed / 1000).toFixed(1)}K</span>
        )}
      </motion.span>

      {/* Info icon - always visible to indicate hover for details */}
      <motion.svg
        className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-blue-500 transition-colors cursor-help"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </motion.svg>

      {/* Warning icon when near limit */}
      {isNearLimit && (
        <motion.svg
          className="w-3 h-3 text-orange-500"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </motion.svg>
      )}
    </motion.div>
  );
}
