/**
 * Code Block Component with Syntax Highlighting
 * Displays code with language-specific highlighting and copy functionality
 * @author Dr. Ernesto Lee
 */

import { useState } from 'react';

interface Props {
  code: string;
  language: string;
  onRunInSandbox?: (code: string, language: string) => void;
}

// Language name mappings for display
const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'React JSX',
  tsx: 'React TSX',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML',
  markdown: 'Markdown',
  bash: 'Bash',
  shell: 'Shell',
  css: 'CSS',
  scss: 'SCSS',
  html: 'HTML',
  xml: 'XML',
  text: 'Plain Text',
};

export function CodeBlock({ code, language, onRunInSandbox }: Props) {
  const [copied, setCopied] = useState(false);

  // Normalize language name
  const normalizedLang = language.toLowerCase().trim();
  const displayLang = LANGUAGE_NAMES[normalizedLang] || normalizedLang.toUpperCase();

  // Check if language is executable in sandbox
  const isExecutable = ['javascript', 'js', 'html', 'htm'].includes(normalizedLang);

  // Copy code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-700 dark:border-gray-600">
      {/* Header with language name and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-600">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {displayLang}
        </span>
        <div className="flex items-center gap-2">
          {isExecutable && onRunInSandbox && (
            <button
              onClick={() => onRunInSandbox(code, normalizedLang === 'js' ? 'javascript' : normalizedLang)}
              className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-green-300 hover:text-green-200 bg-green-900/30 hover:bg-green-900/50 rounded transition-all"
              title="Run in Sandbox"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Run</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-all"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="relative overflow-x-auto bg-gray-900">
        <pre className="!m-0 !p-4 !bg-transparent text-sm">
          <code className={`language-${normalizedLang}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
