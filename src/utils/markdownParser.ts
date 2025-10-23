/**
 * Markdown Parser Utility
 * Parses markdown content and extracts code blocks
 * @author Dr. Ernesto Lee
 */

export interface CodeBlock {
  type: 'code';
  language: string;
  code: string;
  index: number;
}

export interface TextBlock {
  type: 'text';
  content: string;
  index: number;
}

export type ContentBlock = CodeBlock | TextBlock;

/**
 * Parse markdown content and extract code blocks
 */
export function parseMarkdown(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = content.slice(lastIndex, match.index);
      if (textContent.trim()) {
        blocks.push({
          type: 'text',
          content: textContent,
          index: blockIndex++,
        });
      }
    }

    // Add code block
    const language = match[1] || 'text';
    const code = match[2].trim();
    blocks.push({
      type: 'code',
      language,
      code,
      index: blockIndex++,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block
  if (lastIndex < content.length) {
    const textContent = content.slice(lastIndex);
    if (textContent.trim()) {
      blocks.push({
        type: 'text',
        content: textContent,
        index: blockIndex++,
      });
    }
  }

  // If no code blocks found, return entire content as text
  if (blocks.length === 0) {
    blocks.push({
      type: 'text',
      content,
      index: 0,
    });
  }

  return blocks;
}

/**
 * Check if content contains code blocks
 */
export function hasCodeBlocks(content: string): boolean {
  return /```(\w+)?\n[\s\S]*?```/.test(content);
}

/**
 * Format inline code (backtick-wrapped text)
 */
export function formatInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
}

/**
 * Convert markdown to HTML (basic formatting)
 */
export function markdownToHtml(text: string): string {
  let html = text;

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Inline code: `code`
  html = formatInlineCode(html);

  // Links: [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}
