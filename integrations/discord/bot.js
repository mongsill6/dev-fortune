import { Client, GatewayIntentBits, Events, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import schedule from 'node-schedule';
import { getRandomQuote, getRandomByCategory, getCategories, loadQuotes } from '../../src/index.js';
import { createQuoteEmbed, createCategoriesEmbed, createHelpEmbed } from './embeds.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const DAILY_CHANNEL_ID = process.env.DAILY_CHANNEL_ID;
const DAILY_HOUR = parseInt(process.env.DAILY_HOUR || '9');

// Validation
if (!TOKEN || !CLIENT_ID) {
  throw new Error('Missing required environment variables: DISCORD_TOKEN and CLIENT_ID');
}

// Initialize client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Load quotes once
let quotes = [];

/**
 * Register slash commands with Discord
 */
async function registerSlashCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    const commands = [
      {
        name: 'fortune',
        description: 'Get a random dev fortune quote',
        options: [
          {
            name: 'category',
            description: 'Quote category (debugging, architecture, teamwork, motivation, humor)',
            type: 3, // STRING type
            required: false,
            choices: getCategories().map(cat => ({
              name: cat,
              value: cat,
            })),
          },
        ],
      },
    ];

    console.log('Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✓ Slash commands registered successfully');
  } catch (error) {
    console.error('Error registering slash commands:', error);
    throw error;
  }
}

/**
 * Send a fortune to a channel
 */
async function sendFortune(channel, category = null) {
  try {
    if (!quotes || quotes.length === 0) {
      await channel.send({
        content: '❌ No quotes available at the moment.',
        ephemeral: true,
      });
      return;
    }

    let quote;
    try {
      if (category) {
        quote = getRandomByCategory(quotes, category);
      } else {
        quote = getRandomQuote(quotes);
      }
    } catch (error) {
      await channel.send({
        content: `❌ Error: ${error.message}`,
        ephemeral: true,
      });
      return;
    }

    const embed = createQuoteEmbed(quote);
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending fortune:', error);
    if (channel.send) {
      try {
        await channel.send({
          content: '❌ Failed to retrieve a quote. Please try again.',
          ephemeral: true,
        });
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
    }
  }
}

/**
 * Schedule daily fortune posting
 */
function scheduleDailyFortune() {
  if (!DAILY_CHANNEL_ID) {
    console.log('⚠️  DAILY_CHANNEL_ID not set, skipping daily fortune scheduling');
    return;
  }

  const cronExpression = `0 ${DAILY_HOUR} * * *`;

  const job = schedule.scheduleJob(cronExpression, async () => {
    try {
      const channel = client.channels.cache.get(DAILY_CHANNEL_ID);
      if (!channel) {
        console.error(`Channel not found: ${DAILY_CHANNEL_ID}`);
        return;
      }

      if (!channel.isSendable()) {
        console.error(`Channel is not sendable: ${DAILY_CHANNEL_ID}`);
        return;
      }

      await sendFortune(channel);
      console.log(`✓ Daily fortune posted to ${channel.name}`);
    } catch (error) {
      console.error('Error posting daily fortune:', error);
    }
  });

  console.log(`✓ Daily fortune scheduled for ${DAILY_HOUR}:00 UTC`);
  return job;
}

/**
 * Handle text commands (!fortune, !fortune [category], etc.)
 */
async function handleTextCommand(message) {
  if (!message.content.startsWith('!fortune')) {
    return;
  }

  if (message.author.bot) {
    return;
  }

  const args = message.content.slice('!fortune'.length).trim().split(/\s+/);
  const subcommand = args[0]?.toLowerCase();

  try {
    if (!subcommand || subcommand === 'random') {
      // Random quote
      await sendFortune(message);
    } else if (subcommand === 'categories') {
      // List categories
      const embed = createCategoriesEmbed();
      await message.reply({ embeds: [embed] });
    } else if (subcommand === 'help') {
      // Show help
      const embed = createHelpEmbed();
      await message.reply({ embeds: [embed] });
    } else if (getCategories().includes(subcommand)) {
      // Category-specific quote
      await sendFortune(message, subcommand);
    } else {
      // Invalid category
      const validCategories = getCategories().join(', ');
      await message.reply({
        content: `❌ Unknown category: \`${subcommand}\`\n\nValid categories: ${validCategories}`,
      });
    }
  } catch (error) {
    console.error('Error handling text command:', error);
    await message.reply({
      content: '❌ An error occurred while processing your request.',
    }).catch(err => console.error('Failed to send error message:', err));
  }
}

/**
 * Handle slash commands
 */
async function handleSlashCommand(interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (interaction.commandName !== 'fortune') {
    return;
  }

  await interaction.deferReply();

  try {
    const category = interaction.options.getString('category');

    if (!quotes || quotes.length === 0) {
      await interaction.editReply({
        content: '❌ No quotes available at the moment.',
      });
      return;
    }

    let quote;
    try {
      if (category) {
        quote = getRandomByCategory(quotes, category);
      } else {
        quote = getRandomQuote(quotes);
      }
    } catch (error) {
      await interaction.editReply({
        content: `❌ Error: ${error.message}`,
      });
      return;
    }

    const embed = createQuoteEmbed(quote);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error handling slash command:', error);
    await interaction.editReply({
      content: '❌ An error occurred while processing your request.',
    }).catch(err => console.error('Failed to send error message:', err));
  }
}

/**
 * Main initialization
 */
async function start() {
  try {
    // Load quotes
    console.log('Loading quotes...');
    quotes = loadQuotes();
    console.log(`✓ Loaded ${quotes.length} quotes`);

    // Register event handlers
    client.once(Events.ClientReady, async () => {
      console.log(`✓ Bot logged in as ${client.user.tag}`);

      // Set status
      await client.user.setActivity('Sharing dev wisdom', { type: 0 });
      console.log('✓ Rich presence updated');

      // Register slash commands
      try {
        await registerSlashCommands();
      } catch (error) {
        console.error('Failed to register slash commands:', error);
        // Continue despite slash command registration failure
      }

      // Schedule daily fortune
      try {
        scheduleDailyFortune();
      } catch (error) {
        console.error('Failed to schedule daily fortune:', error);
        // Continue despite scheduling failure
      }
    });

    // Handle reconnection with exponential backoff
    client.on(Events.Warn, (info) => {
      console.warn(`⚠️  Warning: ${info}`);
    });

    client.on(Events.Error, (error) => {
      console.error('❌ Client error:', error);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });

    // Message event handler for text commands
    client.on(Events.MessageCreate, async (message) => {
      try {
        await handleTextCommand(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });

    // Interaction event handler for slash commands and buttons
    client.on(Events.InteractionCreate, async (interaction) => {
      try {
        if (interaction.isChatInputCommand()) {
          await handleSlashCommand(interaction);
        }
      } catch (error) {
        console.error('Error in interaction handler:', error);
        try {
          if (!interaction.replied) {
            await interaction.reply({
              content: '❌ An error occurred while processing your request.',
              ephemeral: true,
            });
          }
        } catch (replyError) {
          console.error('Failed to send error reply:', replyError);
        }
      }
    });

    // Login to Discord
    console.log('Connecting to Discord...');
    await client.login(TOKEN);

    console.log('✓ Bot startup complete');
  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('Shutting down bot...');
  try {
    await client.destroy();
    console.log('✓ Bot disconnected');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
}

// Handle termination signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Export for use as module
export { start, client, sendFortune };

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch(error => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });
}
