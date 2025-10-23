# UI/UX Design Guide: BrowserGPT
## Google-Inspired Minimalism with Modern Animations

**Version:** 1.0
**Last Updated:** 2025-10-22
**Design Philosophy:** Simple like Google, Modern like Magic
**Attribution:** Dr. Ernesto Lee

---

## Design Philosophy

BrowserGPT combines the **clean simplicity of Google's search** with **modern, delightful animations** from cutting-edge component libraries. The goal is to create an interface that feels:

- **Familiar**: Minimalist, centered layout like Google Search
- **Modern**: Smooth animations and transitions
- **Trustworthy**: Clean, professional aesthetic
- **Delightful**: Subtle interactions that bring joy

### Inspiration Sources

1. **Google Search**: Centered, minimal, focused UI
2. **21st.dev**: Modern AI chat interfaces with smooth interactions
3. **React Bits**: Animated components with creative flair

---

## Color System

### Base Theme (Light Mode)

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);                /* Pure white */
  --foreground: oklch(0.145 0 0);           /* Near black */
  --card: oklch(1 0 0);                     /* White */
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);              /* Dark gray/black */
  --primary-foreground: oklch(0.985 0 0);   /* Off-white */
  --secondary: oklch(0.97 0 0);             /* Light gray */
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);     /* Medium gray */
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --border: oklch(0.922 0 0);               /* Subtle border */
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);                 /* Focus ring */
}
```

### Dark Theme

```css
.dark {
  --background: oklch(0.145 0 0);           /* Near black */
  --foreground: oklch(0.985 0 0);           /* Off-white */
  --card: oklch(0.205 0 0);                 /* Dark gray */
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);              /* Light gray */
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}
```

### Accent Colors (for States & Actions)

```css
:root {
  --success: oklch(0.646 0.222 41.116);     /* Green */
  --warning: oklch(0.828 0.189 84.429);     /* Yellow */
  --error: oklch(0.577 0.245 27.325);       /* Red */
  --info: oklch(0.6 0.118 184.704);         /* Blue */
}
```

---

## Typography

### Font Stack

```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
               sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Type Scale

| Element | Size | Weight | Line Height | Use Case |
|---------|------|--------|-------------|----------|
| H1 | 2.5rem (40px) | 600 | 1.2 | Page title |
| H2 | 2rem (32px) | 600 | 1.3 | Section headers |
| H3 | 1.5rem (24px) | 500 | 1.4 | Subsections |
| Body Large | 1.125rem (18px) | 400 | 1.6 | Important text |
| Body | 1rem (16px) | 400 | 1.5 | Default text |
| Body Small | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| Caption | 0.75rem (12px) | 400 | 1.4 | Hints, labels |

---

## Layout Structure

### Landing Page (Google-Inspired)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Logo/Brand]                         │
│                                                         │
│                                                         │
│                                                         │
│                 What's on your mind?                    │
│           Ask me anything, I'm here to help.            │
│                                                         │
│     ┌──────────────────────────────────────────┐      │
│     │ 📎  Ask anything...            🎤  Send │      │
│     └──────────────────────────────────────────┘      │
│                                                         │
│     [Quick Actions: 3-4 Suggestion Chips]              │
│                                                         │
│                                                         │
│              Press Enter to send • Shift+Enter for     │
│                        new line                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Chat Interface

```
┌─────────────────────────────────────────────────────────┐
│  ☰  BrowserGPT        [Model: GEMMA 3 270MB]    ⚙ 👤  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 User                                                │
│  ┌──────────────────────────────────────────────┐     │
│  │ Explain quantum computing simply              │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
│  🤖 BrowserGPT                       ⚡ 15 tok/s       │
│  ┌──────────────────────────────────────────────┐     │
│  │ Quantum computing is like...                  │     │
│  │                                                │     │
│  │ [Response content with markdown support]      │     │
│  └──────────────────────────────────────────────┘     │
│  [📋 Copy]  [🔄 Regenerate]  [👍👎]                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📎  Type your message...              🎤  💾  ⬆     │
└─────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Primary Input Box (Inspired by 21st.dev AI Prompt Box)

**Design**:
- Centered on landing page
- Rounded corners (16px radius)
- Subtle shadow with hover elevation
- White background with minimal border

**Specifications**:
```typescript
const inputBoxStyle = {
  width: '540px',
  maxWidth: '90vw',
  height: '88px',
  borderRadius: '16px',
  padding: '8px',
  boxShadow: `
    0 32px 56px -12px rgba(0, 0, 0, 0.02),
    0 6px 12px -3px rgba(0, 0, 0, 0.02),
    0 3px 6px -1.5px rgba(0, 0, 0, 0.01),
    0 0 0 0.75px rgba(0, 0, 0, 0.04)
  `,
  transition: 'box-shadow 0.2s ease',
};

const inputBoxHover = {
  boxShadow: `
    0 32px 56px -12px rgba(0, 0, 0, 0.06),
    0 6px 12px -3px rgba(0, 0, 0, 0.02),
    0 3px 6px -1.5px rgba(0, 0, 0, 0.01),
    0 0 0 0.75px rgba(0, 0, 0, 0.04)
  `,
};
```

**Components**:
- Attachment icon (paperclip)
- Text input with placeholder
- Voice input button (optional)
- Send button (arrow icon)

**React Component**:
```tsx
import { useState } from 'react';

export function PromptBox() {
  const [input, setInput] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="prompt-box"
      style={{
        width: '540px',
        height: '88px',
        borderRadius: '16px',
        padding: '8px',
        background: 'white',
        boxShadow: isHovered
          ? '0 32px 56px -12px rgba(0, 0, 0, 0.06), 0 6px 12px -3px rgba(0, 0, 0, 0.02)'
          : '0 32px 56px -12px rgba(0, 0, 0, 0.02), 0 6px 12px -3px rgba(0, 0, 0, 0.02)',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Input Row */}
        <input
          type="text"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 text-base outline-none"
        />

        {/* Action Row */}
        <div className="flex items-center justify-between px-2">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            {/* Attachment Icon */}
            📎
          </button>

          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2. Quick Action Chips

**From 21st.dev example**: Suggestion buttons below main input

**Design**:
- Pill-shaped buttons
- Light gray background
- Hover state with slight elevation
- Smooth transitions

```tsx
export function QuickActionChip({ label }: { label: string }) {
  return (
    <button
      className="quick-action-chip"
      style={{
        padding: '10px 18px',
        borderRadius: '20px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        background: 'rgba(0, 0, 0, 0.02)',
        fontSize: '14px',
        fontWeight: 500,
        color: '#202124',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {label}
    </button>
  );
}

// Usage
<div className="flex gap-3 justify-center mt-4">
  <QuickActionChip label="Help me write an email" />
  <QuickActionChip label="Explain a concept" />
  <QuickActionChip label="Plan my day" />
</div>
```

### 3. Splash Cursor (React Bits)

**Purpose**: Delightful cursor interaction for landing page

**From React Bits**: https://reactbits.dev/animations/splash-cursor

```tsx
import { SplashCursor } from '@reactbits/splash-cursor';

export function LandingPage() {
  return (
    <div className="landing-page">
      <SplashCursor
        color="#000000"
        size={24}
        duration={800}
      />
      {/* Rest of your landing page */}
    </div>
  );
}
```

### 4. Split Text Animation (React Bits)

**Purpose**: Animated text reveal for headings

**From React Bits**: https://reactbits.dev/text-animations/split-text

```tsx
import { SplitText } from '@reactbits/split-text';

export function HeroHeading() {
  return (
    <SplitText
      text="What's on your mind?"
      className="text-3xl font-medium text-center mb-3"
      delay={50}
    />
  );
}
```

### 5. Message Bubbles

**Design**: Clean, minimal chat bubbles

**User Messages**:
```tsx
export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-4">
      <div
        className="user-message"
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '18px 18px 4px 18px',
          background: '#f0f0f0',
          color: '#202124',
          fontSize: '15px',
          lineHeight: '1.5',
        }}
      >
        {content}
      </div>
    </div>
  );
}
```

**AI Messages**:
```tsx
export function AIMessage({
  content,
  tokensPerSecond
}: {
  content: string;
  tokensPerSecond?: number;
}) {
  return (
    <div className="flex justify-start mb-4">
      <div className="ai-message-container" style={{ maxWidth: '70%' }}>
        {/* Avatar */}
        <div className="flex items-start gap-3">
          <div
            className="avatar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            🤖
          </div>

          <div className="flex-1">
            {/* Message Content */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '4px 18px 18px 18px',
                background: 'white',
                border: '1px solid #e0e0e0',
                color: '#202124',
                fontSize: '15px',
                lineHeight: '1.6',
              }}
            >
              {content}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {tokensPerSecond && (
                <span>⚡ {tokensPerSecond} tok/s</span>
              )}
              <button className="hover:text-gray-700">📋 Copy</button>
              <button className="hover:text-gray-700">🔄 Regenerate</button>
              <button className="hover:text-gray-700">👍</button>
              <button className="hover:text-gray-700">👎</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6. Loading Indicator

**Design**: Minimal pulsing dots (Google-style)

```tsx
export function TypingIndicator() {
  return (
    <div className="flex gap-1 p-4">
      <div
        className="dot"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#999',
          animation: 'pulse 1.4s infinite ease-in-out',
          animationDelay: '0s',
        }}
      />
      <div
        className="dot"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#999',
          animation: 'pulse 1.4s infinite ease-in-out',
          animationDelay: '0.2s',
        }}
      />
      <div
        className="dot"
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#999',
          animation: 'pulse 1.4s infinite ease-in-out',
          animationDelay: '0.4s',
        }}
      />
    </div>
  );
}

// CSS
const pulseAnimation = `
@keyframes pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}
`;
```

### 7. Model Download Progress

**Design**: Clean progress bar with stats

```tsx
export function DownloadProgress({
  modelName,
  progress,
  loaded,
  total,
  speed
}: {
  modelName: string;
  progress: number;
  loaded: number;
  total: number;
  speed: number;
}) {
  return (
    <div className="download-progress p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium mb-1">
          Downloading {modelName}
        </h3>
        <p className="text-sm text-gray-500">
          {formatBytes(loaded)} / {formatBytes(total)} • {formatBytes(speed)}/s
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="text-center mt-3">
        <span className="text-2xl font-semibold">{progress.toFixed(1)}%</span>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 text-center mt-4">
        This download only happens once. The model will be cached in your browser.
      </p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
```

### 8. Settings Panel

**Design**: Clean, organized settings

```tsx
export function SettingsPanel() {
  return (
    <div className="settings-panel p-6 max-w-md">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Model</label>
        <select className="w-full p-2 border border-gray-300 rounded-lg">
          <option>GEMMA 3 270MB (Fast, Text-only)</option>
          <option>GEMMA 3N E2B (Multimodal)</option>
        </select>
      </div>

      {/* Temperature */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Temperature
          <span className="text-gray-500 ml-2">0.7</span>
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          defaultValue="0.7"
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Max Tokens
          <span className="text-gray-500 ml-2">2048</span>
        </label>
        <input
          type="range"
          min="256"
          max="4096"
          step="256"
          defaultValue="2048"
          className="w-full"
        />
      </div>

      {/* Clear Cache Button */}
      <button className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
        Clear Cached Models
      </button>
    </div>
  );
}
```

---

## Animations & Transitions

### Micro-interactions

```css
/* Button hover */
.button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Input focus */
.input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}

/* Message fade in */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  animation: fadeInUp 0.3s ease-out;
}

/* Typing indicator */
@keyframes pulse {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}
```

### Page Transitions

```tsx
import { motion } from 'framer-motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
:root {
  --container-mobile: 100%;
  --container-tablet: 768px;
  --container-desktop: 1024px;
  --container-wide: 1280px;
}

/* Mobile (default) */
.prompt-box {
  width: 90vw;
}

/* Tablet and up */
@media (min-width: 768px) {
  .prompt-box {
    width: 540px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .chat-interface {
    max-width: 800px;
  }
}
```

---

## Accessibility

### ARIA Labels

```tsx
<button
  aria-label="Send message"
  aria-disabled={!input}
  role="button"
>
  Send
</button>

<input
  type="text"
  aria-label="Chat message input"
  aria-placeholder="Type your message..."
/>
```

### Keyboard Navigation

```tsx
// Handle keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Enter to send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Escape to cancel
    if (e.key === 'Escape') {
      handleCancel();
    }

    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## Component Library Integration

### Recommended Libraries

1. **21st.dev Components**
   - AI Prompt Box (primary input)
   - Floating Action Menu
   - Display Cards (for model info)

2. **React Bits**
   - Splash Cursor (landing page)
   - Split Text (hero heading)
   - Laser Flow (background animation)
   - Prism (shader effects, optional)

3. **shadcn/ui** (for base components)
   - Dialog
   - Dropdown Menu
   - Slider
   - Switch

### Installation

```bash
# React Bits
npm install @reactbits/splash-cursor
npm install @reactbits/split-text

# shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add dialog dropdown-menu slider switch

# Framer Motion (for animations)
npm install framer-motion
```

---

## Attribution

**Created by**: Dr. Ernesto Lee
**Design Inspiration**: Google Search, 21st.dev, React Bits
**License**: Open Source (MIT)

---

## Design Checklist

- [ ] Centered layout on landing page
- [ ] Google-inspired minimal aesthetic
- [ ] Modern animations from React Bits
- [ ] Clean AI prompt box from 21st.dev
- [ ] Responsive across all devices
- [ ] Dark mode support
- [ ] Accessibility compliant (WCAG AA)
- [ ] Smooth transitions and micro-interactions
- [ ] Loading states for all async operations
- [ ] Error states with helpful messaging

---

**Document Version**: 1.0
**Last Updated**: 2025-10-22
**Design Lead**: Dr. Ernesto Lee
