/**
 * Structured Output Service
 * Handles JSON schema validation, XML generation, and CSV/table formatting
 * @author Dr. Ernesto Lee
 */

export type OutputFormat = 'json' | 'xml' | 'csv' | 'table' | 'markdown-table';

export interface JsonSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  items?: any;
  [key: string]: any;
}

export interface StructuredOutputOptions {
  format: OutputFormat;
  schema?: JsonSchema;
  rootElement?: string; // For XML
  includeHeaders?: boolean; // For CSV/tables
  delimiter?: string; // For CSV (default: comma)
}

export class StructuredOutputService {
  /**
   * Validate JSON data against a schema
   */
  validateJson(data: any, schema: JsonSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic type validation
    if (schema.type && typeof data !== schema.type && schema.type !== 'object' && schema.type !== 'array') {
      errors.push(`Expected type ${schema.type}, got ${typeof data}`);
      return { valid: false, errors };
    }

    // Object validation
    if (schema.type === 'object' && typeof data === 'object' && data !== null) {
      // Check required properties
      if (schema.required) {
        for (const requiredProp of schema.required) {
          if (!(requiredProp in data)) {
            errors.push(`Missing required property: ${requiredProp}`);
          }
        }
      }

      // Validate properties
      if (schema.properties) {
        for (const [key, value] of Object.entries(data)) {
          if (schema.properties[key]) {
            const propSchema = schema.properties[key];
            const propValidation = this.validateJson(value, propSchema);
            if (!propValidation.valid) {
              errors.push(...propValidation.errors.map(e => `${key}: ${e}`));
            }
          }
        }
      }
    }

    // Array validation
    if (schema.type === 'array' && Array.isArray(data)) {
      if (schema.items) {
        data.forEach((item, index) => {
          const itemValidation = this.validateJson(item, schema.items);
          if (!itemValidation.valid) {
            errors.push(...itemValidation.errors.map(e => `[${index}]: ${e}`));
          }
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate system prompt for structured output
   */
  generateStructuredPrompt(userPrompt: string, options: StructuredOutputOptions): string {
    const formatInstructions: Record<OutputFormat, string> = {
      json: `Respond with ONLY valid JSON matching this schema:\n${JSON.stringify(options.schema, null, 2)}\n\nDo not include any explanatory text, only the JSON object.`,

      xml: `Respond with ONLY valid XML. Use "${options.rootElement || 'root'}" as the root element. Structure your response as proper XML with opening and closing tags. Do not include any explanatory text outside the XML.`,

      csv: `Respond with ONLY CSV format. ${options.includeHeaders !== false ? 'Include headers in the first row.' : 'Do not include headers.'} Use "${options.delimiter || ','}" as the delimiter. Do not include any explanatory text, only the CSV data.`,

      table: `Respond with ONLY a text-based table using pipes (|) and dashes (-) for formatting. Include headers and align columns. Do not include any explanatory text outside the table.`,

      'markdown-table': `Respond with ONLY a Markdown table. Use pipes (|) for column separators and dashes (-) for the header separator. Include a header row. Do not include any explanatory text outside the table.`,
    };

    const instruction = formatInstructions[options.format];
    return `${instruction}\n\nUser request: ${userPrompt}`;
  }

  /**
   * Parse and validate JSON response
   */
  parseJsonResponse(response: string, schema?: JsonSchema): { success: boolean; data?: any; errors?: string[] } {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonStr = response.trim();

      // Remove markdown code blocks
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }

      const data = JSON.parse(jsonStr);

      // Validate against schema if provided
      if (schema) {
        const validation = this.validateJson(data, schema);
        if (!validation.valid) {
          return { success: false, errors: validation.errors };
        }
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, errors: [`JSON parsing error: ${error}`] };
    }
  }

  /**
   * Convert JSON to XML
   */
  jsonToXml(data: any, rootElement: string = 'root', indent: number = 0): string {
    const indentation = '  '.repeat(indent);

    if (Array.isArray(data)) {
      return data.map(item => this.jsonToXml(item, 'item', indent)).join('\n');
    }

    if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        return `${indentation}<${rootElement}/>`;
      }

      const children = entries
        .map(([key, value]) => this.jsonToXml(value, key, indent + 1))
        .join('\n');

      return `${indentation}<${rootElement}>\n${children}\n${indentation}</${rootElement}>`;
    }

    // Primitive values
    const escapedData = String(data)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    return `${indentation}<${rootElement}>${escapedData}</${rootElement}>`;
  }

  /**
   * Convert JSON array to CSV
   */
  jsonToCsv(data: any[], includeHeaders: boolean = true, delimiter: string = ','): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    const keys = Array.from(allKeys);
    const lines: string[] = [];

    // Add headers
    if (includeHeaders) {
      lines.push(keys.map(k => this.escapeCsvValue(k, delimiter)).join(delimiter));
    }

    // Add data rows
    data.forEach(item => {
      const row = keys.map(key => {
        const value = typeof item === 'object' && item !== null ? item[key] : item;
        return this.escapeCsvValue(value, delimiter);
      });
      lines.push(row.join(delimiter));
    });

    return lines.join('\n');
  }

  /**
   * Escape CSV value
   */
  private escapeCsvValue(value: any, delimiter: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);

    // If the value contains delimiter, newline, or quotes, wrap in quotes and escape quotes
    if (str.includes(delimiter) || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Convert JSON to Markdown table
   */
  jsonToMarkdownTable(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    // Get all unique keys
    const allKeys = new Set<string>();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    const keys = Array.from(allKeys);
    const lines: string[] = [];

    // Add header
    lines.push('| ' + keys.join(' | ') + ' |');

    // Add separator
    lines.push('| ' + keys.map(() => '---').join(' | ') + ' |');

    // Add data rows
    data.forEach(item => {
      const row = keys.map(key => {
        const value = typeof item === 'object' && item !== null ? item[key] : item;
        return String(value ?? '').replace(/\|/g, '\\|'); // Escape pipes
      });
      lines.push('| ' + row.join(' | ') + ' |');
    });

    return lines.join('\n');
  }

  /**
   * Convert JSON to text table (ASCII)
   */
  jsonToTextTable(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    // Get all unique keys
    const allKeys = new Set<string>();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    const keys = Array.from(allKeys);

    // Calculate column widths
    const widths = keys.map(key => key.length);
    data.forEach(item => {
      keys.forEach((key, i) => {
        const value = typeof item === 'object' && item !== null ? item[key] : item;
        const length = String(value ?? '').length;
        widths[i] = Math.max(widths[i], length);
      });
    });

    const lines: string[] = [];

    // Create separator
    const separator = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';

    // Add header
    lines.push(separator);
    const headerRow = '|' + keys.map((key, i) => ` ${key.padEnd(widths[i])} `).join('|') + '|';
    lines.push(headerRow);
    lines.push(separator);

    // Add data rows
    data.forEach(item => {
      const row = '|' + keys.map((key, i) => {
        const value = typeof item === 'object' && item !== null ? item[key] : item;
        return ` ${String(value ?? '').padEnd(widths[i])} `;
      }).join('|') + '|';
      lines.push(row);
    });

    lines.push(separator);

    return lines.join('\n');
  }

  /**
   * Format output based on format type
   */
  formatOutput(data: any, format: OutputFormat, options: Partial<StructuredOutputOptions> = {}): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);

      case 'xml':
        return '<?xml version="1.0" encoding="UTF-8"?>\n' +
               this.jsonToXml(data, options.rootElement || 'root', 0);

      case 'csv':
        return this.jsonToCsv(
          Array.isArray(data) ? data : [data],
          options.includeHeaders !== false,
          options.delimiter || ','
        );

      case 'markdown-table':
        return this.jsonToMarkdownTable(Array.isArray(data) ? data : [data]);

      case 'table':
        return this.jsonToTextTable(Array.isArray(data) ? data : [data]);

      default:
        return JSON.stringify(data, null, 2);
    }
  }
}

export const structuredOutputService = new StructuredOutputService();
