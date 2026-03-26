const { loadQuotes, getRandomQuote, addQuote } = require('./loader');
const { formatQuote, formatList, STYLES } = require('./formatter');
const { loadConfig, setConfig, getConfig } = require('./config');

module.exports = {
  loadQuotes,
  getRandomQuote,
  addQuote,
  formatQuote,
  formatList,
  STYLES,
  loadConfig,
  setConfig,
  getConfig,
};
