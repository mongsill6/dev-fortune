import fs from 'fs';
import path from 'path';
import os from 'os';

export const CONFIG_DIR = path.join(os.homedir(), '.dev-fortune');
export const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

export const DEFAULTS = {
  style: 'default',
  quotesFile: null,
  language: null,
};

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_PATH)) {
    return { ...DEFAULTS };
  }
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    return { ...DEFAULTS, ...JSON.parse(content) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

export function getConfig(key) {
  const config = loadConfig();
  return key ? config[key] : config;
}

export function setConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
  return config;
}
