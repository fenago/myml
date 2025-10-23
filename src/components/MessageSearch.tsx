/**
 * Message Search Component
 * Provides fuzzy search within conversation messages with live filtering
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import type { Message } from '../types';

interface Props {
  messages: Message[];
  onNavigateToMessage?: (messageId: string) => void;
  className?: string;
}

/**
 * Simple fuzzy search algorithm
 * Scores matches based on consecutive character matches and position
 */
function fuzzyMatch(text: string, query: string): { score: number; matches: number[] } {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  let score = 0;
  let textIndex = 0;
  const matches: number[] = [];

  for (let i = 0; i < queryLower.length; i++) {
    const char = queryLower[i];
    const foundIndex = textLower.indexOf(char, textIndex);

    if (foundIndex === -1) {
      return { score: 0, matches: [] };
    }

    matches.push(foundIndex);

    // Higher score for consecutive matches
    if (foundIndex === textIndex) {
      score += 10;
    } else {
      score += 1;
    }

    // Bonus for matches at word boundaries
    if (foundIndex === 0 || textLower[foundIndex - 1] === ' ') {
      score += 5;
    }

    textIndex = foundIndex + 1;
  }

  return { score, matches };
}

interface SearchResult {
  message: Message;
  score: number;
  matchedText: string;
}

export function MessageSearch({ messages, onNavigateToMessage, className = '' }: Props) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Perform fuzzy search and rank results
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];

    for (const message of messages) {
      const { score, matches } = fuzzyMatch(message.content, query);

      if (score > 0) {
        // Extract context around first match
        const firstMatch = matches[0] || 0;
        const start = Math.max(0, firstMatch - 40);
        const end = Math.min(message.content.length, firstMatch + 100);
        let matchedText = message.content.slice(start, end);

        if (start > 0) matchedText = '...' + matchedText;
        if (end < message.content.length) matchedText = matchedText + '...';

        results.push({
          message,
          score,
          matchedText,
        });
      }
    }

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }, [messages, query]);

  const handleClear = () => {
    setQuery('');
    setIsExpanded(false);
  };

  return (
    <div className={`mb-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value && !isExpanded) setIsExpanded(true);
          }}
          onFocus={() => setIsExpanded(true)}
          placeholder="Search messages..."
          className="w-full pl-10 pr-10 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center hover:text-foreground text-muted-foreground transition-colors"
            title="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isExpanded && query && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 bg-muted/50 rounded-lg border border-border overflow-hidden"
          >
            {/* Results Header */}
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {searchResults.length === 0
                    ? 'No results found'
                    : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} found`}
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Collapse
                </button>
              </div>
            </div>

            {/* Results List */}
            {searchResults.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map(({ message, matchedText }, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-3 hover:bg-muted/70 transition-colors cursor-pointer border-b border-border/50 last:border-b-0"
                    onClick={() => {
                      onNavigateToMessage?.(message.id);
                      setIsExpanded(false);
                    }}
                  >
                    {/* Role Badge & Timestamp */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          message.role === 'user'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-purple-500/10 text-purple-600'
                        }`}
                      >
                        {message.role === 'user' ? '👤 User' : '🤖 Assistant'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {/* Matched Text Preview */}
                    <p className="text-sm text-foreground/90 line-clamp-2">
                      {highlightMatches(matchedText, query)}
                    </p>

                    {/* Navigation Hint */}
                    <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      Click to navigate →
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Highlights matching characters in the text
 */
function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query) return text;

  const { matches } = fuzzyMatch(text, query);
  if (matches.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((matchIndex, i) => {
    // Add text before match
    if (matchIndex > lastIndex) {
      parts.push(
        <span key={`text-${i}`}>{text.slice(lastIndex, matchIndex)}</span>
      );
    }

    // Add highlighted match
    parts.push(
      <mark
        key={`match-${i}`}
        className="bg-yellow-300/30 text-foreground font-medium rounded px-0.5"
      >
        {text[matchIndex]}
      </mark>
    );

    lastIndex = matchIndex + 1;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}
