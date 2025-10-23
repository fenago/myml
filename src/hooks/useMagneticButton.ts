/**
 * Magnetic Button Hook - Buttons pull cursor toward them
 * @author Dr. Ernesto Lee
 */

import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export function useMagneticButton<T extends HTMLElement = HTMLButtonElement>(strength: number = 0.3) {
  const ref = useRef<T>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { settings } = useStore();
  const enabled = settings.microinteractions.magneticButtons;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const button = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      const distanceX = e.clientX - buttonCenterX;
      const distanceY = e.clientY - buttonCenterY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      // Only activate within 100px radius
      if (distance < 100) {
        const pullX = distanceX * strength;
        const pullY = distanceY * strength;
        setPosition({ x: pullX, y: pullY });
      } else {
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, strength]);

  return { ref, position };
}
