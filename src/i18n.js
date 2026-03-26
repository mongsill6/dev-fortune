import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SUPPORTED_LOCALES = {
  en: { name: 'English', file: 'quotes-en.json' },
  ko: { name: '한국어', file: 'quotes-ko.json' },
  ja: { name: '日本語', file: 'quotes-ja.json' }
};

export function detectLocale() {
  const localeEnv = process.env.LANG ||
                    process.env.LC_ALL ||
                    process.env.LANGUAGE ||
                    process.env.LC_MESSAGES ||
                    '';
  const localeMatch = localeEnv.match(/^([a-z]{2})/i);
  const detectedLocale = localeMatch ? localeMatch[1].toLowerCase() : 'en';
  return SUPPORTED_LOCALES[detectedLocale] ? detectedLocale : 'en';
}

export function getQuotesFile(locale) {
  const filename = SUPPORTED_LOCALES[locale]?.file || SUPPORTED_LOCALES.en.file;
  return path.join(__dirname, '..', 'data', filename);
}

export function loadLocaleQuotes(locale) {
  const filePath = getQuotesFile(locale);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

export function getSupportedLocales() {
  return Object.keys(SUPPORTED_LOCALES);
}

export function isSupported(locale) {
  return SUPPORTED_LOCALES.hasOwnProperty(locale);
}
