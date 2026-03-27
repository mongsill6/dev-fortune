const BASE_URL = '/api';

/**
 * Fetch a random quote
 * @param {string} lang - Language code (e.g., 'en', 'ko')
 * @param {string} category - Quote category
 * @returns {Promise<Object>} Random quote object
 */
export async function fetchRandom(lang, category) {
  try {
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (category) params.append('category', category);

    const url = `${BASE_URL}/random${params.toString() ? '?' + params : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch random quote: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching random quote:', error);
    throw error;
  }
}

/**
 * Fetch paginated quotes
 * @param {string} lang - Language code
 * @param {string} category - Quote category
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of quotes per page
 * @returns {Promise<Object>} Paginated quotes response
 */
export async function fetchQuotes(lang, category, page = 1, limit = 10) {
  try {
    const params = new URLSearchParams();
    if (lang) params.append('lang', lang);
    if (category) params.append('category', category);
    params.append('page', page);
    params.append('limit', limit);

    const url = `${BASE_URL}/quotes?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch quotes: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
}

/**
 * Fetch all available categories
 * @returns {Promise<Object>} Categories response
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${BASE_URL}/categories`);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Search quotes
 * @param {string} query - Search query string
 * @param {string} lang - Language code
 * @param {string} category - Quote category
 * @returns {Promise<Object>} Search results
 */
export async function searchQuotes(query, lang, category) {
  try {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (lang) params.append('lang', lang);
    if (category) params.append('category', category);

    const url = `${BASE_URL}/search?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to search quotes: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching quotes:', error);
    throw error;
  }
}
