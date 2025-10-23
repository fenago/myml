/**
 * System Prompt Editor Component
 * Allows users to customize AI behavior with persona presets or custom prompts
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { personaPresets, getPersonaById, type PersonaPreset } from '../config/personas';

interface Props {
  enabled: boolean;
  customPrompt: string;
  selectedPreset: string | null;
  onUpdate: (updates: {
    enabled?: boolean;
    customPrompt?: string;
    selectedPreset?: string | null;
  }) => void;
}

export function SystemPromptEditor({ enabled, customPrompt, selectedPreset, onUpdate }: Props) {
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PersonaPreset['category']>('general');

  // Get categories and their personas
  const categories: { id: PersonaPreset['category']; name: string; icon: string }[] = [
    { id: 'general', name: 'General', icon: '🌟' },
    { id: 'professional', name: 'Professional', icon: '💼' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
    { id: 'educational', name: 'Educational', icon: '📚' },
    { id: 'technical', name: 'Technical', icon: '⚙️' },
  ];

  const personasInCategory = personaPresets.filter((p) => p.category === activeCategory);
  const currentPersona = selectedPreset ? getPersonaById(selectedPreset) : null;

  const handlePresetSelect = (presetId: string) => {
    onUpdate({
      selectedPreset: presetId,
      customPrompt: '', // Clear custom prompt when selecting preset
    });
    setShowCustomEditor(false);
  };

  const handleCustomPrompt = () => {
    onUpdate({
      selectedPreset: null, // Clear preset when using custom
    });
    setShowCustomEditor(true);
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground mb-1">System Prompts</h3>
          <p className="text-xs text-muted-foreground">
            Customize how the AI responds with different personas or custom instructions
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
            {/* Current Selection Display */}
            {(currentPersona || customPrompt) && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{currentPersona?.icon || '✏️'}</span>
                  <h4 className="font-medium text-foreground">
                    {currentPersona?.name || 'Custom System Prompt'}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {currentPersona?.description || 'Using your custom instructions'}
                </p>
              </div>
            )}

            {/* Preset Selection or Custom Editor Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomEditor(false)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  !showCustomEditor
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary'
                }`}
              >
                Persona Presets
              </button>
              <button
                onClick={handleCustomPrompt}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  showCustomEditor
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary'
                }`}
              >
                Custom Prompt
              </button>
            </div>

            {/* Preset Personas */}
            {!showCustomEditor && (
              <div className="space-y-3">
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
                        activeCategory === category.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>

                {/* Persona Cards */}
                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                  {personasInCategory.map((persona) => (
                    <motion.button
                      key={persona.id}
                      onClick={() => handlePresetSelect(persona.id)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        selectedPreset === persona.id
                          ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                          : 'bg-muted/30 border-border hover:border-primary hover:bg-muted/50'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{persona.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-foreground text-sm">
                              {persona.name}
                            </h5>
                            {selectedPreset === persona.id && (
                              <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {persona.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Preview Button */}
                {selectedPreset && currentPersona && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-primary hover:underline list-none flex items-center gap-2">
                      <svg
                        className="w-4 h-4 transition-transform group-open:rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Preview Full System Prompt
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded-lg border border-border">
                      <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                        {currentPersona.systemPrompt}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* Custom Prompt Editor */}
            {showCustomEditor && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Custom System Prompt
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => onUpdate({ customPrompt: e.target.value })}
                    placeholder="Enter your custom system prompt here... For example: 'You are a helpful assistant who speaks like a pirate.'"
                    className="w-full h-48 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm resize-none"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Tip: Be specific about tone, style, and behavior you want. The AI will follow these instructions in all responses.
                  </p>
                </div>

                {/* Character Count */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    {customPrompt.length} characters
                  </span>
                  {customPrompt.length > 0 && (
                    <button
                      onClick={() => onUpdate({ customPrompt: '' })}
                      className="text-destructive hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Info Box */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                    How System Prompts Work
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    System prompts are prepended to every conversation, shaping how the AI responds. They're invisible to you but guide the AI's personality and behavior. Changes apply to new messages in the current conversation.
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
