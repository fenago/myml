/**
 * Milestone Celebration Component
 * Shows congratulations when reaching message milestones
 * @author Dr. Ernesto Lee
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  messageCount: number;
}

const MILESTONES = [100, 500, 1000, 5000, 10000];

export function MilestoneCelebration({ messageCount }: Props) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [milestone, setMilestone] = useState(0);

  useEffect(() => {
    // Check if we just hit a milestone
    if (MILESTONES.includes(messageCount)) {
      setMilestone(messageCount);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [messageCount]);

  if (!showCelebration) return null;

  const getMilestoneEmoji = (count: number) => {
    if (count >= 10000) return '🏆';
    if (count >= 5000) return '💎';
    if (count >= 1000) return '⭐';
    if (count >= 500) return '🎉';
    return '🎯';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: -100 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white rounded-3xl p-8 shadow-2xl backdrop-blur-lg border-4 border-white/30 pointer-events-auto">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.2, 1, 1.2, 1],
          }}
          transition={{ duration: 1, repeat: 2 }}
          className="text-center"
        >
          <div className="text-8xl mb-4">{getMilestoneEmoji(milestone)}</div>
          <h2 className="text-4xl font-bold mb-2">Milestone Reached!</h2>
          <p className="text-2xl font-semibold mb-4">{milestone.toLocaleString()} Messages</p>
          <p className="text-lg opacity-90">You're on a roll! Keep the conversation going!</p>
        </motion.div>

        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981'][i % 5],
              left: `${50 + Math.random() * 20 - 10}%`,
              top: `${50 + Math.random() * 20 - 10}%`,
            }}
            animate={{
              y: [0, -200, -400],
              x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 200],
              opacity: [1, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
