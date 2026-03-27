import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { CATEGORIES, filterByCategory, getCategories } from '../../src/categories.js';

const router = Router();

const SUPPORTED_LANGS = ['en', 'ko', 'ja'];

/**
 * Load quotes for the requested language from the data directory.
 * Falls back to English when the requested language file is unavailable.
 *
 * @param {string} lang
 * @returns {Array<{quote: string, by: string, category: string}>}
 */
function loadLangQuotes(lang) {
  const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
  const filePath = path.join(process.cwd(), 'data', `quotes-${safeLang}.json`);
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Attach a numeric id (0-based index) to every quote in an array.
 *
 * @param {Array<object>} quotes
 * @returns {Array<object>}
 */
function withIds(quotes) {
  return quotes.map((q, i) => ({ id: i, ...q }));
}

// ---------------------------------------------------------------------------
// GET /api/random
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/random:
 *   get:
 *     summary: Get a random quote
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [debugging, architecture, teamwork, motivation, humor]
 *         description: Filter by category
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, ko, ja]
 *           default: en
 *         description: Language of the quotes
 *     responses:
 *       200:
 *         description: A random quote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/random', (req, res) => {
  const lang = req.query.lang ?? 'en';
  const category = req.query.category;

  let quotes;
  try {
    quotes = loadLangQuotes(lang);
  } catch {
    return res.status(500).json({ error: 'Failed to load quotes' });
  }

  if (category) {
    if (!getCategories().includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        validCategories: getCategories(),
      });
    }
    quotes = filterByCategory(quotes, category);
    if (quotes.length === 0) {
      return res.status(404).json({ error: `No quotes found for category: ${category}` });
    }
  }

  const idx = Math.floor(Math.random() * quotes.length);
  const quote = withIds(quotes)[idx];
  res.json(quote);
});

// ---------------------------------------------------------------------------
// GET /api/quotes
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: Get all quotes (paginated)
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [debugging, architecture, teamwork, motivation, humor]
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, ko, ja]
 *           default: en
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of quotes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuoteList'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/quotes', (req, res) => {
  const lang = req.query.lang ?? 'en';
  const category = req.query.category;
  const page = Math.max(1, parseInt(req.query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit ?? '20', 10) || 20));

  let quotes;
  try {
    quotes = loadLangQuotes(lang);
  } catch {
    return res.status(500).json({ error: 'Failed to load quotes' });
  }

  if (category) {
    if (!getCategories().includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        validCategories: getCategories(),
      });
    }
    quotes = filterByCategory(quotes, category);
  }

  const total = quotes.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const slice = withIds(quotes).slice(start, start + limit);

  res.json({
    data: slice,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

// ---------------------------------------------------------------------------
// GET /api/quotes/:id
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/quotes/{id}:
 *   get:
 *     summary: Get a quote by index
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Zero-based index of the quote
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, ko, ja]
 *           default: en
 *     responses:
 *       200:
 *         description: The requested quote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id) || id < 0) {
    return res.status(400).json({ error: 'id must be a non-negative integer' });
  }

  const lang = req.query.lang ?? 'en';

  let quotes;
  try {
    quotes = loadLangQuotes(lang);
  } catch {
    return res.status(500).json({ error: 'Failed to load quotes' });
  }

  if (id >= quotes.length) {
    return res.status(404).json({
      error: `Quote not found. Valid range: 0–${quotes.length - 1}`,
    });
  }

  res.json({ id, ...quotes[id] });
});

// ---------------------------------------------------------------------------
// GET /api/categories
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Array of category objects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/categories', (_req, res) => {
  const data = Object.entries(CATEGORIES).map(([key, info]) => ({
    id: key,
    ...info,
  }));
  res.json({ data });
});

// ---------------------------------------------------------------------------
// GET /api/search
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search quotes by text or author
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (matched against quote text and author name)
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *           enum: [en, ko, ja]
 *           default: en
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [debugging, architecture, teamwork, motivation, humor]
 *     responses:
 *       200:
 *         description: Matching quotes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quote'
 *                 total:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/search', (req, res) => {
  const q = (req.query.q ?? '').trim();
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const lang = req.query.lang ?? 'en';
  const category = req.query.category;

  let quotes;
  try {
    quotes = loadLangQuotes(lang);
  } catch {
    return res.status(500).json({ error: 'Failed to load quotes' });
  }

  if (category) {
    if (!getCategories().includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        validCategories: getCategories(),
      });
    }
    quotes = filterByCategory(quotes, category);
  }

  const lower = q.toLowerCase();
  const results = withIds(quotes).filter(
    (quote) =>
      quote.quote.toLowerCase().includes(lower) ||
      quote.by.toLowerCase().includes(lower),
  );

  res.json({ data: results, total: results.length });
});

// ---------------------------------------------------------------------------
// POST /api/quotes
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/quotes:
 *   post:
 *     summary: Add a new quote
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewQuote'
 *     responses:
 *       201:
 *         description: Quote created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/quotes', (req, res) => {
  const { quote, by, category } = req.body ?? {};

  const missing = ['quote', 'by', 'category'].filter((f) => !req.body?.[f]);
  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missing,
    });
  }

  if (typeof quote !== 'string' || quote.trim() === '') {
    return res.status(400).json({ error: '"quote" must be a non-empty string' });
  }
  if (typeof by !== 'string' || by.trim() === '') {
    return res.status(400).json({ error: '"by" must be a non-empty string' });
  }
  if (!getCategories().includes(category)) {
    return res.status(400).json({
      error: 'Invalid category',
      validCategories: getCategories(),
    });
  }

  const lang = 'en'; // new quotes are always appended to the English dataset
  const filePath = path.join(process.cwd(), 'data', `quotes-${lang}.json`);

  let quotes;
  try {
    quotes = loadLangQuotes(lang);
  } catch {
    return res.status(500).json({ error: 'Failed to load quotes' });
  }

  const newQuote = { quote: quote.trim(), by: by.trim(), category };
  quotes.push(newQuote);

  try {
    fs.writeFileSync(filePath, JSON.stringify(quotes, null, 2) + '\n');
  } catch {
    return res.status(500).json({ error: 'Failed to persist quote' });
  }

  const id = quotes.length - 1;
  res.status(201).json({ id, ...newQuote });
});

export default router;
