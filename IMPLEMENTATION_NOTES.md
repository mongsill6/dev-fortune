# Slack Integration - Implementation Notes

## Key Implementation Details

### 1. Quote Data Format

The bot expects quotes in this format (from data/quotes-en.json):

```json
{
  "quote": "First, solve the problem. Then, write the code.",
  "by": "John Johnson",
  "category": "debugging"
}
```

Properties:
- `quote` (string): The actual quote text
- `by` (string): Author/attribution
- `category` (string): One of: debugging, architecture, teamwork, motivation, humor

### 2. Slash Command Handler

```javascript
app.command('/fortune', async ({ command, ack, respond, body }) => {
  // Acknowledge within 3 seconds
  await ack();
  
  // Get text parameter (e.g., "debugging" from /fortune debugging)
  const text = command.text.trim().toLowerCase();
  
  // Fetch quote based on category or random
  let quote = text ? 
    await getFortuneByCategory(text) : 
    await getRandomFortune();
  
  // Format and send response
  const blocks = formatFortuneBlock(quote);
  await respond({ blocks });
});
```

### 3. Interactive Button Handling

```javascript
app.action('new_fortune', async ({ ack, respond, body }) => {
  await ack();
  
  const quote = await getRandomFortune();
  const blocks = formatFortuneBlock(quote);
  
  // Replace original message
  await respond({
    blocks,
    replace_original: true,
  });
});
```

### 4. Block Kit Message Structure

A fortune message consists of:
```
[Section] Quote text with emoji
[Context] Author • Category
[Actions] New Fortune button
```

Rendered as:
```
🐛 "First, solve the problem. Then, write the code."
— John Johnson • Debugging
[✨ New Fortune]
```

### 5. Quote Caching Strategy

```javascript
let quotesCache = null;

async function getQuotesCache() {
  if (!quotesCache) {
    // Load from file only once
    quotesCache = loadQuotes(process.env.QUOTES_PATH);
  }
  return quotesCache;
}
```

Benefits:
- Fast quote retrieval
- Reduced file I/O
- Memory efficient (single reference)

### 6. Error Handling Pattern

```javascript
try {
  // Operation
  const quote = await getFortuneByCategory(text);
} catch (error) {
  // User-friendly error with valid options
  const validCategories = getCategories().join(', ');
  await respond({
    blocks: formatError(`Invalid category "${text}". Valid: ${validCategories}`)
  });
  return;
}
```

### 7. Logging Pattern

Every operation is logged with timestamps:

```javascript
const logger = {
  info: (msg, data = {}) => 
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data),
  error: (msg, err = null) => 
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err),
  debug: (msg, data = {}) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`, data);
    }
  },
};
```

Usage:
```javascript
logger.info('Fortune command received', { 
  text: 'debugging', 
  userId: body.user_id 
});
```

### 8. Category System

Categories are predefined in src/categories.js:

```javascript
export const CATEGORIES = {
  debugging: {
    name: 'Debugging',
    emoji: '🐛',
    description: '...'
  },
  // ... more categories
};
```

The bot uses these for:
- Validation (checking if category exists)
- Display (emoji and name formatting)
- Filtering (getting quotes by category)

### 9. App Home Event Handler

```javascript
app.event('app_home_opened', async ({ event, client }) => {
  const quote = await getRandomFortune();
  const blocks = formatAppHome(quote);
  
  await client.views.publish({
    user_id: event.user,
    view: {
      type: 'home',
      blocks,
    },
  });
});
```

### 10. Daily Scheduled Fortune

```javascript
// Check every minute
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 9 && now.getMinutes() === 0) {
    const quote = await getRandomFortune();
    const blocks = formatDailyFortune(quote);
    
    await app.client.chat.postMessage({
      channel: process.env.DAILY_FORTUNE_CHANNEL,
      blocks,
      text: `Daily Fortune: ${quote.quote}`,
    });
  }
}, 60000); // Every minute
```

## Error Scenarios & Handling

### Scenario 1: Invalid Category
```
User: /fortune invalid_category
Bot: ⚠️ Error
     Invalid category "invalid_category". Valid categories: debugging, architecture, teamwork, motivation, humor
```

### Scenario 2: Missing Environment Variables
```
[ERROR] SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET environment variables are required
Process exits with code 1
```

### Scenario 3: Quote File Not Found
```
[ERROR] Failed to load quotes
Fallback to empty array, show error to user
```

### Scenario 4: Slack API Error
```
[ERROR] Error handling /fortune command [Slack API error details]
User gets: "Failed to fetch fortune. Please try again later."
```

## Performance Characteristics

### Memory Usage
- Quote cache: ~100KB for 150 quotes
- App instance: ~50KB
- Event listeners: ~10KB
- Total footprint: ~160KB baseline

### Response Time
- Random quote retrieval: <1ms (cached)
- Category filtering: <5ms (array operations)
- Block formatting: <2ms
- Slack API call: ~500ms average
- Total from command to response: ~1 second

### Scalability Limits
- Single process can handle ~100 concurrent users
- Quote cache prevents repeated I/O
- Daily scheduler runs independently
- Slack handles rate limiting via API

## Security Considerations

### 1. Token Security
- Never log SLACK_BOT_TOKEN
- Store in environment, never in code
- Rotate tokens regularly

### 2. Markdown Escaping
```javascript
function escapeMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```
Prevents injection attacks via quote text

### 3. Event Signature Verification
- @slack/bolt automatically verifies request signatures
- Prevents replay attacks and spoofing

### 4. User ID Tracking
- Log user IDs for audit trail
- Useful for analytics and debugging

## Testing Strategy

### Unit Tests (if adding)
```javascript
describe('getQuotesCache', () => {
  it('should cache quotes after first load', async () => {
    const quotes1 = await getQuotesCache();
    const quotes2 = await getQuotesCache();
    expect(quotes1).toBe(quotes2); // Same reference
  });
});
```

### Integration Tests (with Slack)
```javascript
// Test actual Slack response
const result = await app.client.chat.postMessage({...});
expect(result.ok).toBe(true);
```

### Manual Testing
```bash
# In Slack workspace
/fortune
/fortune debugging
/fortune categories
/fortune invalid

# Then check logs
```

## Deployment Architecture

```
┌─────────────────┐
│   Slack User    │
│   (types /cmd)  │
└────────┬────────┘
         │
    HTTPS Request
         │
         v
┌─────────────────────────────┐
│  Dev Fortune Slack Bot      │
│  node bot.js                │
│  ├─ @slack/bolt            │
│  ├─ dotenv                  │
│  └─ Fortune functions       │
└────────┬────────┬───────────┘
         │        │
         │        └─→ File I/O
         │              (quotes.json)
         │
         v
    Slack API
  (https://slack.com)
```

## Configuration Patterns

### Development
```env
DEBUG=true
SLACK_PORT=3000
QUOTES_PATH=./data/quotes-en.json
# Use ngrok for public URL
```

### Staging
```env
DEBUG=false
SLACK_PORT=8080
QUOTES_PATH=/etc/app/quotes.json
# Use staging Slack workspace
```

### Production
```env
DEBUG=false
SLACK_PORT=3000
QUOTES_PATH=/var/app/quotes.json
DAILY_FORTUNE_CHANNEL=C123456789
# Use production environment variables
```

## Monitoring Points

### Critical Alerts
- Bot process crashed (restart script needed)
- SLACK_BOT_TOKEN invalid (authentication failed)
- Quote file missing or corrupt (fallback error)

### Warning Logs
- Slow quote fetching (>100ms)
- Slack API errors (rate limiting, network)
- Invalid user input (category validation)

### Info Logs
- Bot started successfully
- Quote loaded count
- Command executed count
- Daily fortune posted

## Future Enhancements

Potential additions:
1. Database storage of user preferences
2. Quote of the day with voting
3. Integration with other platforms (Discord, Teams)
4. Admin commands for managing quotes
5. Analytics dashboard
6. Multiple language support with /locale command
7. Slack thread replies for conversation
8. Emoji reactions for quote rating
9. Scheduled quote variations per channel
10. AI-generated custom quotes

