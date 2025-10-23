/**
 * Structured Output Editor Component
 * Configure JSON schemas, XML, CSV, and table output formats
 * @author Dr. Ernesto Lee
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { structuredOutputService } from '../services/StructuredOutputService';
import type { OutputFormat } from '../services/StructuredOutputService';

interface Props {
  enabled: boolean;
  format: OutputFormat;
  jsonSchema: string;
  xmlRootElement: string;
  csvIncludeHeaders: boolean;
  csvDelimiter: string;
  onUpdate: (updates: {
    enabled?: boolean;
    format?: OutputFormat;
    jsonSchema?: string;
    xmlRootElement?: string;
    csvIncludeHeaders?: boolean;
    csvDelimiter?: string;
  }) => void;
}

export function StructuredOutputEditor({
  enabled,
  format,
  jsonSchema,
  xmlRootElement,
  csvIncludeHeaders,
  csvDelimiter,
  onUpdate,
}: Props) {
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [testData, setTestData] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const formatOptions: { value: OutputFormat; label: string; icon: string; description: string }[] = [
    {
      value: 'json',
      label: 'JSON',
      icon: '{ }',
      description: 'Structured data with schema validation',
    },
    {
      value: 'xml',
      label: 'XML',
      icon: '</>',
      description: 'Hierarchical markup language',
    },
    {
      value: 'csv',
      label: 'CSV',
      icon: '📊',
      description: 'Comma-separated values for spreadsheets',
    },
    {
      value: 'markdown-table',
      label: 'Markdown Table',
      icon: '📋',
      description: 'Formatted table in Markdown syntax',
    },
    {
      value: 'table',
      label: 'ASCII Table',
      icon: '⬚',
      description: 'Text-based table with borders',
    },
  ];

  // Validate JSON schema when it changes
  const handleSchemaChange = (newSchema: string) => {
    onUpdate({ jsonSchema: newSchema });
    try {
      JSON.parse(newSchema);
      setSchemaError(null);
    } catch (error) {
      setSchemaError(`Invalid JSON: ${error}`);
    }
  };

  // Test the current format configuration
  const handleTestFormat = () => {
    try {
      const data = JSON.parse(testData);

      if (format === 'json' && jsonSchema) {
        try {
          const schema = JSON.parse(jsonSchema);
          const validation = structuredOutputService.validateJson(data, schema);
          if (!validation.valid) {
            setTestResult(`❌ Validation failed:\n${validation.errors.join('\n')}`);
            return;
          }
        } catch (error) {
          setTestResult(`❌ Invalid schema: ${error}`);
          return;
        }
      }

      const formatted = structuredOutputService.formatOutput(data, format, {
        rootElement: xmlRootElement,
        includeHeaders: csvIncludeHeaders,
        delimiter: csvDelimiter,
      });

      setTestResult(`✅ Success!\n\n${formatted}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground mb-1">Structured Output</h3>
          <p className="text-xs text-muted-foreground">
            Generate AI responses in specific data formats with validation
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
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Output Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onUpdate({ format: option.value })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      format === option.value
                        ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                        : 'bg-muted/30 border-border hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{option.icon}</span>
                      <span className="font-medium text-sm text-foreground">{option.label}</span>
                      {format === option.value && (
                        <svg className="w-4 h-4 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Format-specific options */}
            {format === 'json' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  JSON Schema
                </label>
                <textarea
                  value={jsonSchema}
                  onChange={(e) => handleSchemaChange(e.target.value)}
                  placeholder='{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" },\n    "age": { "type": "number" }\n  },\n  "required": ["name"]\n}'
                  className={`w-full h-48 px-3 py-2 bg-muted border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-mono resize-none ${
                    schemaError ? 'border-destructive' : 'border-border'
                  }`}
                />
                {schemaError && (
                  <p className="mt-2 text-xs text-destructive">{schemaError}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Define the expected structure using JSON Schema. The AI will format responses to match.
                </p>
              </div>
            )}

            {format === 'xml' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Root Element Name
                </label>
                <input
                  type="text"
                  value={xmlRootElement}
                  onChange={(e) => onUpdate({ xmlRootElement: e.target.value })}
                  placeholder="root"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  The name of the root XML element (e.g., "data", "response", "root")
                </p>
              </div>
            )}

            {format === 'csv' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Include Headers</h4>
                    <p className="text-xs text-muted-foreground">Add column names in first row</p>
                  </div>
                  <button
                    onClick={() => onUpdate({ csvIncludeHeaders: !csvIncludeHeaders })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      csvIncludeHeaders ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        csvIncludeHeaders ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Delimiter
                  </label>
                  <select
                    value={csvDelimiter}
                    onChange={(e) => onUpdate({ csvDelimiter: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab (\t)</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Test Format Section */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Test Format</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Test Data (JSON)
                  </label>
                  <textarea
                    value={testData}
                    onChange={(e) => setTestData(e.target.value)}
                    placeholder='{"name": "Alice", "age": 30}'
                    className="w-full h-24 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-mono resize-none"
                  />
                </div>

                <button
                  onClick={handleTestFormat}
                  disabled={!testData}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Test Format
                </button>

                {testResult && (
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <pre className="text-xs whitespace-pre-wrap font-mono text-foreground">
                      {testResult}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    How Structured Output Works
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    When enabled, the AI will be instructed to format responses in the selected format. For JSON, responses are validated against your schema. This is useful for extracting data, generating reports, or integrating with other tools.
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
