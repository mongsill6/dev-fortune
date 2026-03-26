import chalk from 'chalk';
import boxen from 'boxen';

export const STYLES = {
  default: 'default',
  box: 'box',
  minimal: 'minimal',
};

function formatDefault(quote) {
  const text = chalk.cyan(`"${quote.quote}"`);
  const author = chalk.gray(`— ${quote.by}`);
  return `\n  ${text}\n  ${' '.repeat(Math.max(0, quote.quote.length - 2))}${author}\n`;
}

function formatBox(quote) {
  const text = chalk.cyan(`"${quote.quote}"`);
  const author = chalk.gray(`— ${quote.by}`);
  const content = `${text}\n\n${author}`;
  return '\n' + boxen(content, {
    padding: 1,
    margin: { left: 2 },
    borderStyle: 'round',
    borderColor: 'cyan',
  }) + '\n';
}

function formatMinimal(quote) {
  return `${quote.quote} — ${quote.by}`;
}

export function formatQuote(quote, style) {
  switch (style) {
    case STYLES.box:
      return formatBox(quote);
    case STYLES.minimal:
      return formatMinimal(quote);
    case STYLES.default:
    default:
      return formatDefault(quote);
  }
}

export function formatList(quotes, style) {
  return quotes.map((q, i) => {
    if (style === STYLES.minimal) {
      return `${i + 1}. ${q.quote} — ${q.by}`;
    }
    const text = chalk.cyan(`"${q.quote}"`);
    const author = chalk.gray(`— ${q.by}`);
    return `  ${text}\n    ${author}`;
  }).join('\n\n');
}
