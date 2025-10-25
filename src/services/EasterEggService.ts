/**
 * Easter Egg Service
 * Handles special queries and gamification features
 *
 * @author Dr. Ernesto Lee
 */

import type { ModelId } from '../config/models';

export class EasterEggService {
  private devModeCounter = 0;
  private lastDevModeReset = Date.now();

  /**
   * Check if query is asking about model personality
   */
  isModelPersonalityQuery(text: string): boolean {
    const lowerText = text.toLowerCase().trim();
    return (
      lowerText.includes('tell me about yourself') ||
      lowerText.includes('who are you') ||
      lowerText.includes('what are you') ||
      lowerText.includes('introduce yourself') ||
      lowerText === 'about you'
    );
  }

  /**
   * Get model personality response
   */
  getModelPersonality(modelId: ModelId): string {
    const personalities: Record<ModelId, string> = {
      gemma270m: `⚡ **CAESAR 270M** here!

I'm the speedster of the family - lightning-fast, efficient, and perfect for quick conversations. Think of me as your rapid-response assistant.

**My Stats:**
• 270 million parameters
• Text generation specialist
• 297 MB model size
• 8,000 token context window

**What I'm Great At:**
✓ Quick answers and explanations
✓ Code snippets and debugging
✓ Creative writing prompts
✓ Math and logic problems
✓ General knowledge Q&A

**My Philosophy:** Speed meets intelligence. I believe in getting you quality answers fast, without the fluff. I'm here when you need quick help, no waiting around!

Want to see what I can do? Try asking me anything!`,

      gemma3nE2B: `● **MADDY E2B** at your service!

I'm the multimodal powerhouse - I can see images, hear audio, and understand text all at once. Your multimedia AI companion!

**My Stats:**
• 1.9 billion effective parameters (5.1B total)
• Vision + Audio + Text capabilities
• 1.9 GB model with advanced features
• 32,000 token context window
• PLE-caching & Matformer architecture

**What Makes Me Special:**
✓ Analyze images and screenshots
✓ Process audio and transcribe speech
✓ Handle complex multimodal tasks
✓ Advanced reasoning capabilities
✓ Long-form content generation

**My Philosophy:** The world isn't just text - it's images, sounds, and ideas. I'm here to help you work with all of them seamlessly!

Got an image to analyze or audio to transcribe? I'm ready!`,

      gemma3nE4B: `◆ **JORDAN E4B** - Elite Intelligence

I represent the pinnacle of what's possible in-browser. Advanced reasoning, enhanced vision, and unmatched multimodal capabilities.

**My Stats:**
• 2.1 billion effective parameters (5.5B total)
• Elite multimodal processing
• 2.1 GB model size
• 32,000 token context window
• Enhanced vision with Matformer
• PLE-caching & conditional loading

**Where I Excel:**
✓ Complex analytical tasks
✓ Advanced image understanding
✓ Sophisticated reasoning
✓ Long-context conversations
✓ Professional-grade outputs
✓ Multi-step problem solving

**My Philosophy:** Excellence isn't about speed - it's about depth, accuracy, and insight. I take the time to understand your needs and deliver professional-quality results.

Ready for some serious AI collaboration? Let's dive deep!`
    };

    return personalities[modelId] || personalities['gemma3nE2B'];
  }

  /**
   * Check for /dev command and track counter
   */
  checkDevMode(text: string): boolean {
    const now = Date.now();

    // Reset counter if more than 5 seconds passed
    if (now - this.lastDevModeReset > 5000) {
      this.devModeCounter = 0;
    }

    if (text.trim() === '/dev') {
      this.devModeCounter++;
      this.lastDevModeReset = now;

      if (this.devModeCounter >= 3) {
        this.devModeCounter = 0; // Reset
        return true;
      }
    }

    return false;
  }

  /**
   * Get current dev mode counter (for UI feedback)
   */
  getDevModeCounter(): number {
    return this.devModeCounter;
  }

  /**
   * Check if today is user's birthday (from browser locale)
   */
  isBirthday(): boolean {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Check localStorage for stored birthday
    const storedBirthday = localStorage.getItem('userBirthday');
    if (storedBirthday) {
      const [storedMonth, storedDay] = storedBirthday.split('-').map(Number);
      return month === storedMonth && day === storedDay;
    }

    return false;
  }

  /**
   * Set user's birthday (month-day format)
   */
  setBirthday(month: number, day: number): void {
    localStorage.setItem('userBirthday', `${month}-${day}`);
  }

  /**
   * Get time-based greeting
   */
  getTimeBasedGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening';
    } else {
      return 'Working late';
    }
  }
}

export const easterEggService = new EasterEggService();
