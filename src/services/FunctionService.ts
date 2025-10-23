/**
 * Function Calling Service
 * Manages AI function calling capabilities
 *
 * @author Dr. Ernesto Lee
 */

import type { FunctionDefinition, FunctionCall, FunctionResult } from '../types';

/**
 * Get current weather using OpenMeteo API
 * Free weather API - no API key required!
 */
async function getWeather(params: Record<string, any>): Promise<any> {
  const { location, latitude, longitude } = params;

  let lat = latitude;
  let lon = longitude;

  // If location string provided instead of coordinates, use geocoding
  if (location && !lat && !lon) {
    const geocodeResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
    );
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      throw new Error(`Could not find location: ${location}`);
    }

    lat = geocodeData.results[0].latitude;
    lon = geocodeData.results[0].longitude;
  }

  if (!lat || !lon) {
    throw new Error('Must provide either location name or latitude/longitude');
  }

  // Get current weather from OpenMeteo
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
  );

  const weatherData = await weatherResponse.json();

  // Format the response
  return {
    location: location || `${lat}, ${lon}`,
    temperature: weatherData.current.temperature_2m,
    feelsLike: weatherData.current.apparent_temperature,
    humidity: weatherData.current.relative_humidity_2m,
    precipitation: weatherData.current.precipitation,
    windSpeed: weatherData.current.wind_speed_10m,
    weatherCode: weatherData.current.weather_code,
    unit: 'fahrenheit',
    timezone: weatherData.timezone,
  };
}

/**
 * Built-in function definitions
 */
export const BUILT_IN_FUNCTIONS: FunctionDefinition[] = [
  {
    id: 'weather_openmeteo',
    name: 'Get Weather',
    description: 'Get current weather conditions for any location using OpenMeteo API (no API key required)',
    parameters: [
      {
        name: 'location',
        type: 'string',
        description: 'City name, address, or location (e.g., "New York", "Paris, France")',
        required: false,
      },
      {
        name: 'latitude',
        type: 'number',
        description: 'Latitude coordinate (alternative to location)',
        required: false,
      },
      {
        name: 'longitude',
        type: 'number',
        description: 'Longitude coordinate (alternative to location)',
        required: false,
      },
    ],
    enabled: true, // Enabled by default
    builtIn: true,
    handler: getWeather,
  },
];

export class FunctionService {
  private functions: Map<string, FunctionDefinition> = new Map();

  constructor() {
    // Load built-in functions
    BUILT_IN_FUNCTIONS.forEach((func) => {
      this.functions.set(func.id, func);
    });
  }

  /**
   * Get all available functions
   */
  getFunctions(): FunctionDefinition[] {
    return Array.from(this.functions.values());
  }

  /**
   * Get enabled functions only
   */
  getEnabledFunctions(): FunctionDefinition[] {
    return Array.from(this.functions.values()).filter((func) => func.enabled);
  }

  /**
   * Get function by ID
   */
  getFunction(id: string): FunctionDefinition | undefined {
    return this.functions.get(id);
  }

  /**
   * Add or update a function
   */
  setFunction(func: FunctionDefinition): void {
    this.functions.set(func.id, func);
  }

  /**
   * Remove a function (only custom functions)
   */
  removeFunction(id: string): boolean {
    const func = this.functions.get(id);
    if (func && !func.builtIn) {
      this.functions.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Enable/disable a function
   */
  toggleFunction(id: string, enabled: boolean): void {
    const func = this.functions.get(id);
    if (func) {
      func.enabled = enabled;
      this.functions.set(id, func);
    }
  }

  /**
   * Execute a function call
   */
  async executeFunction(call: FunctionCall): Promise<FunctionResult> {
    const func = this.functions.get(call.functionId);

    if (!func) {
      return {
        functionId: call.functionId,
        functionName: call.functionName,
        success: false,
        error: `Function not found: ${call.functionName}`,
        timestamp: new Date(),
      };
    }

    if (!func.enabled) {
      return {
        functionId: call.functionId,
        functionName: call.functionName,
        success: false,
        error: `Function is disabled: ${call.functionName}`,
        timestamp: new Date(),
      };
    }

    try {
      let result: any;

      if (func.handler) {
        // Built-in function with handler
        result = await func.handler(call.parameters);
      } else if (func.endpoint) {
        // Custom function with HTTP endpoint
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...func.headers,
        };

        if (func.apiKey) {
          headers['Authorization'] = `Bearer ${func.apiKey}`;
        }

        const response = await fetch(func.endpoint, {
          method: func.method || 'POST',
          headers,
          body: func.method === 'GET' ? undefined : JSON.stringify(call.parameters),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        result = await response.json();
      } else {
        throw new Error('Function has no handler or endpoint configured');
      }

      return {
        functionId: call.functionId,
        functionName: call.functionName,
        success: true,
        result,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        functionId: call.functionId,
        functionName: call.functionName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Detect if user message might need a function call
   * Returns the function to call if detected
   */
  detectFunctionCall(userMessage: string): FunctionCall | null {
    const message = userMessage.toLowerCase();

    // Weather detection
    if (
      (message.includes('weather') || message.includes('temperature') || message.includes('forecast')) &&
      this.functions.get('weather_openmeteo')?.enabled
    ) {
      // Try to extract location from message
      const location = this.extractLocation(userMessage);

      return {
        functionId: 'weather_openmeteo',
        functionName: 'Get Weather',
        parameters: { location: location || 'New York' }, // Default to New York if no location found
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Extract location from user message
   */
  private extractLocation(message: string): string | null {
    // Simple location extraction - looks for "in <location>" or "for <location>" patterns
    const patterns = [
      /(?:in|for|at)\s+([a-zA-Z\s,]+?)(?:\?|\.|\s+today|\s+now|$)/i,
      /weather\s+([a-zA-Z\s,]+?)(?:\?|\.|\s+today|\s+now|$)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }
}

// Singleton instance
export const functionService = new FunctionService();
