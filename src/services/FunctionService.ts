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
 * Get currency conversion rates
 * Using exchangerate-api.com - free, no API key required
 */
async function getCurrencyConversion(params: Record<string, any>): Promise<any> {
  const { from, to, amount = 1 } = params;

  if (!from || !to) {
    throw new Error('Both "from" and "to" currency codes are required (e.g., USD, EUR, GBP)');
  }

  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`
  );

  const data = await response.json();

  if (!data.rates) {
    throw new Error(`Could not get exchange rates for ${from}`);
  }

  const rate = data.rates[to.toUpperCase()];
  if (!rate) {
    throw new Error(`Currency code ${to} not found`);
  }

  const convertedAmount = amount * rate;

  return {
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    amount: parseFloat(amount),
    rate,
    convertedAmount,
    date: data.date,
  };
}

/**
 * Get country information
 * Using restcountries.com - free, no API key required
 */
async function getCountryInfo(params: Record<string, any>): Promise<any> {
  const { country } = params;

  if (!country) {
    throw new Error('Country name or code is required');
  }

  const response = await fetch(
    `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=false`
  );

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`Country not found: ${country}`);
  }

  const countryData = data[0];

  return {
    name: countryData.name.common,
    officialName: countryData.name.official,
    capital: countryData.capital?.[0] || 'N/A',
    population: countryData.population,
    region: countryData.region,
    subregion: countryData.subregion,
    languages: Object.values(countryData.languages || {}).join(', '),
    currencies: Object.values(countryData.currencies || {}).map((c: any) => c.name).join(', '),
    timezone: countryData.timezones?.[0] || 'N/A',
    flag: countryData.flag,
  };
}

/**
 * Get cryptocurrency prices
 * Using CoinGecko API - free, no API key required
 */
async function getCryptoPrices(params: Record<string, any>): Promise<any> {
  const { coins = 'bitcoin,ethereum', currency = 'usd' } = params;

  const coinIds = coins.toLowerCase().replace(/\s/g, '');

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true`
  );

  const data = await response.json();

  const result: any[] = [];

  Object.keys(data).forEach((coin) => {
    const currencyKey = currency.toLowerCase();
    result.push({
      coin: coin.charAt(0).toUpperCase() + coin.slice(1),
      price: data[coin][currencyKey],
      change24h: data[coin][`${currencyKey}_24h_change`]?.toFixed(2) || 0,
      marketCap: data[coin][`${currencyKey}_market_cap`],
      currency: currency.toUpperCase(),
    });
  });

  return result;
}

/**
 * Get a random joke
 * Using JokeAPI.dev - free, no API key required
 */
async function getRandomJoke(params: Record<string, any>): Promise<any> {
  const { category = 'Any', type = 'single' } = params;

  const response = await fetch(
    `https://v2.jokeapi.dev/joke/${category}?type=${type}`
  );

  const data = await response.json();

  if (data.error) {
    throw new Error('Could not fetch joke');
  }

  if (data.type === 'single') {
    return {
      type: 'single',
      joke: data.joke,
      category: data.category,
    };
  } else {
    return {
      type: 'twopart',
      setup: data.setup,
      delivery: data.delivery,
      category: data.category,
    };
  }
}

/**
 * Get top stories from Hacker News
 * Using Hacker News API - free, no API key required
 */
async function getHackerNews(params: Record<string, any>): Promise<any> {
  const { limit = 10, type = 'top' } = params;

  // Get top story IDs
  const storiesResponse = await fetch(
    `https://hacker-news.firebaseio.com/v0/${type}stories.json`
  );
  const storyIds = await storiesResponse.json();

  // Fetch details for first N stories
  const stories = [];
  const maxStories = Math.min(limit, 20); // Cap at 20 to avoid too many requests

  for (let i = 0; i < maxStories; i++) {
    const storyResponse = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${storyIds[i]}.json`
    );
    const story = await storyResponse.json();

    if (story && story.title) {
      stories.push({
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        score: story.score,
        author: story.by,
        time: new Date(story.time * 1000).toLocaleString(),
        comments: story.descendants || 0,
      });
    }
  }

  return stories;
}

/**
 * Get posts from Reddit
 * Using Reddit JSON API - free, no API key required
 */
async function getRedditNews(params: Record<string, any>): Promise<any> {
  const { subreddit = 'worldnews', limit = 10 } = params;

  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}.json?limit=${Math.min(limit, 25)}`
  );

  const data = await response.json();

  if (!data.data || !data.data.children) {
    throw new Error(`Could not fetch from r/${subreddit}`);
  }

  const posts = data.data.children.map((child: any) => {
    const post = child.data;
    return {
      title: post.title,
      url: post.url,
      subreddit: post.subreddit,
      author: post.author,
      score: post.score,
      comments: post.num_comments,
      created: new Date(post.created_utc * 1000).toLocaleString(),
      isVideo: post.is_video,
    };
  });

  return posts;
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
    enabled: true,
    builtIn: true,
    handler: getWeather,
  },
  {
    id: 'currency_conversion',
    name: 'Convert Currency',
    description: 'Convert between different currencies with real-time exchange rates (no API key required)',
    parameters: [
      {
        name: 'from',
        type: 'string',
        description: 'Source currency code (e.g., USD, EUR, GBP)',
        required: true,
      },
      {
        name: 'to',
        type: 'string',
        description: 'Target currency code (e.g., USD, EUR, GBP)',
        required: true,
      },
      {
        name: 'amount',
        type: 'number',
        description: 'Amount to convert (default: 1)',
        required: false,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getCurrencyConversion,
  },
  {
    id: 'country_info',
    name: 'Get Country Information',
    description: 'Get detailed information about any country including population, capital, languages, and more (no API key required)',
    parameters: [
      {
        name: 'country',
        type: 'string',
        description: 'Country name (e.g., "France", "Japan", "Brazil")',
        required: true,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getCountryInfo,
  },
  {
    id: 'crypto_prices',
    name: 'Get Cryptocurrency Prices',
    description: 'Get current prices and market data for cryptocurrencies (no API key required)',
    parameters: [
      {
        name: 'coins',
        type: 'string',
        description: 'Comma-separated coin IDs (e.g., "bitcoin,ethereum,cardano") - default: "bitcoin,ethereum"',
        required: false,
      },
      {
        name: 'currency',
        type: 'string',
        description: 'Target currency (e.g., usd, eur, gbp) - default: "usd"',
        required: false,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getCryptoPrices,
  },
  {
    id: 'random_joke',
    name: 'Get Random Joke',
    description: 'Get a random joke to lighten the mood (no API key required)',
    parameters: [
      {
        name: 'category',
        type: 'string',
        description: 'Joke category: Any, Programming, Misc, Dark, Pun, Spooky, Christmas (default: "Any")',
        required: false,
      },
      {
        name: 'type',
        type: 'string',
        description: 'Joke type: single or twopart (default: "single")',
        required: false,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getRandomJoke,
  },
  {
    id: 'hacker_news',
    name: 'Get Hacker News Stories',
    description: 'Get top tech stories from Hacker News (no API key required)',
    parameters: [
      {
        name: 'limit',
        type: 'number',
        description: 'Number of stories to fetch (1-20, default: 10)',
        required: false,
      },
      {
        name: 'type',
        type: 'string',
        description: 'Story type: top, new, best, ask, show, job (default: "top")',
        required: false,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getHackerNews,
  },
  {
    id: 'reddit_news',
    name: 'Get Reddit News',
    description: 'Get posts from any Reddit subreddit (no API key required)',
    parameters: [
      {
        name: 'subreddit',
        type: 'string',
        description: 'Subreddit name (e.g., "worldnews", "technology", "science") - default: "worldnews"',
        required: false,
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Number of posts to fetch (1-25, default: 10)',
        required: false,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getRedditNews,
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
    // Improved location extraction with better patterns
    const patterns = [
      // "weather in <location>" or "weather for <location>"
      /weather\s+(?:in|for|at)\s+([a-zA-Z\s,]+?)(?:\?|\.|\s*$)/i,
      // "in <location>" or "for <location>" (after weather keywords)
      /(?:weather|temperature|forecast).*?(?:in|for|at)\s+([a-zA-Z\s,]+?)(?:\?|\.|\s*$)/i,
      // "<location> weather"
      /^([a-zA-Z\s,]+?)\s+weather/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const location = match[1].trim();
        // Filter out common words that aren't locations
        const excludeWords = ['the', 'a', 'is', 'like', 'what', 'how', 'today', 'now', 'there'];
        const cleanLocation = location
          .split(/\s+/)
          .filter(word => !excludeWords.includes(word.toLowerCase()))
          .join(' ')
          .trim();

        if (cleanLocation) {
          return cleanLocation;
        }
      }
    }

    return null;
  }
}

// Singleton instance
export const functionService = new FunctionService();
