import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILTIN_QUOTES_PATH = path.join(__dirname, '..', 'quotes.json');

function loadJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function loadYamlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

export function loadQuotesFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') {
    return loadJsonFile(filePath);
  } else if (ext === '.yml' || ext === '.yaml') {
    return loadYamlFile(filePath);
  }
  throw new Error(`Unsupported file format: ${ext}. Use .json or .yaml/.yml`);
}

export function loadQuotes(customPath) {
  if (customPath) {
    const resolved = path.resolve(customPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Quote file not found: ${resolved}`);
    }
    return loadQuotesFromFile(resolved);
  }
  return loadJsonFile(BUILTIN_QUOTES_PATH);
}

export function getRandomQuote(quotes) {
  const idx = Math.floor(Math.random() * quotes.length);
  return quotes[idx];
}

export function addQuote(filePath, quote, author) {
  const resolved = filePath ? path.resolve(filePath) : BUILTIN_QUOTES_PATH;
  const quotes = loadQuotesFromFile(resolved);
  quotes.push({ quote, by: author || 'Anonymous' });

  const ext = path.extname(resolved).toLowerCase();
  if (ext === '.json') {
    fs.writeFileSync(resolved, JSON.stringify(quotes, null, 2) + '\n');
  } else {
    fs.writeFileSync(resolved, yaml.dump(quotes));
  }
  return quotes.length;
}
