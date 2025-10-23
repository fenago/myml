/**
 * Conversation Export Service
 * Export conversations in JSON, Markdown, and PDF formats
 *
 * @author Dr. Ernesto Lee
 */

import type { Conversation } from '../types';
import { getModelConfig } from '../config/models';

export class ExportService {
  /**
   * Export conversation as JSON
   */
  exportAsJSON(conversation: Conversation): void {
    const data = {
      id: conversation.id,
      modelId: conversation.modelId,
      modelName: getModelConfig(conversation.modelId).name,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.messages.length,
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, `conversation-${conversation.id}.json`);
  }

  /**
   * Export conversation as Markdown
   */
  exportAsMarkdown(conversation: Conversation): void {
    const model = getModelConfig(conversation.modelId);
    let markdown = `# Conversation Export\n\n`;
    markdown += `**Model**: ${model.name} (${model.id})\n`;
    markdown += `**Created**: ${new Date(conversation.createdAt).toLocaleString()}\n`;
    markdown += `**Updated**: ${new Date(conversation.updatedAt).toLocaleString()}\n`;
    markdown += `**Messages**: ${conversation.messages.length}\n\n`;
    markdown += `---\n\n`;

    conversation.messages.forEach((msg, index) => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';

      markdown += `## ${role} - ${timestamp}\n\n`;
      markdown += `${msg.content}\n\n`;

      // Add metadata if present
      if (msg.metadata) {
        markdown += `<details>\n<summary>Metadata</summary>\n\n`;
        markdown += `\`\`\`json\n${JSON.stringify(msg.metadata, null, 2)}\n\`\`\`\n\n`;
        markdown += `</details>\n\n`;
      }

      if (index < conversation.messages.length - 1) {
        markdown += `---\n\n`;
      }
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    this.downloadFile(blob, `conversation-${conversation.id}.md`);
  }

  /**
   * Export conversation as plain text
   */
  exportAsText(conversation: Conversation): void {
    const model = getModelConfig(conversation.modelId);
    let text = `=== Conversation Export ===\n\n`;
    text += `Model: ${model.name} (${model.id})\n`;
    text += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
    text += `Updated: ${new Date(conversation.updatedAt).toLocaleString()}\n`;
    text += `Messages: ${conversation.messages.length}\n\n`;
    text += `${'='.repeat(60)}\n\n`;

    conversation.messages.forEach((msg, index) => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const role = msg.role === 'user' ? 'USER' : 'ASSISTANT';

      text += `[${role}] ${timestamp}\n`;
      text += `${'-'.repeat(60)}\n`;
      text += `${msg.content}\n\n`;

      if (index < conversation.messages.length - 1) {
        text += `${'='.repeat(60)}\n\n`;
      }
    });

    const blob = new Blob([text], { type: 'text/plain' });
    this.downloadFile(blob, `conversation-${conversation.id}.txt`);
  }

  /**
   * Export conversation as HTML (can be printed to PDF)
   */
  exportAsHTML(conversation: Conversation): void {
    const model = getModelConfig(conversation.modelId);

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conversation Export - ${model.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    header h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    header p {
      opacity: 0.9;
      font-size: 14px;
    }
    .message {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .role {
      font-weight: 600;
      font-size: 14px;
    }
    .role.user {
      color: #3b82f6;
    }
    .role.assistant {
      color: #8b5cf6;
    }
    .timestamp {
      font-size: 12px;
      color: #6b7280;
    }
    .content {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .metadata {
      margin-top: 15px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 12px;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    .metadata summary {
      cursor: pointer;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .metadata pre {
      overflow-x: auto;
    }
    footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body {
        background: white;
      }
      .message {
        box-shadow: none;
        border: 1px solid #e5e7eb;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>💬 Conversation Export</h1>
    <p><strong>Model:</strong> ${model.name} (${model.id})</p>
    <p><strong>Created:</strong> ${new Date(conversation.createdAt).toLocaleString()}</p>
    <p><strong>Messages:</strong> ${conversation.messages.length}</p>
  </header>

  <main>
`;

    conversation.messages.forEach((msg) => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const roleClass = msg.role === 'user' ? 'user' : 'assistant';
      const roleLabel = msg.role === 'user' ? '👤 User' : '🤖 Assistant';

      html += `
    <div class="message">
      <div class="message-header">
        <span class="role ${roleClass}">${roleLabel}</span>
        <span class="timestamp">${timestamp}</span>
      </div>
      <div class="content">${this.escapeHtml(msg.content)}</div>`;

      if (msg.metadata) {
        html += `
      <div class="metadata">
        <details>
          <summary>Metadata</summary>
          <pre>${JSON.stringify(msg.metadata, null, 2)}</pre>
        </details>
      </div>`;
      }

      html += `
    </div>
`;
    });

    html += `
  </main>

  <footer>
    <p>Exported from MyML.app - Privacy-First Browser-Based AI</p>
    <p>Created by Dr. Ernesto Lee • All processing happened in your browser</p>
  </footer>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    this.downloadFile(blob, `conversation-${conversation.id}.html`);
  }

  /**
   * Download file
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Singleton instance
export const exportService = new ExportService();
