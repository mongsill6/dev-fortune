#!/usr/bin/env node

const { program } = require('commander');
const { loadQuotes, getRandomQuote, addQuote } = require('./loader');
const { formatQuote, formatList } = require('./formatter');
const { loadConfig, setConfig } = require('./config');
const pkg = require('../package.json');

program
  .name('dev-fortune')
  .description('Developer fortune cookies - inspirational quotes for your terminal')
  .version(pkg.version);

program
  .command('show', { isDefault: true })
  .description('Show a random developer quote')
  .option('-s, --style <style>', 'Output style: default, box, minimal')
  .option('-f, --file <path>', 'Custom quotes file (JSON or YAML)')
  .action((opts) => {
    const config = loadConfig();
    const style = opts.style || config.style || 'default';
    const quotes = loadQuotes(opts.file || config.quotesFile);
    const quote = getRandomQuote(quotes);
    console.log(formatQuote(quote, style));
  });

program
  .command('list')
  .description('List all quotes')
  .option('-s, --style <style>', 'Output style: default, minimal')
  .option('-f, --file <path>', 'Custom quotes file')
  .action((opts) => {
    const config = loadConfig();
    const style = opts.style || config.style || 'default';
    const quotes = loadQuotes(opts.file || config.quotesFile);
    console.log('\n' + formatList(quotes, style) + '\n');
  });

program
  .command('add <quote>')
  .description('Add a new quote')
  .option('-b, --by <author>', 'Quote author', 'Anonymous')
  .option('-f, --file <path>', 'Target quotes file')
  .action((quote, opts) => {
    const count = addQuote(opts.file, quote, opts.by);
    console.log(`Added quote #${count}: "${quote}" — ${opts.by}`);
  });

program
  .command('config')
  .description('View or set configuration')
  .option('--style <style>', 'Set default style')
  .option('--quotes-file <path>', 'Set default quotes file')
  .option('--reset', 'Reset to defaults')
  .action((opts) => {
    if (opts.reset) {
      const { DEFAULTS, saveConfig } = require('./config');
      saveConfig({ ...DEFAULTS });
      console.log('Config reset to defaults.');
      return;
    }
    if (opts.style) setConfig('style', opts.style);
    if (opts.quotesFile) setConfig('quotesFile', opts.quotesFile);

    const config = loadConfig();
    console.log('\nCurrent config:');
    console.log(JSON.stringify(config, null, 2));
  });

program.parse();
