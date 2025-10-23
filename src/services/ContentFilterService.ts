/**
 * Content Filter Service
 * Basic content filtering for safety and appropriateness
 * @author Dr. Ernesto Lee
 */

export interface FilterSettings {
  enabled: boolean;
  level: 'off' | 'moderate' | 'strict';
  blockProfanity: boolean;
  blockViolence: boolean;
  blockSexual: boolean;
  blockHate: boolean;
  customFilters: string[];
}

export interface FilterResult {
  blocked: boolean;
  reason?: string;
  filteredContent?: string;
}

export class ContentFilterService {
  // Basic keyword lists (simplified for demonstration)
  private readonly profanityKeywords = [
    'damn', 'hell', 'ass', 'crap', 'shit', 'fuck', 'bitch',
    'bastard', 'dick', 'pussy', 'cock', 'ass',
  ];

  private readonly violenceKeywords = [
    'kill', 'murder', 'death', 'blood', 'gore', 'torture',
    'weapon', 'gun', 'knife', 'stab', 'shoot', 'bomb',
  ];

  private readonly sexualKeywords = [
    'sex', 'porn', 'nude', 'naked', 'explicit', 'adult',
    'sexual', 'intercourse', 'erotic', 'xxx',
  ];

  private readonly hateKeywords = [
    'hate', 'racist', 'sexist', 'discrimination', 'bigot',
    'supremacy', 'slur', 'derogatory',
  ];

  /**
   * Filter content based on settings
   */
  filterContent(content: string, settings: FilterSettings): FilterResult {
    if (!settings.enabled || settings.level === 'off') {
      return { blocked: false };
    }

    const lowerContent = content.toLowerCase();
    const sensitivity = settings.level === 'strict' ? 0.3 : 0.5; // Threshold for matching

    // Check custom filters first
    if (settings.customFilters.length > 0) {
      for (const filter of settings.customFilters) {
        if (lowerContent.includes(filter.toLowerCase())) {
          return {
            blocked: true,
            reason: `Content contains blocked keyword: "${filter}"`,
            filteredContent: this.maskKeyword(content, filter),
          };
        }
      }
    }

    // Check profanity
    if (settings.blockProfanity) {
      const profanityMatch = this.findMatches(lowerContent, this.profanityKeywords, sensitivity);
      if (profanityMatch) {
        return {
          blocked: settings.level === 'strict',
          reason: 'Content contains profanity',
          filteredContent: this.maskKeywords(content, this.profanityKeywords),
        };
      }
    }

    // Check violence
    if (settings.blockViolence) {
      const violenceMatch = this.findMatches(lowerContent, this.violenceKeywords, sensitivity);
      if (violenceMatch) {
        return {
          blocked: settings.level === 'strict',
          reason: 'Content contains violent themes',
          filteredContent: this.maskKeywords(content, this.violenceKeywords),
        };
      }
    }

    // Check sexual content
    if (settings.blockSexual) {
      const sexualMatch = this.findMatches(lowerContent, this.sexualKeywords, sensitivity);
      if (sexualMatch) {
        return {
          blocked: settings.level === 'strict',
          reason: 'Content contains sexual themes',
          filteredContent: this.maskKeywords(content, this.sexualKeywords),
        };
      }
    }

    // Check hate speech
    if (settings.blockHate) {
      const hateMatch = this.findMatches(lowerContent, this.hateKeywords, sensitivity);
      if (hateMatch) {
        return {
          blocked: true, // Always block hate speech
          reason: 'Content contains hate speech or discriminatory language',
          filteredContent: this.maskKeywords(content, this.hateKeywords),
        };
      }
    }

    return { blocked: false };
  }

  /**
   * Find matches in content
   */
  private findMatches(content: string, keywords: string[], threshold: number): boolean {
    let matchCount = 0;
    const requiredMatches = Math.ceil(keywords.length * threshold);

    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        matchCount++;
        if (matchCount >= requiredMatches) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Mask a single keyword in content
   */
  private maskKeyword(content: string, keyword: string): string {
    const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
    return content.replace(regex, (match) => '*'.repeat(match.length));
  }

  /**
   * Mask multiple keywords in content
   */
  private maskKeywords(content: string, keywords: string[]): string {
    let masked = content;
    for (const keyword of keywords) {
      masked = this.maskKeyword(masked, keyword);
    }
    return masked;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generate system prompt for safety
   */
  generateSafetyPrompt(settings: FilterSettings): string {
    if (!settings.enabled || settings.level === 'off') {
      return '';
    }

    const restrictions: string[] = [];

    if (settings.blockProfanity) {
      restrictions.push('profanity or offensive language');
    }

    if (settings.blockViolence) {
      restrictions.push('violent or graphic content');
    }

    if (settings.blockSexual) {
      restrictions.push('sexual or adult content');
    }

    if (settings.blockHate) {
      restrictions.push('hate speech or discriminatory language');
    }

    if (settings.customFilters.length > 0) {
      restrictions.push(`the following terms: ${settings.customFilters.join(', ')}`);
    }

    if (restrictions.length === 0) {
      return '';
    }

    const levelDescriptor = settings.level === 'strict' ? 'absolutely avoid' : 'try to avoid';

    return `SAFETY GUIDELINES: Please ${levelDescriptor} including ${restrictions.join(', ')} in your responses. Keep content appropriate and respectful.`;
  }
}

export const contentFilterService = new ContentFilterService();
