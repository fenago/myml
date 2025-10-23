/**
 * Model Load Progress Component
 * Shows download progress for models
 *
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import type { ModelLoadProgress as ProgressType } from '../types';
import { formatBytes } from '../config/models';

interface Props {
  progress: ProgressType | null;
  modelName: string;
  status?: 'downloading' | 'loading';
}

export function ModelLoadProgress({ progress, modelName, status }: Props) {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  // Show "Preparing..." state before first progress update
  const isPreparingDownload = !progress;
  const isDownloading = progress && progress.percentage > 0 && progress.percentage < 100;
  const isDownloadComplete = progress && progress.percentage >= 100;
  const isMediaPipeLoading = status === 'loading';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm border border-blue-500/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {isDownloadComplete && isMediaPipeLoading ? (
              'Almost There!'
            ) : isMediaPipeLoading ? (
              'Initializing'
            ) : isDownloading ? (
              'Downloading'
            ) : (
              'Preparing'
            )}{' '}
            {!isDownloadComplete && modelName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isPreparingDownload ? (
              'Preparing download...'
            ) : isDownloadComplete && isMediaPipeLoading ? (
              'Model downloaded successfully! Now initializing AI engine...'
            ) : isMediaPipeLoading ? (
              'MediaPipe is initializing the model...'
            ) : (
              <>
                {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
                {' · '}
                {formatBytes(progress.speed)}/s
              </>
            )}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-4">
          {/* Regular progress bar */}
          {!isPreparingDownload && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            />
          )}
          {/* Animated pulse for preparing state */}
          {isPreparingDownload && (
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
            />
          )}
        </div>

        {/* Percentage and ETA */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-2xl font-semibold text-foreground">
            {isPreparingDownload ? '--' : `${progress.percentage.toFixed(1)}%`}
          </span>
          <span className="text-sm text-muted-foreground">
            {isPreparingDownload ? 'Preparing...' : `ETA: ${formatTime(progress.eta)}`}
          </span>
        </div>

        {/* Info */}
        <div className="text-center">
          {isDownloadComplete && isMediaPipeLoading ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">
                The model is setting up the AI engine...
              </p>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>This may take 30-90 seconds.</strong> Yes, it's a bit slow, but consider it the small price for having a completely <strong>free, private, and powerful AI</strong> that runs entirely in your browser. No subscriptions, no tracking, just pure AI magic! ✨
                </p>
              </div>
              <p className="text-xs text-gray-500 italic">
                Next time will be instant - this setup only happens once!
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              This download only happens once. The model will be cached in your browser for future use.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
