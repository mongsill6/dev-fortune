const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.dev-fortune');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

const DEFAULTS = {
  style: 'default',
  quotesFile: null,
};

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadConfig() {
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

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

function getConfig(key) {
  const config = loadConfig();
  return key ? config[key] : config;
}

function setConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
  return config;
}

module.exports = { loadConfig, saveConfig, getConfig, setConfig, CONFIG_DIR, CONFIG_PATH, DEFAULTS };
