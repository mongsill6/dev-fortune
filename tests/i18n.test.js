import {
  SUPPORTED_LOCALES,
  detectLocale,
  getQuotesFile,
  loadLocaleQuotes,
  getSupportedLocales,
  isSupported,
} from '../src/i18n.js';

describe('SUPPORTED_LOCALES', () => {
  test('has en, ko, ja keys', () => {
    expect(SUPPORTED_LOCALES).toHaveProperty('en');
    expect(SUPPORTED_LOCALES).toHaveProperty('ko');
    expect(SUPPORTED_LOCALES).toHaveProperty('ja');
  });

  test('each locale entry has name and file properties', () => {
    for (const key of ['en', 'ko', 'ja']) {
      expect(SUPPORTED_LOCALES[key]).toHaveProperty('name');
      expect(SUPPORTED_LOCALES[key]).toHaveProperty('file');
    }
  });
});

describe('getSupportedLocales()', () => {
  test('returns [en, ko, ja]', () => {
    expect(getSupportedLocales()).toEqual(['en', 'ko', 'ja']);
  });
});

describe('isSupported()', () => {
  test('returns true for en', () => {
    expect(isSupported('en')).toBe(true);
  });

  test('returns false for fr', () => {
    expect(isSupported('fr')).toBe(false);
  });
});

describe('detectLocale()', () => {
  let originalLang;

  beforeEach(() => {
    originalLang = process.env.LANG;
  });

  afterEach(() => {
    if (originalLang === undefined) {
      delete process.env.LANG;
    } else {
      process.env.LANG = originalLang;
    }
  });

  test('returns en when LANG is not set', () => {
    delete process.env.LANG;
    expect(detectLocale()).toBe('en');
  });

  test('returns en when LANG is set to an unsupported locale', () => {
    process.env.LANG = 'fr_FR.UTF-8';
    expect(detectLocale()).toBe('en');
  });

  test('returns ko when LANG is set to ko_KR.UTF-8', () => {
    process.env.LANG = 'ko_KR.UTF-8';
    expect(detectLocale()).toBe('ko');
  });
});

describe('getQuotesFile()', () => {
  test('returns path ending with quotes-en.json for en', () => {
    expect(getQuotesFile('en')).toMatch(/quotes-en\.json$/);
  });

  test('returns path ending with quotes-ko.json for ko', () => {
    expect(getQuotesFile('ko')).toMatch(/quotes-ko\.json$/);
  });
});

describe('loadLocaleQuotes()', () => {
  test('loadLocaleQuotes(en) returns an array of quotes', async () => {
    const quotes = await loadLocaleQuotes('en');
    expect(Array.isArray(quotes)).toBe(true);
    expect(quotes.length).toBeGreaterThan(0);
  });

  test('loadLocaleQuotes(ko) returns an array of quotes', async () => {
    const quotes = await loadLocaleQuotes('ko');
    expect(Array.isArray(quotes)).toBe(true);
    expect(quotes.length).toBeGreaterThan(0);
  });

  test('each loaded quote has quote and by properties', async () => {
    const quotes = await loadLocaleQuotes('en');
    for (const item of quotes) {
      expect(item).toHaveProperty('quote');
      expect(item).toHaveProperty('by');
    }
  });
});
