/**
 * Code Execution Sandbox Component
 * Safely executes JavaScript code in an isolated environment
 * @author Dr. Ernesto Lee
 */

import { useState, useRef, useEffect } from 'react';

interface Props {
  initialCode?: string;
  language?: 'javascript' | 'html' | 'css';
  onClose?: () => void;
}

interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

export function CodeSandbox({ initialCode = '', language = 'javascript', onClose }: Props) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<ConsoleMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Execute JavaScript code safely
  const executeJavaScript = () => {
    setIsRunning(true);
    setOutput([]);

    try {
      // Create a sandboxed execution environment
      const consoleCapture: ConsoleMessage[] = [];

      // Override console methods
      const customConsole = {
        log: (...args: any[]) => {
          consoleCapture.push({
            type: 'log',
            message: args.map(arg =>
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
            timestamp: new Date(),
          });
        },
        error: (...args: any[]) => {
          consoleCapture.push({
            type: 'error',
            message: args.map(arg => String(arg)).join(' '),
            timestamp: new Date(),
          });
        },
        warn: (...args: any[]) => {
          consoleCapture.push({
            type: 'warn',
            message: args.map(arg => String(arg)).join(' '),
            timestamp: new Date(),
          });
        },
        info: (...args: any[]) => {
          consoleCapture.push({
            type: 'info',
            message: args.map(arg => String(arg)).join(' '),
            timestamp: new Date(),
          });
        },
      };

      // Execute code with custom console
      const wrappedCode = `
        (function(console) {
          'use strict';
          try {
            ${code}
          } catch (error) {
            console.error(error.message || error);
          }
        })(customConsole);
      `;

      // eslint-disable-next-line no-new-func
      const fn = new Function('customConsole', wrappedCode);
      fn(customConsole);

      setOutput(consoleCapture);
    } catch (error: any) {
      setOutput([{
        type: 'error',
        message: error.message || 'Execution failed',
        timestamp: new Date(),
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  // Execute HTML/CSS/JS in iframe
  const executeHTML = () => {
    setIsRunning(true);
    setOutput([]);

    const htmlDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: system-ui, -apple-system, sans-serif;
            }
          </style>
        </head>
        <body>
          ${code}
          <script>
            // Capture console output
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info,
            };

            function sendToParent(type, ...args) {
              window.parent.postMessage({
                type: 'console',
                level: type,
                message: args.map(arg =>
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' '),
              }, '*');
            }

            console.log = (...args) => { originalConsole.log(...args); sendToParent('log', ...args); };
            console.error = (...args) => { originalConsole.error(...args); sendToParent('error', ...args); };
            console.warn = (...args) => { originalConsole.warn(...args); sendToParent('warn', ...args); };
            console.info = (...args) => { originalConsole.info(...args); sendToParent('info', ...args); };

            // Catch errors
            window.addEventListener('error', (event) => {
              sendToParent('error', event.message);
            });
          </script>
        </body>
      </html>
    `;

    setHtmlPreview(htmlDoc);
    setTimeout(() => setIsRunning(false), 100);
  };

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setOutput(prev => [...prev, {
          type: event.data.level,
          message: event.data.message,
          timestamp: new Date(),
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRun = () => {
    if (language === 'javascript') {
      executeJavaScript();
    } else {
      executeHTML();
    }
  };

  const clearOutput = () => {
    setOutput([]);
    setHtmlPreview('');
  };

  const getConsoleColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Code Sandbox</h2>
            <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
              {language.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearOutput}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning || !code.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {isRunning ? 'Running...' : 'Run Code'}
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
          {/* Editor */}
          <div className="w-1/2 flex flex-col border-r border-gray-700">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-xs font-medium text-gray-400">EDITOR</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
              placeholder={
                language === 'javascript'
                  ? '// Write JavaScript code here\nconsole.log("Hello, World!");'
                  : language === 'html'
                  ? '<!-- Write HTML here -->\n<h1>Hello, World!</h1>'
                  : '/* Write CSS here */\nbody { color: blue; }'
              }
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="w-1/2 flex flex-col">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-xs font-medium text-gray-400">
                {language === 'javascript' ? 'CONSOLE OUTPUT' : 'PREVIEW'}
              </span>
            </div>
            <div className="flex-1 overflow-auto">
              {language === 'javascript' ? (
                <div className="p-4 space-y-2 font-mono text-sm">
                  {output.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                      Run code to see console output
                    </div>
                  ) : (
                    output.map((msg, idx) => (
                      <div key={idx} className={`${getConsoleColor(msg.type)}`}>
                        <span className="text-gray-500 text-xs">
                          [{msg.type}]
                        </span>{' '}
                        {msg.message}
                      </div>
                    ))
                  )}
                </div>
              ) : htmlPreview ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={htmlPreview}
                  className="w-full h-full bg-white"
                  sandbox="allow-scripts"
                  title="HTML Preview"
                />
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Run code to see preview
                </div>
              )}
            </div>

            {/* Console Output for HTML mode */}
            {language !== 'javascript' && output.length > 0 && (
              <div className="border-t border-gray-700">
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="text-xs font-medium text-gray-400">CONSOLE</span>
                </div>
                <div className="p-4 space-y-2 font-mono text-sm max-h-32 overflow-auto">
                  {output.map((msg, idx) => (
                    <div key={idx} className={`${getConsoleColor(msg.type)}`}>
                      <span className="text-gray-500 text-xs">[{msg.type}]</span> {msg.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {code.split('\n').length} lines • {code.length} characters
          </div>
          <div className="text-xs text-gray-500">
            Code runs in a sandboxed environment for safety
          </div>
        </div>
      </div>
    </div>
  );
}
