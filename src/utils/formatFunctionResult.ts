/**
 * Format function results for better display in chat
 * Makes function outputs human-readable and visually appealing
 *
 * @author Dr. Ernesto Lee
 */

export function formatFunctionResult(functionName: string, result: any): string {
  // Weather formatting
  if (functionName === 'Get Weather' || functionName.includes('Weather')) {
    return `### ☀️ Weather in ${result.location}
- **Temperature**: ${result.temperature}°F (feels like ${result.feelsLike}°F)
- **Humidity**: ${result.humidity}%
- **Wind Speed**: ${result.windSpeed} mph
- **Precipitation**: ${result.precipitation} mm
- **Timezone**: ${result.timezone}`;
  }

  // Currency conversion
  if (functionName === 'Convert Currency' || functionName.includes('Currency')) {
    return `### 💱 Currency Conversion
**${result.amount} ${result.from}** = **${result.convertedAmount.toFixed(2)} ${result.to}**

Exchange rate: 1 ${result.from} = ${result.rate.toFixed(4)} ${result.to}
As of: ${result.date}`;
  }

  // Country info
  if (functionName === 'Get Country Information' || functionName.includes('Country')) {
    return `### 🌍 ${result.name} ${result.flag}
- **Official Name**: ${result.officialName}
- **Capital**: ${result.capital}
- **Population**: ${result.population.toLocaleString()}
- **Region**: ${result.region} (${result.subregion})
- **Languages**: ${result.languages}
- **Currencies**: ${result.currencies}
- **Timezone**: ${result.timezone}`;
  }

  // Crypto prices
  if (functionName === 'Get Cryptocurrency Prices' || functionName.includes('Crypto')) {
    const items = Array.isArray(result) ? result : [result];
    let output = '### ₿ Cryptocurrency Prices\n\n';
    items.forEach(crypto => {
      const change = parseFloat(crypto.change24h);
      const changeEmoji = change >= 0 ? '📈' : '📉';
      const changeColor = change >= 0 ? '+' : '';
      output += `**${crypto.coin}**: $${crypto.price.toLocaleString()} ${crypto.currency.toUpperCase()}  \n`;
      output += `24h Change: ${changeEmoji} ${changeColor}${change}%  \n`;
      output += `Market Cap: $${(crypto.marketCap / 1e9).toFixed(2)}B\n\n`;
    });
    return output.trim();
  }

  // Jokes
  if (functionName === 'Get Random Joke' || functionName.includes('Joke')) {
    if (result.type === 'single') {
      return `### 😄 ${result.category} Joke\n\n${result.joke}`;
    } else {
      return `### 😄 ${result.category} Joke\n\n**${result.setup}**\n\n${result.delivery}`;
    }
  }

  // Hacker News
  if (functionName === 'Get Hacker News Stories' || functionName.includes('Hacker News')) {
    const stories = Array.isArray(result) ? result : [result];
    let output = '### 📰 Hacker News - Top Stories\n\n';
    stories.forEach((story, i) => {
      output += `**${i + 1}. [${story.title}](${story.url})**  \n`;
      output += `↑ ${story.score} points | 💬 ${story.comments} comments | by ${story.author}  \n`;
      output += `${story.time}\n\n`;
    });
    return output.trim();
  }

  // Reddit
  if (functionName === 'Get Reddit News' || functionName.includes('Reddit')) {
    const posts = Array.isArray(result) ? result : [result];
    let output = `### 📱 r/${posts[0]?.subreddit || 'Reddit'}\n\n`;
    posts.forEach((post, i) => {
      output += `**${i + 1}. [${post.title}](${post.url})**  \n`;
      output += `↑ ${post.score} | 💬 ${post.comments} comments | u/${post.author}  \n`;
      output += `${post.created}\n\n`;
    });
    return output.trim();
  }

  // Wikipedia
  if (functionName === 'Search Wikipedia' || functionName.includes('Wikipedia')) {
    const results = Array.isArray(result) ? result : [result];
    let output = '### 📚 Wikipedia Search Results\n\n';
    results.forEach((item, i) => {
      output += `**${i + 1}. [${item.title}](${item.url})**  \n`;
      output += `${item.description}\n\n`;
    });
    return output.trim();
  }

  // IP Geolocation
  if (functionName === 'Get IP Geolocation' || functionName.includes('Geolocation')) {
    return `### 🌐 Location Information
- **IP Address**: ${result.ip}
- **Location**: ${result.city}, ${result.region}, ${result.country} (${result.countryCode})
- **Postal Code**: ${result.postal}
- **Coordinates**: ${result.latitude}, ${result.longitude}
- **Timezone**: ${result.timezone}
- **Currency**: ${result.currency}
- **ISP**: ${result.org}`;
  }

  // GitHub Repo
  if (functionName === 'Get GitHub Repository Info' || functionName.includes('GitHub')) {
    return `### 🐙 ${result.fullName}
${result.description}

**Stats**:
- ⭐ ${result.stars.toLocaleString()} stars
- 🔀 ${result.forks.toLocaleString()} forks
- 👀 ${result.watchers.toLocaleString()} watchers
- 🐛 ${result.openIssues.toLocaleString()} open issues

**Details**:
- Language: ${result.language}
- License: ${result.license}
- Created: ${result.createdAt}
- Last Updated: ${result.updatedAt}

[View on GitHub](${result.url})`;
  }

  // Word Definition
  if (functionName === 'Get Word Definition' || functionName.includes('Definition')) {
    let output = `### 📖 ${result.word}`;
    if (result.phonetic) {
      output += ` _${result.phonetic}_`;
    }
    output += '\n\n';

    result.meanings.forEach((meaning: any, i: number) => {
      output += `**${i + 1}. ${meaning.partOfSpeech}**  \n`;
      output += `${meaning.definition}  \n`;
      if (meaning.example) {
        output += `_Example: "${meaning.example}"_  \n`;
      }
      output += '\n';
    });

    if (result.sourceUrl) {
      output += `[More details](${result.sourceUrl})`;
    }

    return output.trim();
  }

  // Fallback: JSON formatting for unknown function types
  return `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
}
