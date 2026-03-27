import { createRequire } from 'module';
import { program } from 'commander';
import chalk from 'chalk';
import { loadQuotes, getRandomQuote, addQuote } from './loader.js';
import { formatQuote, formatList } from './formatter.js';
import { loadConfig, setConfig, saveConfig, DEFAULTS } from './config.js';
import { filterByCategory, getCategories, CATEGORIES } from './categories.js';
import { detectLocale, loadLocaleQuotes, getSupportedLocales, isSupported } from './i18n.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

function resolveQuotes(opts) {
  const config = loadConfig();
  if (opts.file) {
    return loadQuotes(opts.file);
  }
  const lang = opts.lang || config.language || detectLocale();
  if (isSupported(lang)) {
    return loadLocaleQuotes(lang);
  }
  return loadQuotes(config.quotesFile);
}

program
  .name('dev-fortune')
  .description('Developer fortune cookies - inspirational quotes for your terminal')
  .version(pkg.version);

// random (default command)
program
  .command('random', { isDefault: true })
  .description('Show a random developer quote')
  .option('-s, --style <style>', 'Output style: default, box, minimal')
  .option('-c, --category <category>', 'Filter by category')
  .option('-l, --lang <locale>', 'Language: en, ko, ja')
  .option('-f, --file <path>', 'Custom quotes file (JSON or YAML)')
  .action((opts) => {
    const config = loadConfig();
    const style = opts.style || config.style || 'default';
    let quotes = resolveQuotes(opts);
    if (opts.category) {
      quotes = filterByCategory(quotes, opts.category);
    }
    if (quotes.length === 0) {
      console.error(chalk.red('No quotes found matching your criteria.'));
      process.exit(1);
    }
    const quote = getRandomQuote(quotes);
    console.log(formatQuote(quote, style));
  });

// list
program
  .command('list')
  .description('List all quotes')
  .option('-s, --style <style>', 'Output style: default, minimal')
  .option('-c, --category <category>', 'Filter by category')
  .option('-l, --lang <locale>', 'Language: en, ko, ja')
  .option('-f, --file <path>', 'Custom quotes file')
  .action((opts) => {
    const config = loadConfig();
    const style = opts.style || config.style || 'default';
    let quotes = resolveQuotes(opts);
    if (opts.category) {
      quotes = filterByCategory(quotes, opts.category);
    }
    console.log('\n' + formatList(quotes, style) + '\n');
  });

// add
program
  .command('add <quote>')
  .description('Add a new quote')
  .option('-b, --by <author>', 'Quote author', 'Anonymous')
  .option('-c, --category <category>', 'Quote category')
  .option('-f, --file <path>', 'Target quotes file')
  .action((quote, opts) => {
    const count = addQuote(opts.file, quote, opts.by);
    console.log(chalk.green(`✓ Added quote #${count}: "${quote}" — ${opts.by}`));
  });

// search
program
  .command('search <keyword>')
  .description('Search quotes by keyword')
  .option('-l, --lang <locale>', 'Language: en, ko, ja')
  .option('-f, --file <path>', 'Custom quotes file')
  .action((keyword, opts) => {
    const quotes = resolveQuotes(opts);
    const lower = keyword.toLowerCase();
    const results = quotes.filter(q =>
      q.quote.toLowerCase().includes(lower) ||
      q.by.toLowerCase().includes(lower) ||
      (q.category && q.category.toLowerCase().includes(lower))
    );
    if (results.length === 0) {
      console.log(chalk.yellow(`No quotes found matching "${keyword}".`));
      return;
    }
    console.log(chalk.green(`\n Found ${results.length} quote(s) matching "${keyword}":\n`));
    console.log(formatList(results, 'default') + '\n');
  });

// config
program
  .command('config')
  .description('View or set configuration')
  .option('--style <style>', 'Set default style (default, box, minimal)')
  .option('--lang <locale>', 'Set default language (en, ko, ja)')
  .option('--quotes-file <path>', 'Set default quotes file')
  .option('--reset', 'Reset to defaults')
  .action((opts) => {
    if (opts.reset) {
      saveConfig({ ...DEFAULTS });
      console.log(chalk.green('Config reset to defaults.'));
      return;
    }
    if (opts.style) setConfig('style', opts.style);
    if (opts.lang) setConfig('language', opts.lang);
    if (opts.quotesFile) setConfig('quotesFile', opts.quotesFile);

    const config = loadConfig();
    console.log(chalk.cyan('\nCurrent config:'));
    Object.entries(config).forEach(([key, value]) => {
      console.log(`  ${chalk.gray(key)}: ${value ?? chalk.dim('(auto)')}`);
    });
    console.log();
  });

// categories
program
  .command('categories')
  .description('List available quote categories')
  .action(() => {
    console.log(chalk.cyan('\nAvailable categories:\n'));
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      console.log(`  ${cat.emoji}  ${chalk.bold(key)} — ${chalk.gray(cat.description)}`);
    });
    console.log();
  });

// languages
program
  .command('languages')
  .description('List supported languages')
  .action(() => {
    const current = detectLocale();
    console.log(chalk.cyan('\nSupported languages:\n'));
    getSupportedLocales().forEach(locale => {
      const marker = locale === current ? chalk.green(' (detected)') : '';
      console.log(`  ${chalk.bold(locale)} — ${chalk.gray(getSupportedLocales().includes(locale) ? locale : '')}${marker}`);
    });
    console.log();
  });

// tui (interactive mode)
program
  .command('tui')
  .description('Launch interactive TUI mode')
  .action(async () => {
    const { fileURLToPath } = await import('url');
    const pathMod = await import('path');
    const { execSync: exec } = await import('child_process');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = pathMod.dirname(__filename);
    const tuiEntry = pathMod.join(__dirname, 'tui', 'index.js');
    exec(`node ${tuiEntry}`, { stdio: 'inherit' });
  });

program.parse();
