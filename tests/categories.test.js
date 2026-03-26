import {
  CATEGORIES,
  getCategories,
  isValidCategory,
  filterByCategory,
  getRandomByCategory,
  groupByCategory,
} from '../src/categories.js';

const testQuotes = [
  { quote: 'Test 1', by: 'A', category: 'debugging' },
  { quote: 'Test 2', by: 'B', category: 'motivation' },
  { quote: 'Test 3', by: 'C', category: 'debugging' },
];

describe('CATEGORIES', () => {
  test('has exactly 5 categories', () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(5);
  });

  test('each category has name, emoji, and description', () => {
    for (const key of Object.keys(CATEGORIES)) {
      const cat = CATEGORIES[key];
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('emoji');
      expect(cat).toHaveProperty('description');
      expect(typeof cat.name).toBe('string');
      expect(typeof cat.emoji).toBe('string');
      expect(typeof cat.description).toBe('string');
    }
  });

  test('contains the expected category keys', () => {
    const keys = Object.keys(CATEGORIES);
    expect(keys).toContain('debugging');
    expect(keys).toContain('architecture');
    expect(keys).toContain('teamwork');
    expect(keys).toContain('motivation');
    expect(keys).toContain('humor');
  });
});

describe('getCategories()', () => {
  test('returns an array of category keys', () => {
    const result = getCategories();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(expect.arrayContaining(['debugging', 'architecture', 'teamwork', 'motivation', 'humor']));
    expect(result).toHaveLength(5);
  });
});

describe('isValidCategory()', () => {
  test('returns true for a valid category', () => {
    expect(isValidCategory('debugging')).toBe(true);
  });

  test('returns true for all valid categories', () => {
    for (const key of Object.keys(CATEGORIES)) {
      expect(isValidCategory(key)).toBe(true);
    }
  });

  test('returns false for a nonexistent category', () => {
    expect(isValidCategory('nonexistent')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isValidCategory('')).toBe(false);
  });
});

describe('filterByCategory()', () => {
  test('returns all quotes when category is null', () => {
    const result = filterByCategory(testQuotes, null);
    expect(result).toHaveLength(testQuotes.length);
    expect(result).toEqual(testQuotes);
  });

  test('returns all quotes when category is undefined', () => {
    const result = filterByCategory(testQuotes, undefined);
    expect(result).toHaveLength(testQuotes.length);
    expect(result).toEqual(testQuotes);
  });

  test('filters correctly by valid category', () => {
    const result = filterByCategory(testQuotes, 'debugging');
    expect(result).toHaveLength(2);
    expect(result.every((q) => q.category === 'debugging')).toBe(true);
  });

  test('returns empty array when no quotes match valid category', () => {
    const result = filterByCategory(testQuotes, 'humor');
    expect(result).toHaveLength(0);
  });

  test('throws when category is invalid', () => {
    expect(() => filterByCategory(testQuotes, 'nonexistent')).toThrow();
  });
});

describe('getRandomByCategory()', () => {
  test('returns a quote from the correct category', () => {
    const result = getRandomByCategory(testQuotes, 'debugging');
    expect(result.category).toBe('debugging');
    expect(testQuotes).toContainEqual(result);
  });

  test('throws when category is invalid', () => {
    expect(() => getRandomByCategory(testQuotes, 'nonexistent')).toThrow();
  });

  test('throws when no quotes exist in the category', () => {
    expect(() => getRandomByCategory(testQuotes, 'humor')).toThrow();
  });
});

describe('groupByCategory()', () => {
  test('groups quotes correctly by category', () => {
    const result = groupByCategory(testQuotes);
    expect(result).toHaveProperty('debugging');
    expect(result).toHaveProperty('motivation');
    expect(result.debugging).toHaveLength(2);
    expect(result.motivation).toHaveLength(1);
    expect(result.debugging.every((q) => q.category === 'debugging')).toBe(true);
    expect(result.motivation[0]).toEqual(testQuotes[1]);
  });

  test('returns all category keys with empty arrays for empty input', () => {
    const result = groupByCategory([]);
    expect(Object.keys(result)).toHaveLength(5);
    Object.values(result).forEach(arr => expect(arr).toHaveLength(0));
  });

  test('categories with no matching quotes have empty arrays', () => {
    const result = groupByCategory(testQuotes);
    expect(result.humor).toEqual([]);
    expect(result.architecture).toEqual([]);
    expect(result.teamwork).toEqual([]);
  });
});
