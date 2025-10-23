/**
 * Safety Settings Editor Component
 * Configure content filtering and safety controls
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Props {
  enabled: boolean;
  level: 'off' | 'moderate' | 'strict';
  blockProfanity: boolean;
  blockViolence: boolean;
  blockSexual: boolean;
  blockHate: boolean;
  customFilters: string[];
  onUpdate: (updates: {
    enabled?: boolean;
    level?: 'off' | 'moderate' | 'strict';
    blockProfanity?: boolean;
    blockViolence?: boolean;
    blockSexual?: boolean;
    blockHate?: boolean;
    customFilters?: string[];
  }) => void;
}

export function SafetySettingsEditor({
  enabled,
  level,
  blockProfanity,
  blockViolence,
  blockSexual,
  blockHate,
  customFilters,
  onUpdate,
}: Props) {
  const [newFilter, setNewFilter] = useState('');

  const handleAddFilter = () => {
    if (newFilter.trim() && !customFilters.includes(newFilter.trim())) {
      onUpdate({ customFilters: [...customFilters, newFilter.trim()] });
      setNewFilter('');
    }
  };

  const handleRemoveFilter = (filter: string) => {
    onUpdate({ customFilters: customFilters.filter((f) => f !== filter) });
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground mb-1">Content Filtering</h3>
          <p className="text-xs text-muted-foreground">
            Filter potentially harmful or inappropriate content from AI responses
          </p>
        </div>
        <button
          onClick={() => onUpdate({ enabled: !enabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Filtering Level */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Filtering Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['off', 'moderate', 'strict'] as const).map((levelOption) => (
                  <button
                    key={levelOption}
                    onClick={() => onUpdate({ level: levelOption })}
                    className={`py-3 px-4 rounded-lg border text-center transition-all ${
                      level === levelOption
                        ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                        : 'bg-muted/30 border-border hover:border-primary'
                    }`}
                  >
                    <div className="font-medium text-sm text-foreground mb-1">
                      {levelOption === 'off' && '🔓 Off'}
                      {levelOption === 'moderate' && '🛡️ Moderate'}
                      {levelOption === 'strict' && '🔒 Strict'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {levelOption === 'off' && 'No filtering'}
                      {levelOption === 'moderate' && 'Balanced approach'}
                      {levelOption === 'strict' && 'Maximum safety'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Content Categories
              </label>
              <div className="space-y-2">
                {/* Profanity */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🤬</span>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Profanity</h4>
                      <p className="text-xs text-muted-foreground">Block offensive language and swearing</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdate({ blockProfanity: !blockProfanity })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blockProfanity ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        blockProfanity ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Violence */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚔️</span>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Violence</h4>
                      <p className="text-xs text-muted-foreground">Block violent or graphic content</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdate({ blockViolence: !blockViolence })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blockViolence ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        blockViolence ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Sexual */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔞</span>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Sexual Content</h4>
                      <p className="text-xs text-muted-foreground">Block adult or sexual material</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdate({ blockSexual: !blockSexual })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blockSexual ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        blockSexual ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Hate Speech */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚫</span>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Hate Speech</h4>
                      <p className="text-xs text-muted-foreground">Block discriminatory or hateful content</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdate({ blockHate: !blockHate })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blockHate ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        blockHate ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Filters */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Custom Keyword Filters
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Add specific words or phrases to filter from responses
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFilter}
                  onChange={(e) => setNewFilter(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFilter()}
                  placeholder="Enter keyword to filter..."
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                />
                <button
                  onClick={handleAddFilter}
                  disabled={!newFilter.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Add
                </button>
              </div>

              {customFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {customFilters.map((filter) => (
                    <div
                      key={filter}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-lg text-sm"
                    >
                      <span className="text-foreground">{filter}</span>
                      <button
                        onClick={() => handleRemoveFilter(filter)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning Box */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Important Notice
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Content filtering is done locally in your browser using keyword matching and basic heuristics. It may not catch all harmful content and should not be relied upon as the sole safety measure. The AI model runs locally and does not connect to external filtering services.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
