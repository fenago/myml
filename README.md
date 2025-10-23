# BrowserGPT

**Privacy-first AI chat that runs entirely in your browser**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Created by **[Dr. Ernesto Lee](https://drlee.io)**

---

## 🌟 Features

- ✅ **100% Private**: All AI processing happens in your browser - zero data transmission
- ✅ **Offline Capable**: Works without internet once models are cached
- ✅ **Zero Cost**: No server costs, no API fees, unlimited conversations
- ✅ **MediaPipe Powered**: Uses Google's official MediaPipe LLM Inference API
- ✅ **Multimodal Support**: Text, vision, and audio with GEMMA 3N models
- ✅ **WebGPU Accelerated**: Hardware acceleration for optimal performance
- ✅ **Modern UI**: Google-inspired minimal design with smooth animations
- ✅ **Open Source**: Built with React, TypeScript, and MediaPipe

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (or pnpm/yarn)
- Modern browser with WebGPU support (Chrome 113+, Edge 113+)
- 2-4 GB available RAM

### Installation

```bash
# Clone the repository
cd BrowserGPT

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploying to Netlify

```bash
# Option 1: Deploy via Netlify CLI
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod

# Option 2: Connect GitHub repo to Netlify
# Push to GitHub and connect at app.netlify.com
# Netlify will auto-detect settings from netlify.toml
```

See [Netlify Deployment Guide](Docs/05-Deployment/Netlify-Deployment-Guide.md) for detailed instructions.

---

## 🎯 How It Works

1. **Model Loading**: Downloads GEMMA models from CloudFlare R2 (only once)
2. **Browser Caching**: Models cached in IndexedDB for instant future use
3. **MediaPipe Inference**: Google's official LLM Inference API with WebGPU
4. **Multimodal**: Native support for image and audio inputs (GEMMA 3N)
5. **Zero Server**: Everything runs client-side - no backend needed

### Architecture

```
User Browser
├── React UI (Vite + TypeScript)
├── State Management (Zustand)
├── MediaPipe LLM Inference (WebGPU)
├── Model Cache (IndexedDB)
└── GEMMA Models from CloudFlare R2
```

---

## 📦 Available Models

### Primary Models (GEMMA via Transformers.js)

#### GEMMA 3 270M (Fast Text Model)
- **Size**: 297 MB
- **Type**: Text generation
- **Speed**: ~45 tokens/second (M1 Mac)
- **Use**: Quick queries, simple Q&A
- **URL**: `gemma3-270m-it-q8-web.task`

#### GEMMA 3N E2B (Multimodal)
- **Size**: 1.9 GB
- **Type**: Text, Vision, Audio
- **Speed**: ~18 tokens/second (M1 Mac)
- **Use**: Image analysis, audio processing
- **URL**: `gemma-3n-E2B-it-int4-Web.litertlm`

#### GEMMA 3N E4B (Advanced Multimodal)
- **Size**: 2.1 GB
- **Type**: Text, Vision, Audio (Enhanced)
- **Speed**: ~15 tokens/second (M1 Mac)
- **Use**: Complex multimodal tasks, advanced vision
- **URL**: `gemma-3n-E4B-it-int4-Web.litertlm`

### Legacy Models (WebLLM Backup)
- **Llama 3.1 8B**: Meta's Llama model (4.8 GB)
- **Phi-3 Mini**: Microsoft's Phi-3 (2.3 GB)
- **Gemma 2 2B**: Google Gemma 2 (1.5 GB)

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### AI/ML
- **MediaPipe Tasks GenAI** - Google's official LLM Inference API
- **WebGPU** - Hardware acceleration
- **LiterTLM** - Optimized GEMMA model format

### Storage
- **CloudFlare R2** - Model hosting (zero egress)
- **IndexedDB** - Browser model cache

---

## 📂 Project Structure

```
BrowserGPT/
├── src/
│   ├── components/          # React components
│   │   ├── LandingPage.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ModelLoadProgress.tsx
│   │   └── TypingIndicator.tsx
│   ├── services/           # Business logic
│   │   ├── ModelLoader.ts
│   │   └── InferenceEngine.ts
│   ├── store/              # State management
│   │   └── useStore.ts
│   ├── config/             # Configuration
│   │   └── models.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── styles/             # Global styles
│   │   └── index.css
│   ├── App.tsx             # Main app
│   └── main.tsx            # Entry point
├── Docs/                   # Complete documentation
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎨 UI Design

Inspired by:
- **Google Search** - Minimal, centered layout
- **21st.dev** - Modern AI chat interfaces
- **React Bits** - Smooth animations

### Design Principles
- Clean and minimal
- Google-inspired aesthetics
- Smooth micro-interactions
- Accessible (WCAG AA)
- Mobile-first responsive

---

## ⚙️ Configuration

### Model URLs

Edit `src/config/models.ts` to configure models:

```typescript
export const MODEL_CONFIG = {
  R2_BASE_URL: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev',
  models: {
    gemma270m: {
      url: 'https://pub-8f8063a5b7fd42c1bf158b9ba33997d5.r2.dev/gemma3-270m-it-q8-web.task',
      // ...config
    },
  },
};
```

### Settings

Users can configure:
- Model selection
- Temperature (0.0 - 2.0)
- Max tokens (256 - 4096)
- Theme (light/dark/system)

---

## 🔒 Privacy & Security

### Privacy Guarantees

- ✅ **Zero server communication** (except initial model download)
- ✅ **No telemetry or analytics**
- ✅ **No conversation logging**
- ✅ **All data stays in your browser**
- ✅ **Optional: Clear cache anytime**

### Security Features

- Content Security Policy (CSP)
- XSS prevention
- Model integrity verification
- HTTPS-only model delivery

---

## 📊 Performance

### Model Load Times (10 Mbps)

- GEMMA 270M: ~4 minutes (first time only)
- GEMMA 3N E2B: ~25 minutes (first time only)

### Generation Speed

| Device | GEMMA 270M | GEMMA 3N E2B |
|--------|------------|--------------|
| MacBook Pro M1 | 45 TPS | 18 TPS |
| Desktop (RTX 3060) | 62 TPS | 28 TPS |
| iPhone 14 Pro | 28 TPS | 8 TPS |

*TPS = Tokens per second*

---

## 🐛 Troubleshooting

### Models Won't Load

1. Check browser console for errors
2. Verify CloudFlare R2 URLs are accessible
3. Ensure 2-4 GB free RAM available
4. Try clearing browser cache and reload

### Slow Performance

1. Enable WebGPU (Chrome flags: `chrome://flags/#enable-unsafe-webgpu`)
2. Close other tabs to free memory
3. Use smaller GEMMA 270M model
4. Check if hardware acceleration is enabled

### Browser Compatibility

- ✅ Chrome 113+ (WebGPU)
- ✅ Edge 113+ (WebGPU)
- ⚠️ Firefox 115+ (WASM only, slower)
- ⚠️ Safari 16+ (limited support)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

```
Copyright (c) 2025 Dr. Ernesto Lee

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

### Created By
**Dr. Ernesto Lee** - [drlee.io](https://drlee.io)

### Powered By
- **Google GEMMA** - Open-weight language models
- **Google MediaPipe** - Official LLM Inference API
- **CloudFlare R2** - Model hosting and CDN
- **21st.dev** - UI design inspiration
- **React Bits** - Animation components

---

## 📚 Documentation

Complete documentation available in the `Docs/` folder:

- [Product Requirements Document](Docs/PRD-BrowserGPT.md)
- [Technical Architecture](Docs/02-Architecture/Technical-Architecture.md)
- [Model Specifications](Docs/03-Models/Model-Specifications.md)
- [CloudFlare R2 Setup Guide](Docs/04-CloudFlare-Integration/R2-Setup-Guide.md)
- [UI/UX Design Guide](Docs/01-Overview/UI-Design-Guide.md)

---

## 🌐 Links

- **Website**: [Coming Soon]
- **Documentation**: [Docs/README.md](Docs/README.md)
- **Issues**: [GitHub Issues]
- **Discussions**: [GitHub Discussions]

---

## ⭐ Show Your Support

If you find this project useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with others

---

**Built with ❤️ by Dr. Ernesto Lee**

*Empowering privacy-focused AI, one browser at a time.*
