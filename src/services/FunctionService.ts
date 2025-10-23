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
 * Search Wikipedia
 * Using Wikipedia API - free, no API key required
 */
async function searchWikipedia(params: Record<string, any>): Promise<any> {
  const { query, limit = 3 } = params;

  if (!query) {
    throw new Error('Search query is required');
  }

  const searchResponse = await fetch(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&format=json&origin=*`
  );

  const data = await searchResponse.json();

  const results: any[] = [];
  for (let i = 0; i < data[1].length; i++) {
    results.push({
      title: data[1][i],
      description: data[2][i],
      url: data[3][i],
    });
  }

  return results;
}

/**
 * Get IP Geolocation
 * Using ipapi.co - free, no API key required (limited to 1000/day)
 */
async function getIPGeolocation(params: Record<string, any>): Promise<any> {
  const { ip = '' } = params;

  const url = ip
    ? `https://ipapi.co/${ip}/json/`
    : 'https://ipapi.co/json/'; // If no IP provided, get user's IP

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.reason || 'Could not get geolocation');
  }

  return {
    ip: data.ip,
    city: data.city,
    region: data.region,
    country: data.country_name,
    countryCode: data.country_code,
    postal: data.postal,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    currency: data.currency,
    org: data.org,
  };
}

/**
 * Get GitHub Repository Info
 * Using GitHub API - free, no API key required (rate limited)
 */
async function getGitHubRepo(params: Record<string, any>): Promise<any> {
  const { repo } = params;

  if (!repo) {
    throw new Error('Repository name required (format: owner/repo)');
  }

  const response = await fetch(
    `https://api.github.com/repos/${repo}`
  );

  const data = await response.json();

  if (data.message === 'Not Found') {
    throw new Error(`Repository not found: ${repo}`);
  }

  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count,
    language: data.language,
    license: data.license?.name || 'No license',
    url: data.html_url,
    createdAt: new Date(data.created_at).toLocaleDateString(),
    updatedAt: new Date(data.updated_at).toLocaleDateString(),
  };
}

/**
 * Get word definition
 * Using Free Dictionary API - free, no API key required
 */
async function getDefinition(params: Record<string, any>): Promise<any> {
  const { word } = params;

  if (!word) {
    throw new Error('Word is required');
  }

  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  );

  const data = await response.json();

  if (data.title === 'No Definitions Found') {
    throw new Error(`No definition found for: ${word}`);
  }

  const entry = data[0];
  const meanings = entry.meanings.map((m: any) => ({
    partOfSpeech: m.partOfSpeech,
    definition: m.definitions[0].definition,
    example: m.definitions[0].example || null,
  }));

  return {
    word: entry.word,
    phonetic: entry.phonetic || '',
    meanings,
    sourceUrl: entry.sourceUrls?.[0] || '',
  };
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
  {
    id: 'wikipedia_search',
    name: 'Search Wikipedia',
    description: 'Search Wikipedia for article summaries (no API key required)',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Search query (e.g., "Albert Einstein", "Python programming")',
        required: true,
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Number of results (1-10, default: 3)',
        required: false,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: searchWikipedia,
  },
  {
    id: 'ip_geolocation',
    name: 'Get IP Geolocation',
    description: 'Get geographic information about an IP address or your own location (no API key required)',
    parameters: [
      {
        name: 'ip',
        type: 'string',
        description: 'IP address (optional, defaults to your IP)',
        required: false,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getIPGeolocation,
  },
  {
    id: 'github_repo',
    name: 'Get GitHub Repository Info',
    description: 'Get detailed information about a GitHub repository (no API key required)',
    parameters: [
      {
        name: 'repo',
        type: 'string',
        description: 'Repository in format "owner/repo" (e.g., "facebook/react")',
        required: true,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getGitHubRepo,
  },
  {
    id: 'word_definition',
    name: 'Get Word Definition',
    description: 'Get the definition, pronunciation, and usage of any English word (no API key required)',
    parameters: [
      {
        name: 'word',
        type: 'string',
        description: 'Word to define (e.g., "serendipity")',
        required: true,
      },
    ],
    enabled: true,
    builtIn: true,
    handler: getDefinition,
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
   *
   * IMPROVED: Now detects all 7 built-in functions with smart pattern matching
   */
  detectFunctionCall(userMessage: string): FunctionCall | null {
    const message = userMessage.toLowerCase();

    // 1. WEATHER DETECTION
    if (
      (message.includes('weather') || message.includes('temperature') || message.includes('forecast') ||
       message.includes('hot') || message.includes('cold') || message.includes('rain')) &&
      this.functions.get('weather_openmeteo')?.enabled
    ) {
      const location = this.extractLocation(userMessage);
      return {
        functionId: 'weather_openmeteo',
        functionName: 'Get Weather',
        parameters: { location: location || 'New York' },
        timestamp: new Date(),
      };
    }

    // 2. CURRENCY CONVERSION DETECTION
    const currencyMatch = message.match(/convert\s+(\d+\.?\d*)\s*([a-z]{3})\s+(?:to|in|into)\s+([a-z]{3})/i) ||
                         message.match(/(\d+\.?\d*)\s*([a-z]{3})\s+(?:to|in|into)\s+([a-z]{3})/i) ||
                         message.match(/how\s+much\s+is\s+(\d+\.?\d*)\s*([a-z]{3})\s+in\s+([a-z]{3})/i);
    if (currencyMatch && this.functions.get('currency_conversion')?.enabled) {
      return {
        functionId: 'currency_conversion',
        functionName: 'Convert Currency',
        parameters: {
          amount: parseFloat(currencyMatch[1]),
          from: currencyMatch[2].toUpperCase(),
          to: currencyMatch[3].toUpperCase(),
        },
        timestamp: new Date(),
      };
    }

    // 3. COUNTRY INFO DETECTION
    const countryPatterns = [
      /(?:tell me about|info(?:rmation)? about|details? (?:on|about|for))\s+([a-z\s]+?)(?:\?|$)/i,
      /(?:what|where) is\s+([a-z\s]+?)(?:\?|$)/i,
      /(?:capital|population|language) of\s+([a-z\s]+?)(?:\?|$)/i,
    ];
    for (const pattern of countryPatterns) {
      const countryMatch = message.match(pattern);
      if (countryMatch && this.functions.get('country_info')?.enabled) {
        const potentialCountry = countryMatch[1].trim();
        // Common countries to detect
        const countries = ['france', 'japan', 'brazil', 'germany', 'canada', 'mexico', 'italy', 'spain', 'australia', 'india', 'china', 'usa', 'uk', 'russia'];
        if (countries.some(c => potentialCountry.includes(c))) {
          return {
            functionId: 'country_info',
            functionName: 'Get Country Information',
            parameters: { country: potentialCountry },
            timestamp: new Date(),
          };
        }
      }
    }

    // 4. CRYPTO PRICES DETECTION
    const cryptoKeywords = ['bitcoin', 'ethereum', 'btc', 'eth', 'crypto', 'cryptocurrency', 'cardano', 'ada', 'dogecoin', 'doge'];
    if (
      (cryptoKeywords.some(k => message.includes(k)) &&
       (message.includes('price') || message.includes('cost') || message.includes('worth') || message.includes('value'))) &&
      this.functions.get('crypto_prices')?.enabled
    ) {
      // Extract coin names
      const coins = cryptoKeywords.filter(k => message.includes(k)).join(',');
      return {
        functionId: 'crypto_prices',
        functionName: 'Get Cryptocurrency Prices',
        parameters: { coins: coins || 'bitcoin,ethereum', currency: 'usd' },
        timestamp: new Date(),
      };
    }

    // 5. JOKE DETECTION
    if (
      (message.includes('joke') || message.includes('funny') || message.includes('humor') ||
       message.includes('laugh') || message.includes('make me laugh')) &&
      this.functions.get('random_joke')?.enabled
    ) {
      const category = message.includes('programming') ? 'Programming' : 'Any';
      return {
        functionId: 'random_joke',
        functionName: 'Get Random Joke',
        parameters: { category, type: 'single' },
        timestamp: new Date(),
      };
    }

    // 6. HACKER NEWS DETECTION
    if (
      ((message.includes('hacker news') || message.includes('hn')) ||
       (message.includes('tech') && (message.includes('news') || message.includes('stories')))) &&
      this.functions.get('hacker_news')?.enabled
    ) {
      const limit = this.extractNumber(message) || 10;
      return {
        functionId: 'hacker_news',
        functionName: 'Get Hacker News Stories',
        parameters: { limit, type: 'top' },
        timestamp: new Date(),
      };
    }

    // 7. REDDIT NEWS DETECTION
    const redditMatch = message.match(/(?:reddit|r\/|subreddit)\s*([a-z]+)/i);
    if (
      (message.includes('reddit') || redditMatch ||
       (message.includes('news') && !message.includes('hacker'))) &&
      this.functions.get('reddit_news')?.enabled
    ) {
      const subreddit = redditMatch ? redditMatch[1] : 'worldnews';
      const limit = this.extractNumber(message) || 10;
      return {
        functionId: 'reddit_news',
        functionName: 'Get Reddit News',
        parameters: { subreddit, limit },
        timestamp: new Date(),
      };
    }

    // 8. WIKIPEDIA SEARCH DETECTION
    if (
      ((message.includes('wikipedia') || message.includes('wiki')) ||
       (message.includes('search') && message.includes('article')) ||
       message.includes('what is') || message.includes('who is') || message.includes('tell me about')) &&
      this.functions.get('wikipedia_search')?.enabled
    ) {
      // Extract query after common patterns
      const patterns = [
        /(?:wikipedia|wiki|search)\s+(?:for\s+)?(.+?)(?:\?|$)/i,
        /(?:what|who)\s+is\s+(.+?)(?:\?|$)/i,
        /tell me about\s+(.+?)(?:\?|$)/i,
      ];
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
          return {
            functionId: 'wikipedia_search',
            functionName: 'Search Wikipedia',
            parameters: { query: match[1].trim(), limit: 3 },
            timestamp: new Date(),
          };
        }
      }
    }

    // 9. IP GEOLOCATION DETECTION
    if (
      (message.includes('my location') || message.includes('my ip') ||
       message.includes('where am i') || message.includes('geolocation') ||
       message.includes('ip address')) &&
      this.functions.get('ip_geolocation')?.enabled
    ) {
      // Try to extract IP address if provided
      const ipMatch = message.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
      return {
        functionId: 'ip_geolocation',
        functionName: 'Get IP Geolocation',
        parameters: { ip: ipMatch ? ipMatch[1] : '' },
        timestamp: new Date(),
      };
    }

    // 10. GITHUB REPO DETECTION
    const githubMatch = message.match(/github\.com\/([a-z0-9_-]+\/[a-z0-9_-]+)/i) ||
                        message.match(/(?:repo|repository)\s+([a-z0-9_-]+\/[a-z0-9_-]+)/i);
    if (
      ((message.includes('github') && (message.includes('repo') || message.includes('repository'))) ||
       githubMatch) &&
      this.functions.get('github_repo')?.enabled
    ) {
      const repo = githubMatch ? githubMatch[1] : null;
      if (repo) {
        return {
          functionId: 'github_repo',
          functionName: 'Get GitHub Repository Info',
          parameters: { repo },
          timestamp: new Date(),
        };
      }
    }

    // 11. WORD DEFINITION DETECTION
    if (
      ((message.includes('define') || message.includes('definition') ||
        message.includes('what does') || message.includes('meaning of')) &&
       !message.includes('function')) &&
      this.functions.get('word_definition')?.enabled
    ) {
      const patterns = [
        /define\s+(?:the\s+word\s+)?(.+?)(?:\?|$)/i,
        /definition\s+of\s+(.+?)(?:\?|$)/i,
        /what\s+does\s+(.+?)\s+mean/i,
        /meaning\s+of\s+(.+?)(?:\?|$)/i,
      ];
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
          const word = match[1].trim().replace(/['"]/g, '');
          return {
            functionId: 'word_definition',
            functionName: 'Get Word Definition',
            parameters: { word },
            timestamp: new Date(),
          };
        }
      }
    }

    return null;
  }

  /**
   * Extract a number from message (for limits)
   */
  private extractNumber(message: string): number | null {
    const match = message.match(/\b(\d+)\b/);
    return match ? parseInt(match[1]) : null;
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
