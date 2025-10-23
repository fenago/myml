/**
 * Konami Code Easter Egg Hook
 * Detects the classic Konami code: ↑↑↓↓←→←→BA
 * @author Dr. Ernesto Lee
 */

import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function useKonamiCode(onSuccess: () => void) {
  const { settings } = useStore();
  const keysPressed = useRef<string[]>([]);
  const enabled = settings.easterEggs.konamiCode;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Add key to the sequence
      keysPressed.current.push(e.key.toLowerCase());

      // Keep only the last 10 keys (length of Konami code)
      if (keysPressed.current.length > KONAMI_CODE.length) {
        keysPressed.current.shift();
      }

      // Check if the sequence matches
      const matches = keysPressed.current.every(
        (key, index) => key === KONAMI_CODE[index].toLowerCase()
      );

      if (matches && keysPressed.current.length === KONAMI_CODE.length) {
        onSuccess();
        keysPressed.current = []; // Reset after success
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onSuccess]);
}
