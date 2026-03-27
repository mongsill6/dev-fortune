# dev-fortune REST API Documentation

## Overview

dev-fortune is a REST API service that provides developer quotes and wisdom across multiple languages. The API offers features for retrieving random quotes, searching, listing with pagination, and managing a collection of developer-focused quotes organized by category.

**Base URL:** `http://localhost:3000`

**API Version:** 1.0

**Status:** Active

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [CORS](#cors)
5. [Endpoints](#endpoints)
6. [Response Format](#response-format)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## Getting Started

### Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the API server:
   ```bash
   npm run start:server
   ```

3. The API will be available at `http://localhost:3000`

4. Access interactive documentation:
   ```
   http://localhost:3000/api-docs
   ```

### Available Categories

The API supports the following quote categories:

- `debugging` - Quotes about debugging and troubleshooting
- `architecture` - Quotes about system design and architecture
- `teamwork` - Quotes about collaboration and team dynamics
- `motivation` - Motivational and inspirational quotes
- `humor` - Humorous and witty developer quotes

### Supported Languages

- `en` - English (default)
- `ko` - Korean
- `ja` - Japanese

---

## Authentication

The dev-fortune API does not require authentication. All endpoints are publicly accessible.

---

## Rate Limiting

The API implements rate limiting to ensure fair usage and prevent abuse.

**Limits:**
- **100 requests per 15 minutes** per client IP address

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1711612500
```

**Rate Limit Exceeded:**
When the rate limit is exceeded, the API returns a `429 Too Many Requests` status code with a retry-after header.

---

## CORS

Cross-Origin Resource Sharing (CORS) is enabled on all endpoints. The API accepts requests from any origin.

**Allowed Methods:**
- GET
- POST
- OPTIONS

**Allowed Headers:**
- Content-Type
- Accept
- Accept-Language

---

## Endpoints

### 1. Get Random Quote

Retrieves a random developer quote.

**Request:**
```
GET /api/random
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category (debugging, architecture, teamwork, motivation, humor) |
| lang | string | No | Language code (en, ko, ja). Default: en |

**Response (200 OK):**
```json
{
  "id": 42,
  "quote": "The best code is no code at all.",
  "by": "Jeff Atwood",
  "category": "architecture"
}
```

**Examples:**

Get random quote in English:
```bash
curl http://localhost:3000/api/random
```

Get random debugging quote in Korean:
```bash
curl "http://localhost:3000/api/random?category=debugging&lang=ko"
```

Get random motivational quote in Japanese:
```bash
curl "http://localhost:3000/api/random?category=motivation&lang=ja"
```

---

### 2. List All Quotes

Retrieves all quotes with pagination support.

**Request:**
```
GET /api/quotes
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category |
| lang | string | No | Language code. Default: en |
| page | integer | No | Page number (1-based). Default: 1 |
| limit | integer | No | Results per page. Default: 20, Max: 100 |

**Response (200 OK):**
```json
{
  "quotes": [
    {
      "id": 0,
      "quote": "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
      "by": "Martin Fowler",
      "category": "debugging"
    },
    {
      "id": 1,
      "quote": "Debugging is like being the detective in a crime drama.",
      "by": "Filipe Fortes",
      "category": "debugging"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Examples:**

List first 20 quotes in English:
```bash
curl http://localhost:3000/api/quotes
```

List debugging quotes with custom pagination:
```bash
curl "http://localhost:3000/api/quotes?category=debugging&page=2&limit=10"
```

List teamwork quotes in Korean:
```bash
curl "http://localhost:3000/api/quotes?category=teamwork&lang=ko&limit=15"
```

---

### 3. Get Specific Quote

Retrieves a specific quote by its ID.

**Request:**
```
GET /api/quotes/:id
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Quote ID (0-based index) |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lang | string | No | Language code. Default: en |

**Response (200 OK):**
```json
{
  "id": 5,
  "quote": "Programming is like sex. One mistake and you have to support it for the rest of your life.",
  "by": "Michael Sinz",
  "category": "humor"
}
```

**Error (404 Not Found):**
```json
{
  "error": "Quote not found",
  "id": 999
}
```

**Examples:**

Get quote with ID 5 in English:
```bash
curl http://localhost:3000/api/quotes/5
```

Get quote with ID 10 in Japanese:
```bash
curl "http://localhost:3000/api/quotes/10?lang=ja"
```

---

### 4. List Categories

Retrieves all available quote categories.

**Request:**
```
GET /api/categories
```

**Response (200 OK):**
```json
{
  "categories": [
    {
      "name": "debugging",
      "count": 32
    },
    {
      "name": "architecture",
      "count": 28
    },
    {
      "name": "teamwork",
      "count": 25
    },
    {
      "name": "motivation",
      "count": 42
    },
    {
      "name": "humor",
      "count": 23
    }
  ],
  "total": 150
}
```

**Examples:**

List all available categories:
```bash
curl http://localhost:3000/api/categories
```

---

### 5. Search Quotes

Search quotes by text content or author name.

**Request:**
```
GET /api/search
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query (searches quote text and author) |
| lang | string | No | Language code. Default: en |
| category | string | No | Filter results by category |

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 12,
      "quote": "The only way to go fast is to go well.",
      "by": "Robert Martin",
      "category": "architecture"
    },
    {
      "id": 45,
      "quote": "Make it work, make it right, make it fast.",
      "by": "Kent Beck",
      "category": "architecture"
    }
  ],
  "query": "fast",
  "total": 2
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Search query is required",
  "code": "MISSING_QUERY"
}
```

**Examples:**

Search for quotes about "debugging":
```bash
curl "http://localhost:3000/api/search?q=debugging"
```

Search for quotes by "Martin Fowler":
```bash
curl "http://localhost:3000/api/search?q=Martin%20Fowler"
```

Search for quotes about "code" in the architecture category:
```bash
curl "http://localhost:3000/api/search?q=code&category=architecture"
```

Search in Korean:
```bash
curl "http://localhost:3000/api/search?q=코드&lang=ko"
```

---

### 6. Add New Quote

Create a new quote in the collection.

**Request:**
```
POST /api/quotes
```

**Request Body:**
```json
{
  "quote": "The best time to plant a tree was 20 years ago. The second best time is now.",
  "by": "Chinese Proverb",
  "category": "motivation"
}
```

**Request Headers:**
```
Content-Type: application/json
```

**Response (201 Created):**
```json
{
  "id": 150,
  "quote": "The best time to plant a tree was 20 years ago. The second best time is now.",
  "by": "Chinese Proverb",
  "category": "motivation"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Missing required field: quote",
  "fields": ["quote", "by", "category"]
}
```

**Examples:**

Add a new debugging quote:
```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "A syntax error in code is like a typo in an email.",
    "by": "John Doe",
    "category": "debugging"
  }'
```

Add a teamwork quote:
```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "Great teams are built on trust and communication.",
    "by": "Jane Smith",
    "category": "teamwork"
  }'
```

---

### 7. Interactive API Documentation

Access the Swagger UI interface for interactive API exploration and testing.

**Request:**
```
GET /api-docs
```

**Response:** HTML page with Swagger UI

**URL:** `http://localhost:3000/api-docs`

---

## Response Format

### Success Response

All successful responses follow this structure:

**For GET endpoints:**
```json
{
  "data": {}
}
```

**For single resource:**
```json
{
  "id": 0,
  "quote": "...",
  "by": "Author",
  "category": "category"
}
```

**Quote Object Structure:**

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier (0-based index) |
| quote | string | The quote text |
| by | string | Author name |
| category | string | Quote category |

---

## Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid query parameters or request body |
| 404 | Not Found - Requested resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Common Error Responses

**400 Bad Request - Invalid Category:**
```json
{
  "error": "Invalid category: invalid_cat",
  "code": "INVALID_CATEGORY",
  "validCategories": ["debugging", "architecture", "teamwork", "motivation", "humor"]
}
```

**400 Bad Request - Invalid Language:**
```json
{
  "error": "Invalid language: invalid_lang",
  "code": "INVALID_LANGUAGE",
  "validLanguages": ["en", "ko", "ja"]
}
```

**400 Bad Request - Missing Required Field:**
```json
{
  "error": "Missing required field: quote",
  "code": "MISSING_FIELD",
  "requiredFields": ["quote", "by", "category"]
}
```

**404 Not Found:**
```json
{
  "error": "Quote not found",
  "code": "NOT_FOUND",
  "id": 999
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Examples

### Complete Workflow Example

```bash
# 1. Get a random quote
curl http://localhost:3000/api/random

# 2. Get a random debugging quote
curl "http://localhost:3000/api/random?category=debugging"

# 3. List categories
curl http://localhost:3000/api/categories

# 4. List all quotes (first page)
curl http://localhost:3000/api/quotes

# 5. Search for quotes about "code"
curl "http://localhost:3000/api/search?q=code"

# 6. Get a specific quote
curl http://localhost:3000/api/quotes/5

# 7. Add a new quote
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "quote": "Code reviews are where bugs go to die.",
    "by": "Anonymous",
    "category": "debugging"
  }'

# 8. List motivation quotes with pagination
curl "http://localhost:3000/api/quotes?category=motivation&page=1&limit=10"

# 9. Search with filters
curl "http://localhost:3000/api/search?q=Martin%20Fowler&category=architecture"

# 10. Get random humor quote in Korean
curl "http://localhost:3000/api/random?category=humor&lang=ko"
```

### Using with JavaScript/Node.js

```javascript
// Fetch a random quote
fetch('http://localhost:3000/api/random')
  .then(res => res.json())
  .then(data => console.log(data));

// Fetch quotes with pagination
fetch('http://localhost:3000/api/quotes?page=2&limit=10')
  .then(res => res.json())
  .then(data => console.log(data));

// Search quotes
fetch('http://localhost:3000/api/search?q=debugging')
  .then(res => res.json())
  .then(data => console.log(data));

// Add a new quote
fetch('http://localhost:3000/api/quotes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quote: 'Perfect is the enemy of good.',
    by: 'Voltaire',
    category: 'motivation'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Using with Python

```python
import requests

# Get random quote
response = requests.get('http://localhost:3000/api/random')
print(response.json())

# Search quotes
params = {'q': 'code', 'category': 'architecture'}
response = requests.get('http://localhost:3000/api/search', params=params)
print(response.json())

# Add new quote
data = {
    'quote': 'Simplicity is the ultimate sophistication.',
    'by': 'Leonardo da Vinci',
    'category': 'architecture'
}
response = requests.post('http://localhost:3000/api/quotes', json=data)
print(response.json())
```

---

## Best Practices

### Request Design

1. **Use specific queries**: Be as specific as possible when filtering to reduce payload sizes
2. **Pagination**: Always use pagination for list endpoints to improve performance
3. **Error handling**: Always check response status codes and handle errors appropriately
4. **Rate limiting**: Implement exponential backoff when receiving 429 responses

### Performance Tips

1. Use pagination with appropriate `limit` values (10-20 is recommended)
2. Cache random quote requests if displaying the same quote multiple times
3. Use specific categories instead of listing all quotes
4. Implement client-side search caching for frequently searched terms

### Security

1. The API does not require authentication, but client applications should validate input
2. Always validate quote submissions on the client side before sending
3. Implement rate limiting on the client side to respect the API's limits

---

## Support

For issues, feature requests, or questions about the dev-fortune API, please refer to the project repository or contact the development team.

**Last Updated:** 2026-03-27
**API Version:** 1.0
