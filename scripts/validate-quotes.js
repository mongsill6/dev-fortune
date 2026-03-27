#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(text, color = 'reset') {
  console.log(colorize(text, color));
}

function logError(text) {
  console.log(colorize(`✗ ${text}`, 'red'));
}

function logWarning(text) {
  console.log(colorize(`⚠ ${text}`, 'yellow'));
}

function logSuccess(text) {
  console.log(colorize(`✓ ${text}`, 'green'));
}

class ValidationReport {
  constructor() {
    this.files = new Map();
    this.totalQuotes = 0;
    this.totalErrors = 0;
    this.totalWarnings = 0;
    this.allQuoteTexts = new Map(); // For duplicate detection
  }

  addFile(filename) {
    if (!this.files.has(filename)) {
      this.files.set(filename, {
        errors: [],
        warnings: [],
        quoteCount: 0,
      });
    }
    return this.files.get(filename);
  }

  addError(filename, error) {
    const file = this.addFile(filename);
    file.errors.push(error);
    this.totalErrors++;
  }

  addWarning(filename, warning) {
    const file = this.addFile(filename);
    file.warnings.push(warning);
    this.totalWarnings++;
  }

  setQuoteCount(filename, count) {
    const file = this.addFile(filename);
    file.quoteCount = count;
    this.totalQuotes += count;
  }

  trackQuoteText(filename, quoteText, author) {
    const key = `${quoteText}|||${author}`;
    if (this.allQuoteTexts.has(key)) {
      const originalFile = this.allQuoteTexts.get(key);
      this.addWarning(filename, `Duplicate quote: "${quoteText.substring(0, 50)}..." by ${author} (also in ${originalFile})`);
    } else {
      this.allQuoteTexts.set(key, filename);
    }
  }

  print() {
    log('\n' + '='.repeat(70), 'cyan');
    log('QUOTE VALIDATION REPORT', 'bright');
    log('='.repeat(70), 'cyan');

    for (const [filename, data] of this.files) {
      log(`\n${filename}:`, 'blue');
      log(`  Quotes: ${data.quoteCount}`, 'dim');

      if (data.errors.length > 0) {
        log(`  ${colorize('Errors:', 'red')} ${data.errors.length}`, 'reset');
        data.errors.forEach((err) => {
          logError(`    ${err}`);
        });
      } else if (data.warnings.length === 0) {
        logSuccess(`  All quotes valid`);
      }

      if (data.warnings.length > 0) {
        log(`  ${colorize('Warnings:', 'yellow')} ${data.warnings.length}`, 'reset');
        data.warnings.forEach((warn) => {
          logWarning(`    ${warn}`);
        });
      }
    }

    log('\n' + '='.repeat(70), 'cyan');
    log('SUMMARY', 'bright');
    log('='.repeat(70), 'cyan');
    log(`Total quotes validated: ${this.totalQuotes}`, 'dim');
    log(
      `Total errors: ${colorize(this.totalErrors.toString(), 'red')}`,
      'reset'
    );
    log(
      `Total warnings: ${colorize(this.totalWarnings.toString(), 'yellow')}`,
      'reset'
    );

    if (this.totalErrors === 0 && this.totalWarnings === 0) {
      logSuccess('All validations passed!');
    } else if (this.totalErrors === 0) {
      log(`${this.totalWarnings} warning(s) found.`, 'yellow');
    } else {
      logError(`${this.totalErrors} error(s) found.`);
    }
    log('='.repeat(70), 'cyan');
  }

  hasErrors() {
    return this.totalErrors > 0;
  }
}

function validateQuote(quote, index, filename, report) {
  // Check if quote is an object
  if (typeof quote !== 'object' || quote === null || Array.isArray(quote)) {
    report.addError(
      filename,
      `Quote at index ${index}: expected object, got ${typeof quote}`
    );
    return false;
  }

  let isValid = true;

  // Check required fields
  if (!('quote' in quote)) {
    report.addError(filename, `Quote at index ${index}: missing required field "quote"`);
    isValid = false;
  }

  if (!('by' in quote)) {
    report.addError(filename, `Quote at index ${index}: missing required field "by"`);
    isValid = false;
  }

  // If either field is missing, we can't validate further
  if (!isValid) {
    return false;
  }

  const quoteText = quote.quote;
  const author = quote.by;

  // Check field types
  if (typeof quoteText !== 'string') {
    report.addError(
      filename,
      `Quote at index ${index}: "quote" field must be a string, got ${typeof quoteText}`
    );
    isValid = false;
  }

  if (typeof author !== 'string') {
    report.addError(
      filename,
      `Quote at index ${index}: "by" field must be a string, got ${typeof author}`
    );
    isValid = false;
  }

  if (!isValid) {
    return false;
  }

  // Check for empty strings
  if (quoteText.trim() === '') {
    report.addError(filename, `Quote at index ${index}: "quote" cannot be empty`);
    isValid = false;
  }

  if (author.trim() === '') {
    report.addError(filename, `Quote at index ${index}: "by" cannot be empty`);
    isValid = false;
  }

  // Check length constraints
  if (quoteText.length > 500) {
    report.addWarning(
      filename,
      `Quote at index ${index}: quote exceeds 500 chars (${quoteText.length} chars) - "${quoteText.substring(0, 50)}..."`
    );
  }

  if (author.length > 100) {
    report.addWarning(
      filename,
      `Quote at index ${index}: author name exceeds 100 chars (${author.length} chars)`
    );
  }

  // Track for duplicate detection
  if (isValid) {
    report.trackQuoteText(filename, quoteText, author);
  }

  return isValid;
}

function validateFile(filePath, report) {
  const relativePath = path.relative(projectRoot, filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    let data;
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      report.addError(relativePath, `Invalid JSON: ${parseError.message}`);
      return;
    }

    // Check if it's an array
    if (!Array.isArray(data)) {
      report.addError(relativePath, `Expected JSON array at root level, got ${typeof data}`);
      return;
    }

    if (data.length === 0) {
      report.addWarning(relativePath, 'File contains empty array');
    }

    report.setQuoteCount(relativePath, data.length);

    // Validate each quote
    data.forEach((quote, index) => {
      validateQuote(quote, index, relativePath, report);
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      report.addError(relativePath, `File not found`);
    } else {
      report.addError(relativePath, `Error reading file: ${error.message}`);
    }
  }
}

function main() {
  const report = new ValidationReport();

  // Validate main quotes.json
  const mainQuotesPath = path.join(projectRoot, 'quotes.json');
  validateFile(mainQuotesPath, report);

  // Validate quotes in data/ directory
  const dataDir = path.join(projectRoot, 'data');
  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir);
    const quoteFiles = files.filter((f) => f.startsWith('quotes-') && f.endsWith('.json'));

    quoteFiles.forEach((file) => {
      const filePath = path.join(dataDir, file);
      validateFile(filePath, report);
    });
  } else {
    report.addWarning('data', 'Directory "data/" does not exist');
  }

  // Print report
  report.print();

  // Exit with appropriate code
  process.exit(report.hasErrors() ? 1 : 0);
}

main();
