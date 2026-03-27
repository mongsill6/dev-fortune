import { CATEGORIES } from '../../src/index.js';

/**
 * Slack Block Kit message formatting for dev-fortune
 * ES module for constructing various Slack message blocks
 */

/**
 * Formats a fortune quote into Slack Block Kit format
 * @param {Object} quote - Quote object with quote, by, and category properties
 * @returns {Array} Array of Block Kit blocks
 */
export function formatFortuneBlock(quote) {
  if (!quote || !quote.quote) {
    throw new Error('Quote object with quote property is required');
  }

  const category = CATEGORIES[quote.category];
  const emoji = category ? category.emoji : '💡';

  const blocks = [
    // Quote section with bold/italic formatting
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *_"${escapeMarkdown(quote.quote)}"_*`,
      },
    },
    // Context block with metadata
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Author:* ${escapeMarkdown(quote.by || 'Unknown')}${quote.category ? ` | *Category:* ${escapeMarkdown(category.name)}` : ''}`,
        },
      ],
    },
    // Actions block with button
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '✨ New Fortune',
            emoji: true,
          },
          action_id: 'new_fortune',
          style: 'primary',
        },
      ],
    },
  ];

  return blocks;
}

/**
 * Formats a category list as Slack blocks
 * @param {Array<string>} categories - Array of category strings
 * @returns {Array} Array of Block Kit blocks
 */
export function formatCategoryList(categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'No categories available',
        },
      },
    ];
  }

  const categoryList = categories
    .map((cat) => `• ${escapeMarkdown(cat)}`)
    .join('\n');

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Available Categories',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: categoryList,
      },
    },
  ];
}

/**
 * Formats a daily fortune with header and divider
 * @param {Object} quote - Quote object with quote, by, and category properties
 * @returns {Array} Array of Block Kit blocks
 */
export function formatDailyFortune(quote) {
  if (!quote || !quote.quote) {
    throw new Error('Quote object with quote property is required');
  }

  const category = CATEGORIES[quote.category];
  const categoryName = category ? category.name : 'General';
  const emoji = category ? category.emoji : '💡';

  const blocks = [
    // Header
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '☀️ Daily Fortune',
        emoji: true,
      },
    },
    // Divider
    {
      type: 'divider',
    },
    // Quote section
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *_"${escapeMarkdown(quote.quote)}"_*\n\n— ${escapeMarkdown(quote.by || 'Unknown')}`,
      },
    },
    // Metadata
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Category: _${escapeMarkdown(categoryName)}_`,
        },
      ],
    },
    // Divider
    {
      type: 'divider',
    },
  ];

  return blocks;
}

/**
 * Formats an error message block
 * @param {string} message - Error message text
 * @returns {Array} Array of Block Kit blocks
 */
export function formatError(message) {
  if (!message) {
    throw new Error('Error message is required');
  }

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `⚠️ *Error*\n${escapeMarkdown(message)}`,
      },
    },
  ];
}

/**
 * Formats App Home tab blocks
 * @param {Object} quote - Quote object with quote, by, and category properties
 * @returns {Array} Array of Block Kit blocks
 */
export function formatAppHome(quote) {
  if (!quote || !quote.quote) {
    throw new Error('Quote object with quote property is required');
  }

  const category = CATEGORIES[quote.category];
  const categoryName = category ? category.name : 'General';
  const emoji = category ? category.emoji : '💡';

  const blocks = [
    // Welcome header
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Welcome to Dev Fortune',
        emoji: true,
      },
    },
    // Welcome section
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Get daily doses of inspiration, motivation, and wisdom for developers. Each fortune is carefully curated to boost your productivity and creativity.',
      },
    },
    // Divider
    {
      type: 'divider',
    },
    // Featured fortune header
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '✨ Featured Fortune',
        emoji: true,
      },
    },
    // Featured quote
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *_"${escapeMarkdown(quote.quote)}"_*`,
      },
    },
    // Attribution
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Author:* ${escapeMarkdown(quote.by || 'Unknown')} | *Category:* ${escapeMarkdown(categoryName)}`,
        },
      ],
    },
    // Divider
    {
      type: 'divider',
    },
    // Quick actions
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Quick Actions*',
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🎲 Get Random Fortune',
            emoji: true,
          },
          action_id: 'app_home_random_fortune',
          style: 'primary',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 View All Categories',
            emoji: true,
          },
          action_id: 'app_home_categories',
        },
      ],
    },
  ];

  return blocks;
}

/**
 * Escapes special Markdown characters for Slack
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for Slack Markdown
 */
function escapeMarkdown(text) {
  if (typeof text !== 'string') {
    return String(text);
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default {
  formatFortuneBlock,
  formatCategoryList,
  formatDailyFortune,
  formatError,
  formatAppHome,
};
