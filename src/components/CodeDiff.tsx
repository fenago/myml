/**
 * Code Diff Viewer Component
 * Shows side-by-side code comparison with syntax highlighting
 * @author Dr. Ernesto Lee
 */

import { useState } from 'react';

interface Props {
  oldCode: string;
  newCode: string;
  language?: string;
  filename?: string;
  onClose?: () => void;
}

interface DiffLine {
  lineNumber: number;
  content: string;
  type: 'added' | 'removed' | 'unchanged';
}

export function CodeDiff({ oldCode, newCode, language = 'text', filename, onClose }: Props) {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  // Simple diff algorithm - line by line comparison
  const computeDiff = (): { old: DiffLine[]; new: DiffLine[] } => {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');

    const oldDiff: DiffLine[] = [];
    const newDiff: DiffLine[] = [];

    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex];
      const newLine = newLines[newIndex];

      if (oldLine === newLine) {
        // Unchanged line
        oldDiff.push({ lineNumber: oldIndex + 1, content: oldLine || '', type: 'unchanged' });
        newDiff.push({ lineNumber: newIndex + 1, content: newLine || '', type: 'unchanged' });
        oldIndex++;
        newIndex++;
      } else {
        // Check if line was removed
        if (oldIndex < oldLines.length && !newLines.includes(oldLine)) {
          oldDiff.push({ lineNumber: oldIndex + 1, content: oldLine, type: 'removed' });
          newDiff.push({ lineNumber: -1, content: '', type: 'removed' });
          oldIndex++;
        }
        // Check if line was added
        else if (newIndex < newLines.length && !oldLines.includes(newLine)) {
          oldDiff.push({ lineNumber: -1, content: '', type: 'added' });
          newDiff.push({ lineNumber: newIndex + 1, content: newLine, type: 'added' });
          newIndex++;
        }
        // Lines are different
        else {
          oldDiff.push({ lineNumber: oldIndex + 1, content: oldLine || '', type: 'removed' });
          newDiff.push({ lineNumber: newIndex + 1, content: newLine || '', type: 'added' });
          oldIndex++;
          newIndex++;
        }
      }
    }

    return { old: oldDiff, new: newDiff };
  };

  const diff = computeDiff();

  const getLineColor = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-900/30 border-l-4 border-green-500';
      case 'removed':
        return 'bg-red-900/30 border-l-4 border-red-500';
      default:
        return 'bg-transparent';
    }
  };

  const getLineSign = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      default:
        return ' ';
    }
  };

  const stats = {
    added: diff.new.filter(l => l.type === 'added').length,
    removed: diff.old.filter(l => l.type === 'removed').length,
    unchanged: diff.new.filter(l => l.type === 'unchanged').length,
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-white">Code Diff</h2>
              {filename && <p className="text-sm text-gray-400">{filename}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400">+{stats.added}</span>
              <span className="text-red-400">-{stats.removed}</span>
              <span className="text-gray-400">{stats.unchanged} unchanged</span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Unified
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-2 divide-x divide-gray-700">
              {/* Old Code */}
              <div className="flex flex-col">
                <div className="sticky top-0 bg-red-900/20 px-4 py-2 border-b border-gray-700">
                  <span className="text-xs font-medium text-red-400">BEFORE</span>
                </div>
                <div className="font-mono text-sm">
                  {diff.old.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex ${getLineColor(line.type)}`}
                    >
                      <span className="px-4 py-1 text-gray-500 select-none min-w-[60px] text-right">
                        {line.lineNumber > 0 ? line.lineNumber : ''}
                      </span>
                      <span className="px-2 py-1 text-gray-400 select-none">
                        {getLineSign(line.type)}
                      </span>
                      <span className="px-2 py-1 text-gray-100 flex-1 whitespace-pre-wrap break-all">
                        {line.content || '\u00A0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Code */}
              <div className="flex flex-col">
                <div className="sticky top-0 bg-green-900/20 px-4 py-2 border-b border-gray-700">
                  <span className="text-xs font-medium text-green-400">AFTER</span>
                </div>
                <div className="font-mono text-sm">
                  {diff.new.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex ${getLineColor(line.type)}`}
                    >
                      <span className="px-4 py-1 text-gray-500 select-none min-w-[60px] text-right">
                        {line.lineNumber > 0 ? line.lineNumber : ''}
                      </span>
                      <span className="px-2 py-1 text-gray-400 select-none">
                        {getLineSign(line.type)}
                      </span>
                      <span className="px-2 py-1 text-gray-100 flex-1 whitespace-pre-wrap break-all">
                        {line.content || '\u00A0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Unified View */
            <div className="font-mono text-sm">
              <div className="sticky top-0 bg-gray-800 px-4 py-2 border-b border-gray-700">
                <span className="text-xs font-medium text-gray-400">UNIFIED DIFF</span>
              </div>
              {diff.new.map((line, idx) => {
                const oldLine = diff.old[idx];
                if (line.type === 'unchanged') {
                  return (
                    <div key={idx} className="flex">
                      <span className="px-4 py-1 text-gray-500 select-none min-w-[60px] text-right">
                        {line.lineNumber}
                      </span>
                      <span className="px-2 py-1 text-gray-400 select-none"> </span>
                      <span className="px-2 py-1 text-gray-100 flex-1 whitespace-pre-wrap break-all">
                        {line.content || '\u00A0'}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={idx}>
                    {oldLine && oldLine.type === 'removed' && (
                      <div className={`flex ${getLineColor('removed')}`}>
                        <span className="px-4 py-1 text-gray-500 select-none min-w-[60px] text-right">
                          {oldLine.lineNumber > 0 ? oldLine.lineNumber : ''}
                        </span>
                        <span className="px-2 py-1 text-red-400 select-none">-</span>
                        <span className="px-2 py-1 text-gray-100 flex-1 whitespace-pre-wrap break-all">
                          {oldLine.content || '\u00A0'}
                        </span>
                      </div>
                    )}
                    {line.type === 'added' && (
                      <div className={`flex ${getLineColor('added')}`}>
                        <span className="px-4 py-1 text-gray-500 select-none min-w-[60px] text-right">
                          {line.lineNumber > 0 ? line.lineNumber : ''}
                        </span>
                        <span className="px-2 py-1 text-green-400 select-none">+</span>
                        <span className="px-2 py-1 text-gray-100 flex-1 whitespace-pre-wrap break-all">
                          {line.content || '\u00A0'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {language.toUpperCase()} • {diff.new.length} lines
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
