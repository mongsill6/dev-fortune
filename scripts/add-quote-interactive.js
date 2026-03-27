#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

const QUOTE_FILES = {
  en: '/tmp/dev-fortune/quotes.json',
  ko: '/tmp/dev-fortune/data/quotes-ko.json',
  ja: '/tmp/dev-fortune/data/quotes-ja.json',
  main: '/tmp/dev-fortune/quotes.json'
};

const CATEGORIES = [
  'architecture',
  'debugging',
  'motivation',
  'teamwork',
  'humor',
  'performance',
  'other'
];

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function print(text, color = 'reset') {
  console.log(`${COLORS[color]}${text}${COLORS.reset}`);
}

function printBold(text) {
  console.log(`${COLORS.bright}${text}${COLORS.reset}`);
}

function printError(text) {
  console.log(`${COLORS.red}✗ ${text}${COLORS.reset}`);
}

function printSuccess(text) {
  console.log(`${COLORS.green}✓ ${text}${COLORS.reset}`);
}

function printPreview(quote, author, category) {
  console.log();
  printBold(`${COLORS.cyan}═══ PREVIEW ═══${COLORS.reset}`);
  print(`Quote:    "${quote}"`);
  print(`Author:   ${author}`);
  print(`Category: ${category || 'none'}`);
  printBold(`${COLORS.cyan}════════════════${COLORS.reset}`);
  console.log();
}

async function readLine(rl, prompt) {
  output.write(`${COLORS.blue}${prompt}${COLORS.reset}`);
  return rl.question('');
}

async function promptQuote(rl) {
  while (true) {
    const quote = await readLine(rl, '💬 Quote text: ');

    if (!quote.trim()) {
      printError('Quote cannot be empty');
      continue;
    }

    if (quote.length > 500) {
      printError(`Quote is too long (${quote.length}/500 chars)`);
      continue;
    }

    return quote.trim();
  }
}

async function promptAuthor(rl) {
  while (true) {
    const author = await readLine(rl, '👤 Author name: ');

    if (!author.trim()) {
      printError('Author cannot be empty');
      continue;
    }

    return author.trim();
  }
}

async function promptLanguage(rl) {
  print('🌐 Select language:', 'cyan');
  print('  1) English (main)', 'dim');
  print('  2) 한국어 (Korean)', 'dim');
  print('  3) 日本語 (Japanese)', 'dim');

  while (true) {
    const choice = await readLine(rl, 'Choice (1-3): ');

    if (choice === '1') return 'en';
    if (choice === '2') return 'ko';
    if (choice === '3') return 'ja';

    printError('Invalid choice. Please select 1, 2, or 3');
  }
}

async function promptCategory(rl) {
  print('📁 Select category (optional, press Enter to skip):', 'cyan');
  CATEGORIES.forEach((cat, i) => {
    print(`  ${i + 1}) ${cat}`, 'dim');
  });

  while (true) {
    const choice = await readLine(rl, 'Choice (1-7 or Enter): ');

    if (!choice.trim()) {
      return null;
    }

    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < CATEGORIES.length) {
      return CATEGORIES[idx];
    }

    printError('Invalid choice. Please select 1-7 or press Enter');
  }
}

async function promptConfirm(rl, message) {
  while (true) {
    const answer = await readLine(rl, `${message} (y/n): `);

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      return true;
    }
    if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
      return false;
    }

    printError('Please enter y or n');
  }
}

function loadQuotes(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      print(`Creating new file: ${filePath}`, 'yellow');
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    printError(`Failed to load quotes: ${error.message}`);
    return [];
  }
}

function checkDuplicate(quotes, quote) {
  return quotes.some(q => q.quote.toLowerCase() === quote.toLowerCase());
}

function saveQuotes(filePath, quotes) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(quotes, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    printError(`Failed to save quotes: ${error.message}`);
    return false;
  }
}

async function main() {
  const rl = createInterface({ input, output, terminal: true });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    print('\n👋 Cancelled. No changes made.', 'yellow');
    rl.close();
    process.exit(0);
  });

  try {
    printBold(`\n${COLORS.cyan}═══════════════════════════════════════${COLORS.reset}`);
    printBold(`${COLORS.cyan}  📖 Dev Fortune - Interactive Quote Adder${COLORS.reset}`);
    printBold(`${COLORS.cyan}═══════════════════════════════════════${COLORS.reset}\n`);

    // Gather input
    const quote = await promptQuote(rl);
    const author = await promptAuthor(rl);
    const language = await promptLanguage(rl);
    const category = await promptCategory(rl);

    // Validate
    const filePath = QUOTE_FILES[language];
    const quotes = loadQuotes(filePath);

    if (checkDuplicate(quotes, quote)) {
      printError(`This quote already exists in ${language}`);
      rl.close();
      process.exit(1);
    }

    // Show preview
    printPreview(quote, author, category);

    // Confirm
    const confirmed = await promptConfirm(rl, 'Add this quote?');

    if (!confirmed) {
      print('Cancelled. No changes made.', 'yellow');
      rl.close();
      process.exit(0);
    }

    // Add quote
    const newQuote = { quote, by: author };
    if (category) {
      newQuote.category = category;
    }
    quotes.push(newQuote);

    // Save
    if (saveQuotes(filePath, quotes)) {
      printSuccess(`Quote added to ${language} (total: ${quotes.length})`);
      print(`File: ${filePath}`, 'dim');
      console.log();
    } else {
      process.exit(1);
    }
  } catch (error) {
    if (error.code !== 'ERR_USE_AFTER_CLOSE') {
      printError(`Unexpected error: ${error.message}`);
    }
  } finally {
    rl.close();
  }
}

main();
