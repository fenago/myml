/**
 * Neon Glow Button - Electric glow effect on hover
 * Enhanced with loading states and pulse animations
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  loading?: boolean;
}

export function NeonGlowButton({ children, onClick, disabled, className = '', type = 'button', loading = false }: Props) {
  const { settings } = useStore();
  const enabled = settings.microinteractions.neonGlowButtons;

  if (!enabled) {
    return (
      <button type={type} onClick={onClick} disabled={disabled || loading} className={className}>
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${className} relative overflow-hidden`}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{
        scale: disabled || loading ? 1 : 0.95,
      }}
      animate={loading ? {
        boxShadow: [
          '0 0 0px rgba(59, 130, 246, 0)',
          '0 0 15px rgba(59, 130, 246, 0.5)',
          '0 0 0px rgba(59, 130, 246, 0)',
        ],
      } : {}}
      transition={loading ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Neon Glow Effect */}
      {!disabled && !loading && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{
            opacity: [0, 1, 0.8],
            boxShadow: [
              '0 0 0px rgba(59, 130, 246, 0)',
              '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)',
              '0 0 25px rgba(59, 130, 246, 0.5), 0 0 50px rgba(139, 92, 246, 0.3)',
            ],
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}

      {/* Content with loading state */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative"
          >
            {/* Spinning gradient ring */}
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
