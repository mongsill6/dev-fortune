/**
 * Webhook Module Usage Examples
 * Demonstrates all webhook functions and patterns
 */

import {
  sendSlackWebhook,
  sendDiscordWebhook,
  sendTeamsWebhook,
  sendWebhook,
  scheduleDailyWebhook,
  healthCheckWebhook,
  detectPlatform,
} from '../integrations/webhook.js';

// Sample quotes for examples
const sampleQuotes = [
  {
    text: 'Code is poetry written by developers',
    author: 'Anonymous Developer',
    category: 'Technical',
    lang: 'en',
  },
  {
    text: 'The best code is no code at all',
    author: 'Jeff Atwood',
    category: 'Programming',
    lang: 'en',
  },
  {
    text: 'Debugging is twice as hard as writing code. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    author: 'Brian W. Kernighan',
    category: 'Technical',
    lang: 'en',
  },
  {
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb',
    category: 'Wisdom',
    lang: 'en',
  },
];

// ============================================================================
// Example 1: Send to Slack
// ============================================================================
async function example1_sendToSlack() {
  console.log('\n=== Example 1: Send to Slack ===\n');

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  Set SLACK_WEBHOOK_URL environment variable');
    return;
  }

  const quote = sampleQuotes[0];

  try {
    const result = await sendSlackWebhook(webhookUrl, quote);

    if (result.success) {
      console.log('✓ Quote sent to Slack successfully');
    } else {
      console.log(`✗ Failed to send to Slack: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// Example 2: Send to Discord
// ============================================================================
async function example2_sendToDiscord() {
  console.log('\n=== Example 2: Send to Discord ===\n');

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  Set DISCORD_WEBHOOK_URL environment variable');
    return;
  }

  const quote = sampleQuotes[1];

  try {
    const result = await sendDiscordWebhook(webhookUrl, quote);

    if (result.success) {
      console.log('✓ Quote sent to Discord successfully');
    } else {
      console.log(`✗ Failed to send to Discord: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// Example 3: Send to Microsoft Teams
// ============================================================================
async function example3_sendToTeams() {
  console.log('\n=== Example 3: Send to Microsoft Teams ===\n');

  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  Set TEAMS_WEBHOOK_URL environment variable');
    return;
  }

  const quote = sampleQuotes[2];

  try {
    const result = await sendTeamsWebhook(webhookUrl, quote);

    if (result.success) {
      console.log('✓ Quote sent to Teams successfully');
    } else {
      console.log(`✗ Failed to send to Teams: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// Example 4: Universal Webhook with Auto-Detection
// ============================================================================
async function example4_universalWebhook() {
  console.log('\n=== Example 4: Universal Webhook with Auto-Detection ===\n');

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  Set SLACK_WEBHOOK_URL environment variable');
    return;
  }

  const quote = sampleQuotes[3];

  // Auto-detect platform from URL
  const platform = detectPlatform(webhookUrl);
  console.log(`Detected platform: ${platform}`);

  try {
    const result = await sendWebhook(webhookUrl, quote);

    if (result.success) {
      console.log(`✓ Quote sent to ${result.platform} successfully`);
    } else {
      console.log(`✗ Failed to send: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// Example 5: Platform Detection
// ============================================================================
async function example5_platformDetection() {
  console.log('\n=== Example 5: Platform Detection ===\n');

  const urls = [
    'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
    'https://discordapp.com/api/webhooks/123456/XXXX',
    'https://discord.com/api/webhooks/123456/XXXX',
    'https://outlook.webhook.office.com/webhookb2/XXXX',
    'https://example.com/unknown',
  ];

  urls.forEach((url) => {
    const platform = detectPlatform(url);
    console.log(`${url.substring(0, 40)}... → ${platform || 'unknown'}`);
  });
}

// ============================================================================
// Example 6: Health Check
// ============================================================================
async function example6_healthCheck() {
  console.log('\n=== Example 6: Health Check ===\n');

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  Set SLACK_WEBHOOK_URL environment variable');
    return;
  }

  try {
    const health = await healthCheckWebhook(webhookUrl);

    console.log(`Platform: ${health.platform}`);
    console.log(`Healthy: ${health.healthy ? '✓' : '✗'}`);
    console.log(`Message: ${health.message}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// Example 7: Schedule Daily Delivery
// ============================================================================
async function example7_scheduleDailyWebhook() {
  console.log('\n=== Example 7: Schedule Daily Delivery ===\n');

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  Set SLACK_WEBHOOK_URL environment variable');
    return;
  }

  try {
    // Option A: Static daily quote
    const result = await scheduleDailyWebhook(
      webhookUrl,
      'slack',
      {
        quote: {
          text: 'Every day is a new opportunity to learn and grow',
          author: 'Anonymous',
          category: 'Motivational',
          lang: 'en',
        },
        schedule: '0 9 * * *', // 9 AM every day
        timezone: 'America/New_York',
      }
    );

    if (result.success) {
      console.log(`✓ Scheduled successfully`);
      console.log(`  Task ID: ${result.taskId}`);
      console.log(`  Schedule: Every day at 9 AM EST`);
      console.log(`  Message: ${result.message}`);

      // Example: To stop the scheduled task later
      // result.task.stop();
      // console.log('✓ Scheduled task stopped');
    } else {
      console.log(`✗ Failed to schedule: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// Example 8: Schedule with Dynamic Quotes
// ============================================================================
async function example8_scheduleDynamicQuotes() {
  console.log('\n=== Example 8: Schedule Daily with Dynamic Quotes ===\n');

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  Set SLACK_WEBHOOK_URL environment variable');
    return;
  }

  // Function that returns a random quote each time
  function getRandomQuote(category) {
    const quotes = sampleQuotes.filter(
      (q) => !category || q.category.toLowerCase() === category.toLowerCase()
    );

    if (quotes.length === 0) return sampleQuotes[0];

    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  try {
    const result = await scheduleDailyWebhook(
      webhookUrl,
      'slack',
      {
        getQuoteFn: getRandomQuote,
        category: 'technical',
        schedule: '0 9 * * 1-5', // Weekdays at 9 AM
        timezone: 'America/New_York',
      }
    );

    if (result.success) {
      console.log(`✓ Scheduled successfully`);
      console.log(`  Task ID: ${result.taskId}`);
      console.log(`  Schedule: Weekdays at 9 AM EST`);
      console.log(`  Category: Technical`);
      console.log(`  Message: ${result.message}`);
    } else {
      console.log(`✗ Failed to schedule: ${result.message}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// ============================================================================
// Example 9: Error Handling
// ============================================================================
async function example9_errorHandling() {
  console.log('\n=== Example 9: Error Handling ===\n');

  // Test 1: Missing URL
  console.log('Test 1: Missing URL');
  let result = await sendWebhook(null, sampleQuotes[0]);
  console.log(`Result: ${result.success ? '✓' : '✗'} - ${result.message}\n`);

  // Test 2: Invalid quote (missing text)
  console.log('Test 2: Invalid quote (missing text)');
  result = await sendWebhook(
    'https://hooks.slack.com/services/T00000000/B00000000/XXXX',
    { author: 'John Doe' }
  );
  console.log(`Result: ${result.success ? '✓' : '✗'} - ${result.message}\n`);

  // Test 3: Unknown platform
  console.log('Test 3: Unknown platform with explicit param');
  result = await sendWebhook(
    'https://example.com/webhook',
    sampleQuotes[0],
    { platform: 'unknown' }
  );
  console.log(`Result: ${result.success ? '✓' : '✗'} - ${result.message}\n`);

  // Test 4: Special characters
  console.log('Test 4: Quote with special characters');
  const specialQuote = {
    text: 'Code "testing" & <debugging> is important',
    author: 'Bob "The Developer" Jones',
    category: 'Tech & Tips',
    lang: 'en',
  };

  // This would succeed if webhook URL was valid
  console.log('Quote with special chars would be properly escaped\n');
}

// ============================================================================
// Example 10: Batch Send to Multiple Platforms
// ============================================================================
async function example10_batchSend() {
  console.log('\n=== Example 10: Send to Multiple Platforms ===\n');

  const webhooks = {
    slack: process.env.SLACK_WEBHOOK_URL,
    discord: process.env.DISCORD_WEBHOOK_URL,
    teams: process.env.TEAMS_WEBHOOK_URL,
  };

  const quote = sampleQuotes[0];

  const results = [];

  // Send in parallel
  const promises = Object.entries(webhooks)
    .filter(([, url]) => url) // Skip if not configured
    .map(async ([platform, url]) => {
      console.log(`Sending to ${platform}...`);
      try {
        const result = await sendWebhook(url, quote, { platform });
        return { platform, ...result };
      } catch (error) {
        return {
          platform,
          success: false,
          message: error.message,
        };
      }
    });

  const allResults = await Promise.all(promises);

  // Summary
  console.log('\n--- Results ---');
  allResults.forEach(({ platform, success, message }) => {
    console.log(`${platform.padEnd(10)} → ${success ? '✓' : '✗'} ${message}`);
  });

  const successCount = allResults.filter((r) => r.success).length;
  console.log(
    `\nTotal: ${successCount}/${allResults.length} webhooks delivered`
  );
}

// ============================================================================
// Main: Run Selected Examples
// ============================================================================
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     dev-fortune Webhook Module Examples                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const examples = [
    { num: 1, fn: example1_sendToSlack, label: 'Send to Slack' },
    { num: 2, fn: example2_sendToDiscord, label: 'Send to Discord' },
    { num: 3, fn: example3_sendToTeams, label: 'Send to Teams' },
    { num: 4, fn: example4_universalWebhook, label: 'Universal Webhook' },
    { num: 5, fn: example5_platformDetection, label: 'Platform Detection' },
    { num: 6, fn: example6_healthCheck, label: 'Health Check' },
    { num: 7, fn: example7_scheduleDailyWebhook, label: 'Schedule Daily (Static)' },
    { num: 8, fn: example8_scheduleDynamicQuotes, label: 'Schedule Daily (Dynamic)' },
    { num: 9, fn: example9_errorHandling, label: 'Error Handling' },
    { num: 10, fn: example10_batchSend, label: 'Batch Send' },
  ];

  // Show menu
  console.log('\nAvailable examples:');
  examples.forEach(({ num, label }) => {
    console.log(`  ${num}. ${label}`);
  });
  console.log('  0. Run all examples\n');

  // For this example, run all non-interactive examples
  await example5_platformDetection();
  await example9_errorHandling();

  // These require environment variables
  if (process.env.SLACK_WEBHOOK_URL) {
    await example6_healthCheck();
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  To send actual webhooks, set these env variables:       ║');
  console.log('║  - SLACK_WEBHOOK_URL                                     ║');
  console.log('║  - DISCORD_WEBHOOK_URL                                   ║');
  console.log('║  - TEAMS_WEBHOOK_URL                                     ║');
  console.log('║                                                          ║');
  console.log('║  Or uncomment the example functions in main() below      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

// Run it
main().catch(console.error);

// Export all examples for use in other files
export {
  example1_sendToSlack,
  example2_sendToDiscord,
  example3_sendToTeams,
  example4_universalWebhook,
  example5_platformDetection,
  example6_healthCheck,
  example7_scheduleDailyWebhook,
  example8_scheduleDynamicQuotes,
  example9_errorHandling,
  example10_batchSend,
};
