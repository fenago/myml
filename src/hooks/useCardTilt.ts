/**
 * Card Tilt Hook - 3D perspective effect on hover
 * @author Dr. Ernesto Lee
 */

import { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export function useCardTilt<T extends HTMLElement = HTMLDivElement>(maxTilt: number = 10) {
  const ref = useRef<T>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { settings } = useStore();
  const enabled = settings.microinteractions.cardTilt;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const tiltX = ((y - centerY) / centerY) * maxTilt;
      const tiltY = -((x - centerX) / centerX) * maxTilt;

      setTilt({ x: tiltX, y: tiltY });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, maxTilt]);

  const style = enabled
    ? {
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.1s ease-out',
      }
    : {};

  return { ref, style };
}
