/**
 * Hidden Themes Configuration
 * Special themes that can be activated via commands or Konami code
 * @author Dr. Ernesto Lee
 */

export interface Theme {
  id: string;
  name: string;
  command: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
  };
  effects?: {
    glow?: boolean;
    particles?: boolean;
    gradient?: string;
  };
}

export const HIDDEN_THEMES: Theme[] = [
  {
    id: 'matrix',
    name: 'Matrix',
    command: 'konami', // Activated by Konami code
    colors: {
      primary: '#00ff00',
      secondary: '#008800',
      background: '#000000',
      foreground: '#00ff00',
      accent: '#00ff00',
    },
    effects: {
      glow: true,
      particles: true,
      gradient: 'linear-gradient(180deg, #000000 0%, #001100 100%)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    command: '/midnight',
    colors: {
      primary: '#4f46e5',
      secondary: '#818cf8',
      background: '#0f172a',
      foreground: '#e2e8f0',
      accent: '#6366f1',
    },
    effects: {
      glow: true,
      gradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    command: '/neon',
    colors: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      background: '#0a0a0a',
      foreground: '#ffffff',
      accent: '#ff00ff',
    },
    effects: {
      glow: true,
      particles: false,
      gradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a001a 100%)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    command: '/sunset',
    colors: {
      primary: '#ff6b6b',
      secondary: '#ffa500',
      background: '#1a1a2e',
      foreground: '#ffffff',
      accent: '#ff6b6b',
    },
    effects: {
      glow: false,
      gradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    },
  },
  {
    id: 'hacker',
    name: 'Hacker',
    command: '/hacker',
    colors: {
      primary: '#39ff14',
      secondary: '#00ff00',
      background: '#000000',
      foreground: '#39ff14',
      accent: '#00ff00',
    },
    effects: {
      glow: true,
      particles: false,
      gradient: 'linear-gradient(180deg, #000000 0%, #001a00 100%)',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    command: '/minimal',
    colors: {
      primary: '#666666',
      secondary: '#999999',
      background: '#ffffff',
      foreground: '#000000',
      accent: '#333333',
    },
    effects: {
      glow: false,
      gradient: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
    },
  },
];

export function getThemeByCommand(command: string): Theme | undefined {
  return HIDDEN_THEMES.find((theme) => theme.command === command);
}

export function getThemeById(id: string): Theme | undefined {
  return HIDDEN_THEMES.find((theme) => theme.id === id);
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // Apply color variables
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-foreground', theme.colors.foreground);
  root.style.setProperty('--color-accent', theme.colors.accent);

  // Apply gradient if exists
  if (theme.effects?.gradient) {
    root.style.setProperty('--bg-gradient', theme.effects.gradient);
  }

  // Store theme in localStorage
  localStorage.setItem('selected-theme', theme.id);
}

export function resetTheme() {
  const root = document.documentElement;

  // Remove custom properties
  root.style.removeProperty('--color-primary');
  root.style.removeProperty('--color-secondary');
  root.style.removeProperty('--color-background');
  root.style.removeProperty('--color-foreground');
  root.style.removeProperty('--color-accent');
  root.style.removeProperty('--bg-gradient');

  localStorage.removeItem('selected-theme');
}

export function loadSavedTheme() {
  const savedThemeId = localStorage.getItem('selected-theme');
  if (savedThemeId) {
    const theme = getThemeById(savedThemeId);
    if (theme) {
      applyTheme(theme);
      return theme;
    }
  }
  return null;
}
