/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcuts for the app
 * @author Dr. Ernesto Lee
 */

import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const { settings } = useStore();

  useEffect(() => {
    // Check if shortcuts are enabled
    if (!settings.easterEggs.allEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      shortcuts.forEach(shortcut => {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        // Special handling for Ctrl+Enter - allow in input fields
        const allowInInput = shortcut.key === 'Enter' && shortcut.ctrl;

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (!isInputField || allowInInput) {
            e.preventDefault();
            shortcut.action();
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, settings.easterEggs.allEnabled]);
}

// Export common shortcuts configuration
export const getShortcutsDocumentation = () => [
  { keys: 'Ctrl + Enter', description: 'Send message' },
  { keys: 'Ctrl + K', description: 'Clear conversation' },
  { keys: 'Ctrl + /', description: 'Toggle settings' },
  { keys: 'Esc', description: 'Close modal/settings' },
  { keys: 'Shift + Enter', description: 'New line in message' },
];
