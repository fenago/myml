/**
 * Function Calling Types
 * Defines types for AI function calling capabilities
 *
 * @author Dr. Ernesto Lee
 */

export type FunctionParameterType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface FunctionParameter {
  name: string;
  type: FunctionParameterType;
  description: string;
  required: boolean;
  default?: any;
}

export interface FunctionDefinition {
  id: string;
  name: string;
  description: string;
  parameters: FunctionParameter[];
  enabled: boolean;
  builtIn: boolean; // Whether it's a built-in function or user-defined

  // For custom functions
  endpoint?: string;
  apiKey?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;

  // Execution handler (for built-in functions)
  handler?: (params: Record<string, any>) => Promise<any>;
}

export interface FunctionCall {
  functionId: string;
  functionName: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

export interface FunctionResult {
  functionId: string;
  functionName: string;
  success: boolean;
  result?: any;
  error?: string;
  timestamp: Date;
}
