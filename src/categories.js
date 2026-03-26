const CATEGORIES = {
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

/**
 * Filters quotes by category
 * @param {Array} quotes - Array of quote objects with 'category' property
 * @param {string|null|undefined} category - Category to filter by
 * @returns {Array} Filtered quotes, or all quotes if category is null/undefined
 * @throws {Error} If category is invalid
 */
function filterByCategory(quotes, category) {
  if (category === null || category === undefined) {
    return quotes;
  }

  if (!isValidCategory(category)) {
    throw new Error(`Invalid category: "${category}". Valid categories are: ${getCategories().join(', ')}`);
  }

  return quotes.filter(quote => quote.category === category);
}

/**
 * Returns array of valid category names
 * @returns {Array} Array of category names
 */
function getCategories() {
  return Object.keys(CATEGORIES);
}

/**
 * Validates if a category string is valid
 * @param {string} category - Category name to validate
 * @returns {boolean} True if category is valid
 */
function isValidCategory(category) {
  return CATEGORIES.hasOwnProperty(category);
}

/**
 * Returns a random quote from the specified category
 * @param {Array} quotes - Array of quote objects with 'category' property
 * @param {string} category - Category to select from
 * @returns {Object} A random quote object from the category
 * @throws {Error} If category is invalid or no quotes found in category
 */
function getRandomByCategory(quotes, category) {
  if (!isValidCategory(category)) {
    throw new Error(`Invalid category: "${category}". Valid categories are: ${getCategories().join(', ')}`);
  }

  const filtered = filterByCategory(quotes, category);

  if (filtered.length === 0) {
    throw new Error(`No quotes found for category: "${category}"`);
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Groups quotes by category
 * @param {Array} quotes - Array of quote objects with 'category' property
 * @returns {Object} Object with category keys and arrays of quotes as values
 */
function groupByCategory(quotes) {
  const grouped = {};

  // Initialize all categories with empty arrays
  getCategories().forEach(category => {
    grouped[category] = [];
  });

  // Group quotes by category
  quotes.forEach(quote => {
    if (isValidCategory(quote.category)) {
      grouped[quote.category].push(quote);
    }
  });

  return grouped;
}

module.exports = {
  CATEGORIES,
  filterByCategory,
  getCategories,
  getRandomByCategory,
  groupByCategory
};
