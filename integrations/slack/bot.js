import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { loadQuotes, getRandomQuote, getCategories, getRandomByCategory } from '../../src/index.js';
import { formatFortuneBlock, formatCategoryList, formatDailyFortune, formatError, formatAppHome } from './blocks.js';

// Load environment variables
dotenv.config();

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Logger utility
const logger = {
  info: (msg, data = {}) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data),
  error: (msg, err = null) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err || ''),
  debug: (msg, data = {}) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`, data);
    }
  },
};

// Global quotes cache
let quotesCache = null;

/**
 * Load quotes from data file with caching
 */
async function getQuotesCache() {
  if (!quotesCache) {
    try {
      const path = process.env.QUOTES_PATH || './data/quotes-en.json';
      quotesCache = loadQuotes(path);
      logger.info(`Loaded ${quotesCache.length} quotes from ${path}`);
    } catch (error) {
      logger.error('Failed to load quotes', error);
      // Fallback to empty array if loading fails
      quotesCache = [];
    }
  }
  return quotesCache;
}

/**
 * Get a random fortune quote
 */
async function getRandomFortune() {
  try {
    const quotes = await getQuotesCache();
    if (quotes.length === 0) {
      throw new Error('No quotes available');
    }
    return getRandomQuote(quotes);
  } catch (error) {
    logger.error('Error getting random fortune', error);
    throw error;
  }
}

/**
 * Get a fortune from a specific category
 */
async function getFortuneByCategory(category) {
  try {
    const quotes = await getQuotesCache();
    if (quotes.length === 0) {
      throw new Error('No quotes available');
    }
    return getRandomByCategory(quotes, category);
  } catch (error) {
    logger.error(`Error getting fortune for category ${category}`, error);
    throw error;
  }
}

// ============================================================
// SLASH COMMANDS
// ============================================================

/**
 * /fortune command - Get a random fortune or from a specific category
 */
app.command('/fortune', async ({ command, ack, respond, body }) => {
  try {
    await ack();
    logger.info('Fortune command received', { text: command.text, userId: body.user_id });

    const text = command.text.trim().toLowerCase();

    // Handle "categories" subcommand
    if (text === 'categories') {
      const categories = getCategories();
      const blocks = formatCategoryList(categories);

      // Add detailed category information
      const categoryBlocks = categories.map(cat => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${cat.charAt(0).toUpperCase() + cat.slice(1)}*\n_Use: /fortune ${cat}_`,
        },
      }));

      await respond({
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📚 Available Categories',
              emoji: true,
            },
          },
          ...categoryBlocks,
        ],
      });
      return;
    }

    // Handle category-specific fortune
    let quote;
    if (text && text.length > 0) {
      try {
        quote = await getFortuneByCategory(text);
      } catch (error) {
        const validCategories = getCategories().join(', ');
        await respond({
          blocks: formatError(`Invalid category "${text}". Valid categories: ${validCategories}`),
        });
        return;
      }
    } else {
      // Get random fortune
      quote = await getRandomFortune();
    }

    // Send the fortune
    const blocks = formatFortuneBlock(quote);
    await respond({ blocks });
    logger.info('Fortune sent successfully', { category: quote.category, userId: body.user_id });
  } catch (error) {
    logger.error('Error handling /fortune command', error);
    await respond({
      blocks: formatError('Failed to fetch fortune. Please try again later.'),
    });
  }
});

// ============================================================
// INTERACTIVE COMPONENTS
// ============================================================

/**
 * Handle "New Fortune" button click
 */
app.action('new_fortune', async ({ ack, respond, body }) => {
  try {
    await ack();
    logger.info('New fortune button clicked', { userId: body.user.id });

    const quote = await getRandomFortune();
    const blocks = formatFortuneBlock(quote);

    await respond({
      blocks,
      replace_original: true,
    });
  } catch (error) {
    logger.error('Error handling new_fortune action', error);
    await respond({
      blocks: formatError('Failed to fetch fortune. Please try again later.'),
      replace_original: true,
    });
  }
});

/**
 * Handle random fortune from app home
 */
app.action('app_home_random_fortune', async ({ ack, body, client }) => {
  try {
    await ack();
    logger.info('App home random fortune clicked', { userId: body.user.id });

    const quote = await getRandomFortune();
    const blocks = formatFortuneBlock(quote);

    await client.views.update({
      user_id: body.user.id,
      view: {
        id: body.view.id,
        type: 'home',
        blocks,
      },
    });
  } catch (error) {
    logger.error('Error handling app_home_random_fortune action', error);
  }
});

/**
 * Handle categories button from app home
 */
app.action('app_home_categories', async ({ ack, body, client }) => {
  try {
    await ack();
    logger.info('App home categories clicked', { userId: body.user.id });

    const categories = getCategories();
    const categoryBlocks = categories.map(cat => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${cat.charAt(0).toUpperCase() + cat.slice(1)}*\n_Use: /fortune ${cat}_`,
      },
    }));

    await client.views.update({
      user_id: body.user.id,
      view: {
        id: body.view.id,
        type: 'home',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📚 Available Categories',
              emoji: true,
            },
          },
          ...categoryBlocks,
        ],
      },
    });
  } catch (error) {
    logger.error('Error handling app_home_categories action', error);
  }
});

// ============================================================
// APP HOME
// ============================================================

/**
 * Update App Home tab with welcome message and featured quote
 */
app.event('app_home_opened', async ({ event, client }) => {
  try {
    logger.info('App home opened', { userId: event.user });

    const quote = await getRandomFortune();
    const blocks = formatAppHome(quote);

    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        blocks,
      },
    });
  } catch (error) {
    logger.error('Error handling app_home_opened event', error);
  }
});

// ============================================================
// SCHEDULED MESSAGES
// ============================================================

/**
 * Schedule daily fortune posting at 9 AM
 * Note: This requires the bot to have channel scheduling permissions
 */
async function scheduleDailyFortune() {
  try {
    const channel = process.env.DAILY_FORTUNE_CHANNEL;
    if (!channel) {
      logger.debug('DAILY_FORTUNE_CHANNEL not configured, skipping daily schedule');
      return;
    }

    // Schedule the task (simplified - for production use node-schedule or similar)
    // This is a basic example that checks every minute
    setInterval(async () => {
      try {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Post at 9:00 AM
        if (hours === 9 && minutes === 0) {
          const quote = await getRandomFortune();
          const blocks = formatDailyFortune(quote);

          await app.client.chat.postMessage({
            channel,
            blocks,
            text: `Daily Fortune: ${quote.quote}`,
          });

          logger.info('Daily fortune posted', { channel, category: quote.category });
        }
      } catch (error) {
        logger.error('Error posting daily fortune', error);
      }
    }, 60000); // Check every minute
  } catch (error) {
    logger.error('Error setting up daily fortune schedule', error);
  }
}

// ============================================================
// ERROR HANDLING
// ============================================================

app.error(async (error) => {
  logger.error('Slack app error', error);
});

// ============================================================
// STARTUP
// ============================================================

/**
 * Start the Slack bot
 */
export async function start() {
  try {
    // Validate required environment variables
    if (!process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET) {
      throw new Error('SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET environment variables are required');
    }

    // Pre-load quotes
    await getQuotesCache();

    // Start the app
    await app.start(process.env.SLACK_PORT || 3000);
    logger.info('Slack bot started successfully', {
      port: process.env.SLACK_PORT || 3000,
    });

    // Schedule daily fortune if channel is configured
    if (process.env.DAILY_FORTUNE_CHANNEL) {
      scheduleDailyFortune();
      logger.info('Daily fortune scheduler started');
    }
  } catch (error) {
    logger.error('Failed to start Slack bot', error);
    process.exit(1);
  }
}

// Start the bot if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export default app;
