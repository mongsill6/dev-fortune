const fs = require('fs');
const path = require('path');

/**
 * Supported locales configuration
 */
const SUPPORTED_LOCALES = {
  en: {
    name: 'English',
    file: 'quotes-en.json'
  },
  ko: {
    name: '한국어',
    file: 'quotes-ko.json'
  },
  ja: {
    name: '日本語',
    file: 'quotes-ja.json'
  }
};

/**
 * Auto-detect user locale from environment variables
 * Checks: LANG, LC_ALL, LANGUAGE, LC_MESSAGES
 * Returns 2-letter locale code (en, ko, ja)
 * Falls back to 'en' if unsupported
 *
 * @returns {string} Locale code (e.g., 'en', 'ko', 'ja')
 */
function detectLocale() {
  const localeEnv = process.env.LANG ||
                    process.env.LC_ALL ||
                    process.env.LANGUAGE ||
                    process.env.LC_MESSAGES ||
                    '';

  // Extract the first 2 characters (e.g., 'ko' from 'ko_KR.UTF-8')
  const localeMatch = localeEnv.match(/^([a-z]{2})/i);
  const detectedLocale = localeMatch ? localeMatch[1].toLowerCase() : 'en';

  // Return detected locale if supported, otherwise fallback to 'en'
  return SUPPORTED_LOCALES[detectedLocale] ? detectedLocale : 'en';
}

/**
 * Get the absolute path to the quotes file for a given locale
 * Files are located in data/ directory relative to project root
 *
 * @param {string} locale - Locale code (e.g., 'en', 'ko', 'ja')
 * @returns {string} Absolute path to the quotes JSON file
 */
function getQuotesFile(locale) {
  const filename = SUPPORTED_LOCALES[locale]?.file || SUPPORTED_LOCALES.en.file;
  return path.join(__dirname, '..', 'data', filename);
}

/**
 * Load and parse quotes for a given locale
 * Reads the JSON file synchronously and returns the quotes array
 *
 * @param {string} locale - Locale code (e.g., 'en', 'ko', 'ja')
 * @returns {Array} Array of quote objects
 * @throws {Error} If file cannot be read or JSON is invalid
 */
function loadLocaleQuotes(locale) {
  const filePath = getQuotesFile(locale);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

/**
 * Get array of all supported locale codes
 *
 * @returns {Array} Array of locale codes (e.g., ['en', 'ko', 'ja'])
 */
function getSupportedLocales() {
  return Object.keys(SUPPORTED_LOCALES);
}

/**
 * Check if a locale is supported
 *
 * @param {string} locale - Locale code to check
 * @returns {boolean} True if locale is supported, false otherwise
 */
function isSupported(locale) {
  return SUPPORTED_LOCALES.hasOwnProperty(locale);
}

module.exports = {
  SUPPORTED_LOCALES,
  detectLocale,
  getQuotesFile,
  loadLocaleQuotes,
  getSupportedLocales,
  isSupported
};
