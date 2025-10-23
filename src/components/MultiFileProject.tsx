/**
 * Multi-File Project Viewer Component
 * Displays project structure with file tree and download capabilities
 * @author Dr. Ernesto Lee
 */

import { useState } from 'react';
import type { GeneratedProject, ProjectFile } from '../services/ProjectGenerator';
import { CodeBlock } from './CodeBlock';

interface Props {
  project: GeneratedProject;
  onClose?: () => void;
}

export function MultiFileProject({ project, onClose }: Props) {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(project.files[0]);

  // Build file tree structure
  const buildFileTree = () => {
    const tree: Record<string, ProjectFile[]> = {};

    project.files.forEach(file => {
      const parts = file.path.split('/');
      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '/';

      if (!tree[dir]) {
        tree[dir] = [];
      }
      tree[dir].push(file);
    });

    return tree;
  };

  const fileTree = buildFileTree();
  const directories = Object.keys(fileTree).sort();

  const downloadAsZip = async () => {
    try {
      // We'll use JSZip library if available, otherwise create individual files
      // For now, create a simple text file with all files concatenated
      const content = project.files
        .map(file => `// ${file.path}\n${'='.repeat(50)}\n${file.content}\n\n`)
        .join('\n');

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download project:', error);
    }
  };

  const downloadFile = (file: ProjectFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || file.path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyAllToClipboard = async () => {
    const text = project.files
      .map(file => `// ${file.path}\n${file.content}`)
      .join('\n\n---\n\n');

    try {
      await navigator.clipboard.writeText(text);
      alert('All files copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return '📜';
      case 'html':
        return '🌐';
      case 'css':
      case 'scss':
        return '🎨';
      case 'json':
        return '⚙️';
      case 'md':
        return '📝';
      case 'py':
        return '🐍';
      case 'java':
        return '☕';
      default:
        return '📄';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-white">{project.name}</h2>
              <p className="text-sm text-gray-400">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAllToClipboard}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy All
            </button>
            <button
              onClick={downloadAsZip}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
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
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-64 border-r border-gray-700 bg-gray-800/50 overflow-auto">
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Project Files ({project.files.length})
              </div>
              {directories.map(dir => (
                <div key={dir} className="mb-4">
                  {dir !== '/' && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span>{dir}</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {fileTree[dir].map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          selectedFile === file
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span>{getFileIcon(file.path)}</span>
                        <span className="flex-1 truncate">{file.path.split('/').pop()}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* File Content Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* File Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-gray-800/30">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getFileIcon(selectedFile.path)}</span>
                <span className="text-sm font-medium text-white">{selectedFile.path}</span>
                <span className="text-xs text-gray-500">({selectedFile.language})</span>
              </div>
              <button
                onClick={() => downloadFile(selectedFile)}
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>

            {/* File Content */}
            <div className="flex-1 overflow-auto p-4">
              <CodeBlock
                code={selectedFile.content}
                language={selectedFile.language}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {project.files.length} files • {project.files.reduce((sum, f) => sum + f.content.split('\n').length, 0)} lines total
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
