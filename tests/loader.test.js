import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  loadQuotesFromFile,
  loadQuotes,
  getRandomQuote,
  addQuote,
} from '../src/loader.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempJson(data) {
  const file = path.join(os.tmpdir(), `loader-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  return file;
}

function makeTempYaml(content) {
  const file = path.join(os.tmpdir(), `loader-test-${Date.now()}-${Math.random().toString(36).slice(2)}.yaml`);
  fs.writeFileSync(file, content);
  return file;
}

// ---------------------------------------------------------------------------
// loadQuotes() — builtin file
// ---------------------------------------------------------------------------

describe('loadQuotes() with no arguments (builtin quotes)', () => {
  test('loads builtin quotes successfully without throwing', () => {
    expect(() => loadQuotes()).not.toThrow();
  });

  test('returns an array', () => {
    const quotes = loadQuotes();
    expect(Array.isArray(quotes)).toBe(true);
  });

  test('array is non-empty', () => {
    const quotes = loadQuotes();
    expect(quotes.length).toBeGreaterThan(0);
  });

  test('each quote has a "quote" string property', () => {
    const quotes = loadQuotes();
    for (const item of quotes) {
      expect(typeof item.quote).toBe('string');
      expect(item.quote.length).toBeGreaterThan(0);
    }
  });

  test('each quote has a "by" string property', () => {
    const quotes = loadQuotes();
    for (const item of quotes) {
      expect(typeof item.by).toBe('string');
      expect(item.by.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// loadQuotes() — custom path
// ---------------------------------------------------------------------------

describe('loadQuotes() with a custom path', () => {
  test('loads quotes from a valid custom JSON file', () => {
    const data = [{ quote: 'Custom quote', by: 'Tester' }];
    const file = makeTempJson(data);
    try {
      const quotes = loadQuotes(file);
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes[0].quote).toBe('Custom quote');
    } finally {
      fs.unlinkSync(file);
    }
  });

  test('throws when custom path does not exist', () => {
    const nonExistent = path.join(os.tmpdir(), 'this-file-does-not-exist-ever.json');
    expect(() => loadQuotes(nonExistent)).toThrow(/not found/i);
  });
});

// ---------------------------------------------------------------------------
// loadQuotesFromFile()
// ---------------------------------------------------------------------------

describe('loadQuotesFromFile()', () => {
  test('loads a valid JSON file and returns its parsed content', () => {
    const data = [
      { quote: 'Hello JSON', by: 'Jest' },
      { quote: 'Goodbye JSON', by: 'Jest' },
    ];
    const file = makeTempJson(data);
    try {
      const result = loadQuotesFromFile(file);
      expect(result).toEqual(data);
    } finally {
      fs.unlinkSync(file);
    }
  });

  test('loads a valid YAML file and returns its parsed content', () => {
    const yamlContent = `- quote: Hello YAML\n  by: Jest\n- quote: Goodbye YAML\n  by: Jest\n`;
    const file = makeTempYaml(yamlContent);
    try {
      const result = loadQuotesFromFile(file);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].quote).toBe('Hello YAML');
      expect(result[1].by).toBe('Jest');
    } finally {
      fs.unlinkSync(file);
    }
  });

  test('throws on unsupported extension (.txt)', () => {
    const file = path.join(os.tmpdir(), `loader-test-${Date.now()}.txt`);
    fs.writeFileSync(file, 'some text');
    try {
      expect(() => loadQuotesFromFile(file)).toThrow(/unsupported file format/i);
    } finally {
      fs.unlinkSync(file);
    }
  });

  test('throws on unsupported extension (.csv)', () => {
    const file = path.join(os.tmpdir(), `loader-test-${Date.now()}.csv`);
    fs.writeFileSync(file, 'quote,by\nHello,World');
    try {
      expect(() => loadQuotesFromFile(file)).toThrow(/unsupported file format/i);
    } finally {
      fs.unlinkSync(file);
    }
  });
});

// ---------------------------------------------------------------------------
// getRandomQuote()
// ---------------------------------------------------------------------------

describe('getRandomQuote()', () => {
  const sampleQuotes = [
    { quote: 'Alpha', by: 'A' },
    { quote: 'Beta', by: 'B' },
    { quote: 'Gamma', by: 'C' },
  ];

  test('returns a defined value (not undefined / null)', () => {
    const result = getRandomQuote(sampleQuotes);
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
  });

  test('returns an item that belongs to the given array', () => {
    const result = getRandomQuote(sampleQuotes);
    expect(sampleQuotes).toContainEqual(result);
  });

  test('returned item has "quote" and "by" properties', () => {
    const result = getRandomQuote(sampleQuotes);
    expect(typeof result.quote).toBe('string');
    expect(typeof result.by).toBe('string');
  });

  test('returns a quote from a single-element array (always that element)', () => {
    const single = [{ quote: 'Only one', by: 'Solo' }];
    const result = getRandomQuote(single);
    expect(result).toEqual(single[0]);
  });

  test('eventually returns different items from a multi-element array (statistical)', () => {
    // Run 50 draws; with 3 items the chance of always picking index 0 is (1/3)^50 ≈ 0
    const seen = new Set();
    for (let i = 0; i < 50; i++) {
      seen.add(getRandomQuote(sampleQuotes).quote);
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// addQuote()
// ---------------------------------------------------------------------------

describe('addQuote()', () => {
  test('appends a quote and returns the new array length', () => {
    const initial = [{ quote: 'Old quote', by: 'Someone' }];
    const file = makeTempJson(initial);
    try {
      const newCount = addQuote(file, 'New quote', 'New Author');
      expect(newCount).toBe(2);
    } finally {
      fs.unlinkSync(file);
    }
  });

  test('persists the new quote so reloading the file contains it', () => {
    const initial = [{ quote: 'Original', by: 'Origin' }];
    const file = makeTempJson(initial);
    try {
      addQuote(file, 'Persisted quote', 'Persisted Author');
      const reloaded = loadQuotesFromFile(file);
      const found = reloaded.find((q) => q.quote === 'Persisted quote');
      expect(found).toBeDefined();
      expect(found.by).toBe('Persisted Author');
    } finally {
      fs.unlinkSync(file);
    }
  });

  test('defaults author to "Anonymous" when no author is provided', () => {
    const initial = [{ quote: 'Base quote', by: 'Base' }];
    const file = makeTempJson(initial);
    try {
      addQuote(file, 'Anonymous quote');
      const reloaded = loadQuotesFromFile(file);
      const found = reloaded.find((q) => q.quote === 'Anonymous quote');
      expect(found).toBeDefined();
      expect(found.by).toBe('Anonymous');
    } finally {
      fs.unlinkSync(file);
    }
  });

  test('defaults author to "Anonymous" when author is empty string', () => {
    const initial = [{ quote: 'Base', by: 'Base' }];
    const file = makeTempJson(initial);
    try {
      addQuote(file, 'No author quote', '');
      const reloaded = loadQuotesFromFile(file);
      const found = reloaded.find((q) => q.quote === 'No author quote');
      expect(found.by).toBe('Anonymous');
    } finally {
      fs.unlinkSync(file);
    }
  });

  test('multiple sequential addQuote calls increment count correctly', () => {
    const initial = [];
    const file = makeTempJson(initial);
    try {
      const count1 = addQuote(file, 'First', 'A');
      const count2 = addQuote(file, 'Second', 'B');
      const count3 = addQuote(file, 'Third', 'C');
      expect(count1).toBe(1);
      expect(count2).toBe(2);
      expect(count3).toBe(3);
    } finally {
      fs.unlinkSync(file);
    }
  });
});
