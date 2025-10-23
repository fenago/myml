/**
 * Message Content Component
 * Renders message content with code block support and markdown formatting
 * @author Dr. Ernesto Lee
 */

import { CodeBlock } from './CodeBlock';
import { parseMarkdown, markdownToHtml } from '../utils/markdownParser';

interface Props {
  content: string;
}

export function MessageContent({ content }: Props) {
  const blocks = parseMarkdown(content);

  return (
    <div className="message-content">
      {blocks.map((block) => {
        if (block.type === 'code') {
          return <CodeBlock key={block.index} code={block.code} language={block.language} />;
        } else {
          return (
            <div
              key={block.index}
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(block.content) }}
            />
          );
        }
      })}

      <style>{`
        .message-content .inline-code {
          background-color: rgba(110, 118, 129, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
        }

        .dark .message-content .inline-code {
          background-color: rgba(110, 118, 129, 0.3);
        }

        .message-content .prose {
          color: inherit;
        }

        .message-content .prose strong {
          font-weight: 600;
          color: inherit;
        }

        .message-content .prose em {
          font-style: italic;
          color: inherit;
        }

        .message-content .prose a {
          color: #3b82f6;
          text-decoration: none;
        }

        .message-content .prose a:hover {
          text-decoration: underline;
        }

        .dark .message-content .prose a {
          color: #60a5fa;
        }
      `}</style>
    </div>
  );
}
