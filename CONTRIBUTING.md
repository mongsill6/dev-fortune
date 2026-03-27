# Contributing to dev-fortune

Thank you for your interest in contributing to dev-fortune! We welcome contributions of all kinds: new quotes, bug fixes, features, documentation improvements, and more. This guide will help you get started.

## Welcome

dev-fortune is a community-driven project. Whether you're adding inspirational quotes for developers, fixing bugs, improving the codebase, or enhancing documentation, your contributions help make this tool better for everyone.

## Table of Contents

- [Adding Quotes](#adding-quotes)
- [Contributing Code](#contributing-code)
- [Development Setup](#development-setup)
- [Running Tests](#running-tests)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Multilingual Contributions](#multilingual-contributions)

## Adding Quotes

### Quote Format

All quotes are stored in JSON files under the `data/` directory:
- `data/quotes-en.json` (English)
- `data/quotes-ko.json` (Korean)
- `data/quotes-ja.json` (Japanese)

Each quote must follow this format:

```json
{
  "quote": "Your quote here",
  "by": "Author Name",
  "category": "optional-category"
}
```

### Quote Guidelines

Please follow these rules when adding quotes:

1. **Length**: Maximum 200 characters (keeps terminal output clean)
2. **Attribution**: Always include the author name. Use "Unknown" only if truly unattributable
3. **Uniqueness**: Check for duplicates before submitting (search by quote text)
4. **Accuracy**: Verify the quote is correct and properly attributed
5. **Content**: Keep quotes relevant to programming, development, debugging, learning, or professional growth
6. **Avoid**: Marketing slogans, product ads, or non-developer-relevant content
7. **Formatting**: Quote should be a complete sentence or meaningful phrase. No leading/trailing whitespace

### Categories

Optional but recommended. Valid categories include:
- `debugging`
- `design`
- `testing`
- `refactoring`
- `learning`
- `collaboration`
- `performance`
- `documentation`
- `code-quality`
- `time-management`
- `motivation`

### How to Add Quotes

**Option 1: Direct Edit (Recommended for simple additions)**

1. Fork the repository
2. Create a new branch: `git checkout -b add/quotes-author-name`
3. Edit the appropriate JSON file in `data/`
4. Run validation: `node scripts/validate-quotes.js data/quotes-en.json`
5. Commit and push
6. Open a Pull Request

**Example Addition to `data/quotes-en.json`:**

```json
{
  "quote": "Simple things should be simple, complex things should be possible.",
  "by": "Alan Kay",
  "category": "design"
}
```

**Option 2: GitHub Issue**

Open an issue with the template "Quote Suggestion" and provide:
- The quote (exact text)
- Author name
- Source (where you found it, for verification)
- Category (optional)
- Language

### Quote Validation

Before submitting, your quotes will be validated for:
- Valid JSON syntax
- Required fields (`quote`, `by`)
- Quote length ≤ 200 characters
- Author name not empty
- No obvious duplicates
- Proper formatting

Run validation locally:
```bash
node scripts/validate-quotes.js data/quotes-en.json
node scripts/validate-quotes.js data/quotes-ko.json
node scripts/validate-quotes.js data/quotes-ja.json
```

## Contributing Code

### Fork & Branch

1. Fork the repository: https://github.com/mongsill6/dev-fortune/fork
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dev-fortune.git
   cd dev-fortune
   ```
3. Create a feature branch with a descriptive name:
   ```bash
   git checkout -b feature/add-yaml-support
   git checkout -b fix/cli-lang-option-bug
   git checkout -b docs/improve-readme
   ```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring (no behavior change)
- `test/` - Test additions or improvements

### One Feature Per PR

Keep each pull request focused:
- ✅ One feature, one bug fix, or one documentation update per PR
- ❌ Don't mix multiple features in one PR
- ❌ Don't combine unrelated fixes

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- Git

### Install Dependencies

```bash
npm install
```

### Project Structure

```
dev-fortune/
├── bin/                    # Executable entry point
├── src/                    # Main source code
│   ├── cli.js             # CLI commands
│   ├── loader.js          # Quote loading logic
│   ├── formatter.js       # Output formatting
│   ├── i18n.js            # Internationalization
│   ├── categories.js      # Category filtering
│   └── config.js          # Configuration management
├── data/                  # Quote JSON files
│   ├── quotes-en.json     # English quotes
│   ├── quotes-ko.json     # Korean quotes
│   └── quotes-ja.json     # Japanese quotes
├── tests/                 # Jest test files
├── scripts/               # Utility scripts
└── package.json           # Project metadata
```

### Available Commands

```bash
# Run the CLI directly
npm start

# Run the CLI via the executable
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test:coverage

# Run TUI (Text User Interface)
npm run tui
```

## Running Tests

### Test Suite

The project uses Jest with ESM support. Tests are in the `tests/` directory:
- `cli.test.js` - CLI command tests
- `loader.test.js` - Quote loading tests
- `formatter.test.js` - Output formatting tests
- `i18n.test.js` - Internationalization tests
- `categories.test.js` - Category filtering tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
node --experimental-vm-modules node_modules/.bin/jest --watch

# Run specific test file
node --experimental-vm-modules node_modules/.bin/jest tests/cli.test.js

# Run with coverage report
npm test:coverage
```

### Test Requirements for PRs

- **All tests must pass** before PR approval
- **New features must include tests** (test-driven development preferred)
- **Bug fixes should include a failing test** that your fix makes pass
- Aim for reasonable code coverage (no strict minimum, but higher is better)

### Writing Tests

Test file template:

```javascript
import { describe, test, expect } from '@jest/globals';
import { yourFunction } from '../src/your-module.js';

describe('yourFunction', () => {
  test('should do something specific', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected output');
  });

  test('should handle edge cases', () => {
    expect(() => yourFunction(null)).toThrow();
  });
});
```

## Pull Request Process

### Before Opening a PR

1. **Pull latest changes** from upstream:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Test everything**:
   ```bash
   npm test
   ```

3. **Validate quotes** (if adding/modifying quotes):
   ```bash
   node scripts/validate-quotes.js data/quotes-en.json
   ```

4. **Check code style**:
   - No trailing whitespace
   - Consistent indentation (2 spaces)
   - No semicolons (matches existing code)

### Creating a PR

1. **Push your branch**:
   ```bash
   git push origin your-branch-name
   ```

2. **Open a Pull Request** on GitHub

3. **Fill in the PR template** with:
   - **Title**: Clear, descriptive, under 70 characters
     - ✅ `Add quote validation script`
     - ✅ `Fix language detection on non-POSIX systems`
     - ❌ `Fix stuff`
     - ❌ `Add quote` (too vague)

   - **Description**: Include:
     - What problem does this solve?
     - How does it solve it?
     - Testing instructions (if not obvious)
     - Any breaking changes
     - Fixes #123 (if related to an issue)

### PR Requirements

Your PR will be reviewed if it meets these criteria:

- ✅ Clear, descriptive title and description
- ✅ All tests pass (`npm test`)
- ✅ No linting errors
- ✅ One feature/fix per PR
- ✅ Follows code style guidelines
- ✅ Includes tests for new features or bug fixes
- ✅ Updated documentation if needed
- ✅ Quotes validated if modified

### PR Review

Maintainers will:
- Review code quality and approach
- Test locally
- Check for edge cases
- Request changes if needed

Be patient—reviews may take a few days.

## Code Style

### ESM Module Syntax

dev-fortune uses ES Modules exclusively:

```javascript
// ✅ Use import/export
import { loadQuotes } from './loader.js';
export function getRandomQuote(quotes) { ... }

// ❌ Don't use CommonJS
const { loadQuotes } = require('./loader.js');
module.exports = { getRandomQuote };
```

### No Semicolons

The codebase follows a no-semicolons style (matching existing code):

```javascript
// ✅ Preferred
function loadQuotes(file) {
  return JSON.parse(readFileSync(file, 'utf-8'))
}

// ❌ Avoid
function loadQuotes(file) {
  return JSON.parse(readFileSync(file, 'utf-8'));
};
```

### General Style Rules

- **Indentation**: 2 spaces (no tabs)
- **Line length**: Keep under 100 characters when reasonable
- **Variables**: Use descriptive names (`quotes` not `q`, `authorName` not `a`)
- **Functions**: Prefer pure functions where possible
- **Error handling**: Use try-catch for JSON parsing and file operations
- **Comments**: Use sparingly; code should be self-documenting
- **Quotes**: Use single quotes for strings (matches existing code)

### Code Organization

```javascript
// ✅ Good organization
import { parseJSON } from './utils.js'

const DEFAULT_STYLE = 'default'

function loadQuotes(file) {
  // Implementation
}

function getRandomQuote(quotes) {
  // Implementation
}

export { loadQuotes, getRandomQuote }
```

## Issue Guidelines

### Reporting Bugs

Use the "Bug Report" issue template. Include:

1. **Title**: Clear, specific bug description
   - ✅ `CLI crashes with --lang ja option`
   - ❌ `It doesn't work`

2. **Environment**: Your OS, Node version, npm version

3. **Steps to Reproduce**:
   ```
   1. Run `npm start`
   2. Execute `dev-fortune --category nonexistent`
   3. Observe the error
   ```

4. **Expected Behavior**: What should happen

5. **Actual Behavior**: What actually happens (error message, output, etc.)

6. **Reproducible Example**: Minimal code or commands to reproduce

### Requesting Features

Use the "Feature Request" issue template. Include:

1. **Title**: Clear description of the feature
   - ✅ `Add support for custom quote file path`
   - ❌ `Cool idea`

2. **Motivation**: Why would this feature be useful?

3. **Proposed Solution**: How should it work?

4. **Alternatives**: Any other approaches you've considered

5. **Examples**: Mockups, code examples, or usage scenarios

### Good Issue Practices

- ✅ Search for similar issues first (might be a duplicate)
- ✅ Be specific and provide context
- ✅ One issue per problem/feature
- ✅ Use code blocks for error messages and output
- ✅ Include relevant system information

## Multilingual Contributions

dev-fortune supports multiple languages. Here's how to contribute quotes in different languages:

### Supported Languages

- **English** (`en`) - `data/quotes-en.json`
- **Korean** (`ko`) - `data/quotes-ko.json`
- **Japanese** (`ja`) - `data/quotes-ja.json`

### Contributing Translated Quotes

1. **Match English quotes**: Translate existing English quotes to maintain parity
2. **Add translations to the appropriate file**
3. **Maintain parallel structure**: Each language file should have approximately the same quotes
4. **Validate the JSON**: Run `node scripts/validate-quotes.js data/quotes-ko.json`

### Adding a New Language

To add support for a new language:

1. Create a new file: `data/quotes-LANG.json`
2. Copy the structure from `data/quotes-en.json`
3. Translate all quotes and authors
4. Update `src/i18n.js` to include the new locale
5. Update tests to cover the new language
6. Open a PR with changes to:
   - New quote file
   - `src/i18n.js`
   - Tests
   - README.md (language list)

### Translation Guidelines

- **Equivalence**: Translate meaning, not just words (adapt to language/culture)
- **Author names**: Keep original author names in English
- **Length**: Try to keep similar length to English version (≤ 200 chars)
- **Accuracy**: Use authoritative translation sources for famous quotes
- **Native speakers**: If possible, have native speakers review translations

### Example: Adding Korean Quote

```json
{
  "quote": "코드를 먼저 올바르게 작성하세요. 그 다음 빠르게 만드세요.",
  "by": "Robert C. Martin",
  "category": "code-quality"
}
```

## Getting Help

- **Questions?** Open a discussion or issue
- **Need guidance?** Comment on an issue or PR
- **Found a security issue?** Don't open a public issue; email the maintainer privately

## Code of Conduct

- Be respectful and inclusive
- Welcome diverse perspectives
- Focus on the work, not personal criticism
- Help others learn and grow

## Recognition

Contributors are recognized in:
- GitHub's contributor graph
- Release notes (for significant contributions)
- README.md (for major milestones)

Thank you for contributing! 🚀
