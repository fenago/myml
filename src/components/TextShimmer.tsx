/**
 * Text Shimmer Effect
 * Animated gradient shimmer effect on text
 * @author Dr. Ernesto Lee
 */

import { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
  duration?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export function TextShimmer({
  children,
  className = '',
  shimmerWidth = 100,
  duration = 2,
  as: Component = 'p',
}: Props) {
  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }

          .shimmer-text {
            background: linear-gradient(
              90deg,
              #1a1a1a 0%,
              #1a1a1a 40%,
              #6366f1 50%,
              #1a1a1a 60%,
              #1a1a1a 100%
            );
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer ${duration}s ease-in-out infinite;
          }
        `}
      </style>
      <Component className={`shimmer-text ${className}`}>
        {children}
      </Component>
    </>
  );
}
