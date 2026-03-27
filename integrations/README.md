# Integrations Directory

Integration modules for dev-fortune connecting to external services and platforms.

## Webhook Module (NEW)

Universal webhook module for sending dev-fortune quotes to Slack, Discord, and Microsoft Teams.

### Files

- **`webhook.js`** - Core module (ES module, production-ready)
- **`WEBHOOK.md`** - Complete reference documentation
- **`WEBHOOK-QUICK-START.md`** - Quick reference and examples
- **Related:** `/tests/webhook.test.js` - Unit tests
- **Related:** `/examples/webhook-example.js` - 10 runnable examples

### Quick Start

```javascript
import { sendWebhook } from './webhook.js';

const quote = {
  text: 'Code is poetry',
  author: 'Anonymous',
  category: 'Technical',
  lang: 'en'
};

const result = await sendWebhook(
  'https://hooks.slack.com/services/T00/B00/XXXX',
  quote
);
```

### Features

- **Multi-platform:** Slack, Discord, Microsoft Teams
- **Auto-detection:** Detect platform from webhook URL
- **Retry logic:** Exponential backoff with max 3 attempts
- **Platform-specific formatting:**
  - Slack: Block Kit format
  - Discord: Rich embeds
  - Teams: Adaptive Cards
- **Scheduling:** Daily delivery via node-cron (optional)
- **Health checks:** Verify webhook connectivity
- **Native fetch:** No external HTTP libraries
- **Production-ready:** Error handling, validation, logging

### API

```javascript
// Send to specific platform
sendSlackWebhook(url, quote)
sendDiscordWebhook(url, quote)
sendTeamsWebhook(url, quote)

// Universal dispatcher with auto-detection
sendWebhook(url, quote, options?)

// Schedule daily delivery
scheduleDailyWebhook(url, platform, options?)

// Verify webhook connectivity
healthCheckWebhook(url)

// Auto-detect platform from URL
detectPlatform(url)
```

### Documentation

- **Full reference:** See `WEBHOOK.md` for complete API documentation
- **Quick start:** See `WEBHOOK-QUICK-START.md` for common tasks
- **Implementation:** See `/WEBHOOK-IMPLEMENTATION.md` for technical details
- **Tests:** See `/tests/webhook.test.js` for examples and test coverage
- **Examples:** See `/examples/webhook-example.js` for 10 runnable examples

### Running Tests

```bash
npm test tests/webhook.test.js
```

### Running Examples

```bash
node examples/webhook-example.js
```

## Slack Module

Slack integration with Block Kit message formatting.

### Files

- **`slack/blocks.js`** - Block Kit formatting functions

### Functions

- `formatFortuneBlock(quote)` - Standard fortune message
- `formatCategoryList(categories)` - Category listing
- `formatDailyFortune(quote)` - Daily fortune with header
- `formatError(message)` - Error message formatting
- `formatAppHome(quote)` - App home tab layout

## Discord Module

Discord integration (currently empty, will be populated by webhook module).

## Overview

| Module | Purpose | Status |
|--------|---------|--------|
| `webhook.js` | Universal webhook dispatcher | ✓ Complete |
| `slack/blocks.js` | Slack Block Kit formatting | ✓ Exists |
| `discord/` | Discord integration | Placeholder |

## Requirements

- Node.js 18+ (for native fetch)
- Optional: `node-cron` for scheduling features

## Security

All integrations:
- Use HTTPS only
- Validate input thoroughly
- Escape special characters appropriately
- Mask sensitive data in logs
- Handle errors gracefully

## Environment Variables

```bash
# Webhook URLs (store in .env or deployment config)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
DISCORD_WEBHOOK_URL=https://discordapp.com/api/webhooks/...
TEAMS_WEBHOOK_URL=https://outlook.webhook.office.com/...

# Enable debug logging
DEBUG_WEBHOOK=1
```

## License

MIT (matches parent project)

---

**Last Updated:** 2026-03-27
**Version:** 1.0.0
