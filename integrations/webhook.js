/**
 * Universal webhook module for dev-fortune
 * Supports: Slack Incoming Webhooks, Discord Webhooks, Microsoft Teams Webhooks
 * ES module with native fetch, error handling, and retry logic
 */

import { formatFortuneBlock } from './slack/blocks.js';

// Logger utility
const logger = {
  info: (msg, data = '') => console.log(`[webhook] ℹ ${msg}`, data),
  error: (msg, error = '') => console.error(`[webhook] ✗ ${msg}`, error),
  warn: (msg, data = '') => console.warn(`[webhook] ⚠ ${msg}`, data),
  debug: (msg, data = '') => {
    if (process.env.DEBUG_WEBHOOK) {
      console.log(`[webhook] 🔍 ${msg}`, data);
    }
  },
};

// Configuration constants
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  backoffMultiplier: 2,
};

const WEBHOOK_PATTERNS = {
  slack: /hooks\.slack\.com/,
  discord: /discordapp\.com\/api\/webhooks|discord\.com\/api\/webhooks/,
  teams: /outlook\.webhook\.office\.com|teams\.microsoft\.com/,
};

/**
 * Detect webhook platform from URL
 * @param {string} url - Webhook URL
 * @returns {string|null} - Platform name ('slack', 'discord', 'teams') or null
 */
export function detectPlatform(url) {
  if (!url || typeof url !== 'string') {
    logger.warn('Invalid URL provided for platform detection');
    return null;
  }

  for (const [platform, pattern] of Object.entries(WEBHOOK_PATTERNS)) {
    if (pattern.test(url)) {
      logger.debug(`Detected platform: ${platform}`);
      return platform;
    }
  }

  logger.warn('Could not detect platform from URL');
  return null;
}

/**
 * Validate and normalize quote object
 * @param {Object} quote - Quote object
 * @returns {Object} - Normalized quote
 */
function validateQuote(quote) {
  if (!quote || typeof quote !== 'object') {
    throw new Error('Quote must be a non-null object');
  }

  if (!quote.text || typeof quote.text !== 'string') {
    throw new Error('Quote must have a non-empty text property');
  }

  return {
    text: quote.text.trim(),
    author: quote.author?.trim() || 'Unknown',
    category: quote.category?.trim() || 'General',
    lang: quote.lang?.trim() || 'en',
  };
}

/**
 * Escape special characters for JSON strings
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeJSON(text) {
  if (typeof text !== 'string') {
    return String(text);
  }
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Format quote for Slack webhook
 * @param {Object} quote - Validated quote object
 * @returns {Object} - Slack message payload
 */
function formatSlackPayload(quote) {
  logger.debug('Formatting message for Slack');

  // Use existing Block Kit formatting from slack/blocks.js
  const blocks = formatFortuneBlock(quote);

  return {
    blocks,
    text: `"${quote.text}" — ${quote.author}`, // Fallback text
  };
}

/**
 * Format quote for Discord webhook
 * @param {Object} quote - Validated quote object
 * @returns {Object} - Discord message payload
 */
function formatDiscordPayload(quote) {
  logger.debug('Formatting message for Discord');

  const embed = {
    title: '✨ Dev Fortune',
    description: `> "${escapeJSON(quote.text)}"`,
    fields: [
      {
        name: 'Author',
        value: quote.author,
        inline: true,
      },
      {
        name: 'Category',
        value: quote.category,
        inline: true,
      },
      {
        name: 'Language',
        value: quote.lang.toUpperCase(),
        inline: true,
      },
    ],
    color: 0x6366f1, // Indigo
    timestamp: new Date().toISOString(),
    footer: {
      text: 'dev-fortune',
      icon_url: 'https://github.com/mongsill6/dev-fortune/raw/main/assets/icon.png',
    },
  };

  return {
    username: 'Dev Fortune',
    avatar_url: 'https://github.com/mongsill6/dev-fortune/raw/main/assets/icon.png',
    embeds: [embed],
    content: `"${quote.text}" — ${quote.author}`,
  };
}

/**
 * Format quote for Microsoft Teams webhook (Adaptive Card)
 * @param {Object} quote - Validated quote object
 * @returns {Object} - Teams message payload
 */
function formatTeamsPayload(quote) {
  logger.debug('Formatting message for Teams');

  const adaptiveCard = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'Container',
              style: 'emphasis',
              items: [
                {
                  type: 'ColumnSet',
                  columns: [
                    {
                      width: 'stretch',
                      items: [
                        {
                          type: 'TextBlock',
                          text: '✨ Dev Fortune',
                          weight: 'bolder',
                          size: 'large',
                          color: 'accent',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'Container',
              items: [
                {
                  type: 'TextBlock',
                  text: `"${escapeJSON(quote.text)}"`,
                  wrap: true,
                  style: 'default',
                  weight: 'bolder',
                  size: 'medium',
                  isSubtle: false,
                  spacing: 'medium',
                },
                {
                  type: 'TextBlock',
                  text: `— ${quote.author}`,
                  wrap: true,
                  style: 'default',
                  isSubtle: true,
                  spacing: 'small',
                },
              ],
            },
            {
              type: 'Container',
              separator: true,
              items: [
                {
                  type: 'ColumnSet',
                  columns: [
                    {
                      width: 'stretch',
                      items: [
                        {
                          type: 'TextBlock',
                          text: 'Category',
                          weight: 'bolder',
                          size: 'small',
                        },
                        {
                          type: 'TextBlock',
                          text: quote.category,
                          isSubtle: true,
                          size: 'small',
                        },
                      ],
                    },
                    {
                      width: 'stretch',
                      items: [
                        {
                          type: 'TextBlock',
                          text: 'Language',
                          weight: 'bolder',
                          size: 'small',
                        },
                        {
                          type: 'TextBlock',
                          text: quote.lang.toUpperCase(),
                          isSubtle: true,
                          size: 'small',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  };

  return adaptiveCard;
}

/**
 * Perform HTTP request with exponential backoff retry logic
 * @param {string} url - Webhook URL
 * @param {Object} payload - Message payload
 * @param {number} attempt - Current attempt number
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithRetry(url, payload, attempt = 1) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'dev-fortune/1.0.0',
    },
    body: JSON.stringify(payload),
  };

  try {
    logger.debug(`Sending webhook (attempt ${attempt}/${RETRY_CONFIG.maxRetries})`, {
      url: url.substring(0, 50) + '...',
    });

    const response = await fetch(url, options);

    // 2xx responses are success
    if (response.ok) {
      logger.info(`Webhook delivered successfully (${response.status})`);
      return response;
    }

    // 4xx errors are usually configuration issues - don't retry
    if (response.status >= 400 && response.status < 500) {
      const errorText = await response.text();
      throw new Error(
        `Client error (${response.status}): ${errorText.substring(0, 200)}`
      );
    }

    // 5xx and network errors are retryable
    throw new Error(`Server error (${response.status})`);
  } catch (error) {
    // Determine if we should retry
    const isRetryable =
      attempt < RETRY_CONFIG.maxRetries &&
      (error.message.includes('Server error') ||
        error.message.includes('fetch') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT'));

    if (isRetryable) {
      const delay = Math.min(
        RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
        RETRY_CONFIG.maxDelay
      );

      logger.warn(
        `Webhook failed (${error.message}), retrying in ${delay}ms...`,
        `(attempt ${attempt}/${RETRY_CONFIG.maxRetries})`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, payload, attempt + 1);
    }

    // Final attempt failed or non-retryable error
    throw new Error(
      `Webhook delivery failed after ${attempt} attempt(s): ${error.message}`
    );
  }
}

/**
 * Send quote to Slack webhook
 * @param {string} url - Slack Incoming Webhook URL
 * @param {Object} quote - Quote object {text, author, category, lang}
 * @returns {Promise<Object>} - {success: boolean, message: string}
 */
export async function sendSlackWebhook(url, quote) {
  try {
    if (!url) throw new Error('Slack webhook URL is required');

    const validatedQuote = validateQuote(quote);
    const payload = formatSlackPayload(validatedQuote);

    await fetchWithRetry(url, payload);

    logger.info('Slack webhook sent successfully');
    return {
      success: true,
      platform: 'slack',
      message: 'Quote delivered to Slack',
    };
  } catch (error) {
    logger.error('Slack webhook failed', error.message);
    return {
      success: false,
      platform: 'slack',
      message: error.message,
    };
  }
}

/**
 * Send quote to Discord webhook
 * @param {string} url - Discord Webhook URL
 * @param {Object} quote - Quote object {text, author, category, lang}
 * @returns {Promise<Object>} - {success: boolean, message: string}
 */
export async function sendDiscordWebhook(url, quote) {
  try {
    if (!url) throw new Error('Discord webhook URL is required');

    const validatedQuote = validateQuote(quote);
    const payload = formatDiscordPayload(validatedQuote);

    await fetchWithRetry(url, payload);

    logger.info('Discord webhook sent successfully');
    return {
      success: true,
      platform: 'discord',
      message: 'Quote delivered to Discord',
    };
  } catch (error) {
    logger.error('Discord webhook failed', error.message);
    return {
      success: false,
      platform: 'discord',
      message: error.message,
    };
  }
}

/**
 * Send quote to Microsoft Teams webhook
 * @param {string} url - Teams Webhook URL
 * @param {Object} quote - Quote object {text, author, category, lang}
 * @returns {Promise<Object>} - {success: boolean, message: string}
 */
export async function sendTeamsWebhook(url, quote) {
  try {
    if (!url) throw new Error('Teams webhook URL is required');

    const validatedQuote = validateQuote(quote);
    const payload = formatTeamsPayload(validatedQuote);

    await fetchWithRetry(url, payload);

    logger.info('Teams webhook sent successfully');
    return {
      success: true,
      platform: 'teams',
      message: 'Quote delivered to Teams',
    };
  } catch (error) {
    logger.error('Teams webhook failed', error.message);
    return {
      success: false,
      platform: 'teams',
      message: error.message,
    };
  }
}

/**
 * Universal webhook dispatcher
 * Auto-detects platform from URL or uses explicit platform parameter
 * @param {string} url - Webhook URL
 * @param {Object} quote - Quote object {text, author, category, lang}
 * @param {Object} options - {platform?: 'slack'|'discord'|'teams', retries?: number}
 * @returns {Promise<Object>} - {success: boolean, platform: string, message: string}
 */
export async function sendWebhook(url, quote, options = {}) {
  try {
    if (!url) throw new Error('Webhook URL is required');

    // Determine platform
    let platform = options.platform;

    if (!platform) {
      platform = detectPlatform(url);
    }

    if (!platform) {
      throw new Error(
        'Could not determine webhook platform. Please specify explicitly: slack, discord, or teams'
      );
    }

    logger.info(`Sending webhook to ${platform}`);

    // Dispatch to appropriate function
    switch (platform.toLowerCase()) {
      case 'slack':
        return await sendSlackWebhook(url, quote);
      case 'discord':
        return await sendDiscordWebhook(url, quote);
      case 'teams':
        return await sendTeamsWebhook(url, quote);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    logger.error('Universal webhook dispatch failed', error.message);
    return {
      success: false,
      platform: options.platform || 'unknown',
      message: error.message,
    };
  }
}

/**
 * Schedule daily webhook delivery (requires optional node-cron)
 * @param {string} url - Webhook URL
 * @param {string} platform - Platform ('slack', 'discord', 'teams')
 * @param {Object} options - {
 *   quote?: Object,
 *   schedule?: '0 9 * * *',
 *   getQuoteFn?: (category?: string) => Object,
 *   category?: string,
 *   timezone?: string
 * }
 * @returns {Promise<Object>} - {success: boolean, message: string, taskId?: string}
 */
export async function scheduleDailyWebhook(url, platform, options = {}) {
  try {
    if (!url) throw new Error('Webhook URL is required');
    if (!platform) throw new Error('Platform is required');

    // Try to load node-cron
    let cron;
    try {
      const cronModule = await import('node-cron');
      cron = cronModule.default;
    } catch (err) {
      logger.warn(
        'node-cron not installed. Install with: npm install node-cron'
      );
      return {
        success: false,
        message:
          'node-cron is required for scheduling. Install with: npm install node-cron',
      };
    }

    const {
      quote,
      schedule = '0 9 * * *', // 9 AM daily
      getQuoteFn,
      category,
      timezone = 'UTC',
    } = options;

    if (!quote && !getQuoteFn) {
      throw new Error('Either quote or getQuoteFn must be provided');
    }

    // Create the scheduled task
    const task = cron.schedule(
      schedule,
      async () => {
        try {
          logger.info('Executing scheduled webhook task');

          const quoteToSend = quote || (getQuoteFn ? getQuoteFn(category) : null);

          if (!quoteToSend) {
            logger.error('No quote available for scheduled webhook');
            return;
          }

          const result = await sendWebhook(url, quoteToSend, { platform });

          if (result.success) {
            logger.info('Scheduled webhook executed successfully');
          } else {
            logger.error('Scheduled webhook execution failed', result.message);
          }
        } catch (error) {
          logger.error('Error in scheduled webhook task', error.message);
        }
      },
      {
        scheduled: true,
        timezone,
      }
    );

    const taskId = `webhook-${Date.now()}`;
    logger.info(`Scheduled daily webhook (${platform})`, {
      schedule,
      timezone,
      taskId,
    });

    return {
      success: true,
      message: `Daily webhook scheduled for ${platform}`,
      taskId,
      task, // Return task object so caller can stop() if needed
    };
  } catch (error) {
    logger.error('Failed to schedule daily webhook', error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Health check for webhook URL
 * @param {string} url - Webhook URL
 * @returns {Promise<Object>} - {healthy: boolean, platform?: string, message: string}
 */
export async function healthCheckWebhook(url) {
  try {
    if (!url) throw new Error('Webhook URL is required');

    const platform = detectPlatform(url);

    if (!platform) {
      return {
        healthy: false,
        message: 'Could not detect webhook platform from URL',
      };
    }

    // Send a minimal test payload
    const testQuote = {
      text: 'Health check from dev-fortune',
      author: 'System',
      category: 'System',
      lang: 'en',
    };

    logger.debug('Performing health check on webhook', platform);

    const result = await sendWebhook(url, testQuote, { platform });

    return {
      healthy: result.success,
      platform,
      message: result.success
        ? `${platform} webhook is healthy`
        : `${platform} webhook check failed: ${result.message}`,
    };
  } catch (error) {
    logger.error('Health check failed', error.message);
    return {
      healthy: false,
      message: error.message,
    };
  }
}

// Export all functions and utilities
export default {
  sendSlackWebhook,
  sendDiscordWebhook,
  sendTeamsWebhook,
  sendWebhook,
  scheduleDailyWebhook,
  healthCheckWebhook,
  detectPlatform,
  logger,
};
