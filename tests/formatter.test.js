import { formatQuote, formatList, STYLES } from '../src/formatter.js';

describe('STYLES', () => {
  test('STYLES object has default, box, and minimal keys', () => {
    expect(STYLES).toHaveProperty('default', 'default');
    expect(STYLES).toHaveProperty('box', 'box');
    expect(STYLES).toHaveProperty('minimal', 'minimal');
  });
});

describe('formatQuote', () => {
  const sampleQuote = {
    quote: 'First, solve the problem. Then, write the code.',
    by: 'John Johnson',
  };

  test("formatQuote with 'minimal' returns plain text \"quote — author\"", () => {
    const result = formatQuote(sampleQuote, STYLES.minimal);
    expect(result).toBe(`${sampleQuote.quote} — ${sampleQuote.by}`);
  });

  test("formatQuote with 'default' returns string containing quote text", () => {
    const result = formatQuote(sampleQuote, STYLES.default);
    expect(result).toContain(sampleQuote.quote);
  });

  test("formatQuote with 'default' returns string containing author", () => {
    const result = formatQuote(sampleQuote, STYLES.default);
    expect(result).toContain(sampleQuote.by);
  });

  test("formatQuote with 'box' returns string containing quote text", () => {
    const result = formatQuote(sampleQuote, STYLES.box);
    expect(result).toContain(sampleQuote.quote);
  });

  test('formatQuote with undefined style uses default format', () => {
    const result = formatQuote(sampleQuote, undefined);
    expect(result).toContain(sampleQuote.quote);
    expect(result).toContain(sampleQuote.by);
  });
});

describe('formatList', () => {
  const quotes = [
    { quote: 'Talk is cheap. Show me the code.', by: 'Linus Torvalds' },
    { quote: 'Any fool can write code that a computer can understand.', by: 'Martin Fowler' },
    { quote: 'Make it work, make it right, make it fast.', by: 'Kent Beck' },
  ];

  test("formatList with 'minimal' returns numbered list", () => {
    const result = formatList(quotes, STYLES.minimal);
    expect(result).toContain('1.');
    expect(result).toContain(quotes[0].quote);
    expect(result).toContain(quotes[0].by);
  });

  test("formatList with 'minimal' for multiple quotes has correct numbering", () => {
    const result = formatList(quotes, STYLES.minimal);
    expect(result).toContain('1.');
    expect(result).toContain('2.');
    expect(result).toContain('3.');
  });

  test("formatList with 'default' style formats with chalk", () => {
    const result = formatList(quotes, STYLES.default);
    quotes.forEach((q) => {
      expect(result).toContain(q.quote);
      expect(result).toContain(q.by);
    });
  });
});
