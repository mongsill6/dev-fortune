export const CATEGORIES = {
  debugging: {
    name: 'Debugging',
    emoji: '🐛',
    description: 'Quotes about debugging, troubleshooting, and finding bugs'
  },
  architecture: {
    name: 'Architecture',
    emoji: '🏗️',
    description: 'Quotes about system design, architecture, and structure'
  },
  teamwork: {
    name: 'Teamwork',
    emoji: '🤝',
    description: 'Quotes about collaboration, communication, and team dynamics'
  },
  motivation: {
    name: 'Motivation',
    emoji: '🔥',
    description: 'Quotes about perseverance, growth, and inspiration'
  },
  humor: {
    name: 'Humor',
    emoji: '😄',
    description: 'Funny quotes and witty observations about programming'
  }
};

export function getCategories() {
  return Object.keys(CATEGORIES);
}

export function isValidCategory(category) {
  return CATEGORIES.hasOwnProperty(category);
}

export function filterByCategory(quotes, category) {
  if (category === null || category === undefined) {
    return quotes;
  }
  if (!isValidCategory(category)) {
    throw new Error(`Invalid category: "${category}". Valid categories are: ${getCategories().join(', ')}`);
  }
  return quotes.filter(quote => quote.category === category);
}

export function getRandomByCategory(quotes, category) {
  if (!isValidCategory(category)) {
    throw new Error(`Invalid category: "${category}". Valid categories are: ${getCategories().join(', ')}`);
  }
  const filtered = filterByCategory(quotes, category);
  if (filtered.length === 0) {
    throw new Error(`No quotes found for category: "${category}"`);
  }
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function groupByCategory(quotes) {
  const grouped = {};
  getCategories().forEach(category => {
    grouped[category] = [];
  });
  quotes.forEach(quote => {
    if (isValidCategory(quote.category)) {
      grouped[quote.category].push(quote);
    }
  });
  return grouped;
}
