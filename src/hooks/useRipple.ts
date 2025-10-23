/**
 * Ripple Click Effect Hook - Material Design ripple on clicks
 * @author Dr. Ernesto Lee
 */

import { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useRipple<T extends HTMLElement = HTMLButtonElement>() {
  const ref = useRef<T>(null);
  const { settings } = useStore();
  const enabled = settings.microinteractions.rippleEffect;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;

    const handleClick = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;

      // Create ripple element
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.5)';
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple-effect 0.6s ease-out';
      ripple.style.pointerEvents = 'none';

      // Ensure parent has position relative
      const parentPosition = window.getComputedStyle(element).position;
      if (parentPosition === 'static') {
        element.style.position = 'relative';
      }
      element.style.overflow = 'hidden';

      element.appendChild(ripple);

      // Remove after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    element.addEventListener('click', handleClick);

    // Add CSS animation if not already present
    if (!document.getElementById('ripple-animation')) {
      const style = document.createElement('style');
      style.id = 'ripple-animation';
      style.textContent = `
        @keyframes ripple-effect {
          to {
            transform: scale(1);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [enabled]);

  return ref;
}
