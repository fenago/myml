/**
 * Project Generator Service
 * Generates multi-file code projects from AI responses
 * @author Dr. Ernesto Lee
 */

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

export interface GeneratedProject {
  name: string;
  description: string;
  files: ProjectFile[];
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

class ProjectGenerator {
  /**
   * Parse AI response to extract project structure
   */
  parseProjectFromResponse(response: string): GeneratedProject | null {
    // Look for project structure in the response
    const projectMatch = response.match(/```project\s*\n([\s\S]*?)```/);

    if (!projectMatch) {
      // Try to extract individual code blocks
      return this.extractProjectFromCodeBlocks(response);
    }

    try {
      const projectData = JSON.parse(projectMatch[1]);
      return projectData as GeneratedProject;
    } catch (error) {
      console.error('Failed to parse project structure:', error);
      return this.extractProjectFromCodeBlocks(response);
    }
  }

  /**
   * Extract project from individual code blocks in the response
   */
  private extractProjectFromCodeBlocks(response: string): GeneratedProject | null {
    const codeBlocks: ProjectFile[] = [];

    // Match code blocks with optional file paths
    const blockRegex = /```(\w+)(?:\s+([^\n]+))?\n([\s\S]*?)```/g;
    let match;

    while ((match = blockRegex.exec(response)) !== null) {
      const language = match[1];
      const filepath = match[2] || `file.${this.getFileExtension(language)}`;
      const content = match[3].trim();

      codeBlocks.push({
        path: filepath,
        content,
        language,
      });
    }

    if (codeBlocks.length === 0) return null;

    // Extract project name from response or use default
    const nameMatch = response.match(/(?:project|app|application) (?:name|called):?\s*([^\n.]+)/i);
    const name = nameMatch ? nameMatch[1].trim() : 'generated-project';

    // Extract description
    const descMatch = response.match(/(?:description|about):?\s*([^\n]+)/i);
    const description = descMatch ? descMatch[1].trim() : 'AI-generated project';

    return {
      name,
      description,
      files: codeBlocks,
    };
  }

  /**
   * Get file extension for language
   */
  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      jsx: 'jsx',
      tsx: 'tsx',
      python: 'py',
      java: 'java',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'md',
      yaml: 'yml',
      shell: 'sh',
      bash: 'sh',
      sql: 'sql',
      go: 'go',
      rust: 'rs',
      cpp: 'cpp',
      c: 'c',
    };

    return extensions[language.toLowerCase()] || language;
  }

  /**
   * Create a project with common file structure
   */
  createProject(
    name: string,
    type: 'react' | 'node' | 'python' | 'vanilla-js' | 'express'
  ): GeneratedProject {
    const templates = {
      react: this.createReactProject(name),
      node: this.createNodeProject(name),
      python: this.createPythonProject(name),
      'vanilla-js': this.createVanillaJSProject(name),
      express: this.createExpressProject(name),
    };

    return templates[type];
  }

  /**
   * Create React project template
   */
  private createReactProject(name: string): GeneratedProject {
    return {
      name,
      description: 'React application with TypeScript',
      files: [
        {
          path: 'package.json',
          language: 'json',
          content: JSON.stringify({
            name,
            version: '1.0.0',
            type: 'module',
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
            },
            devDependencies: {
              '@types/react': '^18.2.0',
              '@types/react-dom': '^18.2.0',
              '@vitejs/plugin-react': '^4.0.0',
              typescript: '^5.0.0',
              vite: '^4.4.0',
            },
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              preview: 'vite preview',
            },
          }, null, 2),
        },
        {
          path: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        },
        {
          path: 'src/main.tsx',
          language: 'typescript',
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        },
        {
          path: 'src/App.tsx',
          language: 'typescript',
          content: `function App() {
  return (
    <div className="app">
      <h1>Welcome to ${name}</h1>
      <p>Start building your React app here!</p>
    </div>
  );
}

export default App;`,
        },
        {
          path: 'src/index.css',
          language: 'css',
          content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 2rem;
}

.app {
  max-width: 800px;
  margin: 0 auto;
}`,
        },
      ],
    };
  }

  /**
   * Create Node.js project template
   */
  private createNodeProject(name: string): GeneratedProject {
    return {
      name,
      description: 'Node.js application with TypeScript',
      files: [
        {
          path: 'package.json',
          language: 'json',
          content: JSON.stringify({
            name,
            version: '1.0.0',
            type: 'module',
            main: 'dist/index.js',
            scripts: {
              build: 'tsc',
              start: 'node dist/index.js',
              dev: 'tsx watch src/index.ts',
            },
            dependencies: {},
            devDependencies: {
              '@types/node': '^20.0.0',
              typescript: '^5.0.0',
              tsx: '^3.12.0',
            },
          }, null, 2),
        },
        {
          path: 'src/index.ts',
          language: 'typescript',
          content: `console.log('Hello from ${name}!');

function main() {
  // Your code here
}

main();`,
        },
        {
          path: 'tsconfig.json',
          language: 'json',
          content: JSON.stringify({
            compilerOptions: {
              target: 'ES2020',
              module: 'ES2020',
              lib: ['ES2020'],
              outDir: './dist',
              rootDir: './src',
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              moduleResolution: 'node',
            },
            include: ['src/**/*'],
            exclude: ['node_modules'],
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Create Python project template
   */
  private createPythonProject(name: string): GeneratedProject {
    return {
      name,
      description: 'Python application',
      files: [
        {
          path: 'main.py',
          language: 'python',
          content: `"""
${name}
"""

def main():
    print("Hello from ${name}!")
    # Your code here

if __name__ == "__main__":
    main()`,
        },
        {
          path: 'requirements.txt',
          language: 'text',
          content: `# Add your dependencies here
`,
        },
        {
          path: 'README.md',
          language: 'markdown',
          content: `# ${name}

## Installation

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Usage

\`\`\`bash
python main.py
\`\`\``,
        },
      ],
    };
  }

  /**
   * Create Vanilla JavaScript project template
   */
  private createVanillaJSProject(name: string): GeneratedProject {
    return {
      name,
      description: 'Vanilla JavaScript project',
      files: [
        {
          path: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Welcome to ${name}</h1>
    <script src="script.js"></script>
</body>
</html>`,
        },
        {
          path: 'style.css',
          language: 'css',
          content: `body {
    font-family: Arial, sans-serif;
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}`,
        },
        {
          path: 'script.js',
          language: 'javascript',
          content: `console.log('${name} loaded!');

// Your code here`,
        },
      ],
    };
  }

  /**
   * Create Express project template
   */
  private createExpressProject(name: string): GeneratedProject {
    return {
      name,
      description: 'Express.js server',
      files: [
        {
          path: 'package.json',
          language: 'json',
          content: JSON.stringify({
            name,
            version: '1.0.0',
            type: 'module',
            main: 'src/server.js',
            scripts: {
              start: 'node src/server.js',
              dev: 'nodemon src/server.js',
            },
            dependencies: {
              express: '^4.18.2',
              cors: '^2.8.5',
            },
            devDependencies: {
              nodemon: '^3.0.0',
            },
          }, null, 2),
        },
        {
          path: 'src/server.js',
          language: 'javascript',
          content: `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${name}' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        },
      ],
    };
  }

  /**
   * Generate README for project
   */
  generateReadme(project: GeneratedProject): string {
    return `# ${project.name}

${project.description}

## Files

${project.files.map(f => `- \`${f.path}\``).join('\n')}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm run dev
\`\`\`

---

*Generated by BrowserGPT*
`;
  }
}

export const projectGenerator = new ProjectGenerator();
