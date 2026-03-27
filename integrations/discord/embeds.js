import { EmbedBuilder } from 'discord.js';
import { CATEGORIES } from '../../src/categories.js';

const EMBED_COLOR = 0x5865F2; // Discord blurple
const CATEGORY_COLORS = {
  debugging: 0xFF6B6B,      // Red
  architecture: 0x4ECDC4,   // Teal
  teamwork: 0xFFE66D,       // Yellow
  motivation: 0xFF6B9D,     // Pink
  humor: 0x95E1D3,          // Mint
};

/**
 * Create a quote embed
 */
export function createQuoteEmbed(quote) {
  const category = quote.category || 'general';
  const categoryInfo = CATEGORIES[category];
  const emoji = categoryInfo?.emoji || '💡';

  const embed = new EmbedBuilder()
    .setColor(CATEGORY_COLORS[category] || EMBED_COLOR)
    .setDescription(`"${quote.quote}"`)
    .setAuthor({
      name: quote.by,
      iconURL: 'https://cdn-icons-png.flaticon.com/512/1995/1995480.png',
    })
    .setFooter({
      text: `${emoji} ${categoryInfo?.name || 'Quote'}`,
    })
    .setTimestamp();

  return embed;
}

/**
 * Create a categories list embed
 */
export function createCategoriesEmbed() {
  const categoryList = Object.entries(CATEGORIES)
    .map(([key, value]) => `${value.emoji} **${value.name}** - \`${key}\`\n${value.description}`)
    .join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('📚 Available Categories')
    .setDescription(categoryList)
    .setFooter({
      text: 'Use !fortune [category] or /fortune [category] to get a quote from a specific category',
    })
    .setTimestamp();

  return embed;
}

/**
 * Create a help embed
 */
export function createHelpEmbed() {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('💡 Dev Fortune - Help')
    .setDescription('Get inspired with developer wisdom!')
    .addFields(
      {
        name: '🔧 Text Commands',
        value: '`!fortune` - Get a random quote\n`!fortune [category]` - Get a quote from a category\n`!fortune categories` - List all categories\n`!fortune help` - Show this help message',
        inline: false,
      },
      {
        name: '⌘ Slash Commands',
        value: '`/fortune` - Get a random quote\n`/fortune [category]` - Get a quote from a category',
        inline: false,
      },
      {
        name: '📁 Categories',
        value: Object.entries(CATEGORIES)
          .map(([key, value]) => `${value.emoji} **${value.name}** (\`${key}\`)`)
          .join('\n'),
        inline: false,
      },
      {
        name: '⏰ Daily Fortune',
        value: 'If configured, a random quote will be posted daily to a designated channel.',
        inline: false,
      }
    )
    .setFooter({
      text: 'Spread dev wisdom!',
    })
    .setTimestamp();

  return embed;
}

/**
 * Create a welcome embed
 */
export function createWelcomeEmbed() {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('👋 Welcome to Dev Fortune')
    .setDescription('Your friendly bot for sharing developer inspiration!')
    .addFields(
      {
        name: 'Get Started',
        value: 'Type `!fortune help` or use `/fortune` to get started!',
        inline: false,
      }
    )
    .setThumbnail('https://cdn-icons-png.flaticon.com/512/1995/1995480.png')
    .setTimestamp();

  return embed;
}

/**
 * Create an error embed
 */
export function createErrorEmbed(title, description) {
  const embed = new EmbedBuilder()
    .setColor(0xFF6B6B)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();

  return embed;
}

/**
 * Create a success embed
 */
export function createSuccessEmbed(title, description) {
  const embed = new EmbedBuilder()
    .setColor(0x51CF66)
    .setTitle(`✓ ${title}`)
    .setDescription(description)
    .setTimestamp();

  return embed;
}
