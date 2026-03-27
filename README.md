# dev-fortune

> Developer wisdom, delivered everywhere — terminal, web, API, and beyond.

A full-stack developer quotes platform. Get curated programming wisdom in your terminal, browser, Slack, Discord, or via REST API. Multilingual. Extensible. Open source.

[![CI](https://github.com/mongsill6/dev-fortune/actions/workflows/ci.yml/badge.svg)](https://github.com/mongsill6/dev-fortune/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/dev-fortune)](https://www.npmjs.com/package/dev-fortune)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >=16](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)

---

## Features

- 🖥️ **CLI** — instant quotes in your terminal via `dev-fortune` command
- 🌐 **REST API** — Express server with full Swagger documentation
- ⚛️ **Web Frontend** — React + Vite + Tailwind CSS single-page app
- 🐳 **Docker** — containerized full-stack deployment with docker-compose
- 🎨 **TUI** — interactive terminal UI built with Ink
- 🤖 **Bot Integrations** — Slack and Discord bots included
- 🌍 **Multilingual** — quotes in Korean, English, and Japanese
- 📦 **NPM Package** — ESM-native, publishable, zero config
- ✅ **Tested** — 74+ Jest tests with CI enforcement
- 🤝 **Community-ready** — contribution system, code of conduct, and contributor tracking

---

## Quick Start

**Install globally from npm:**

```bash
npm install -g dev-fortune
dev-fortune
```

**Run without installing:**

```bash
npx dev-fortune
```

**Clone and run locally:**

```bash
git clone https://github.com/mongsill6/dev-fortune.git
cd dev-fortune
npm install
npm start
```

---

## CLI Usage

```
Usage: dev-fortune [options]

Options:
  -r, --random            Print a random quote (default)
  -l, --list              List all quotes
  -c, --category <name>   Filter by category (e.g. debugging, motivation, testing)
  -L, --lang <code>       Language: en | ko | ja  (default: en)
  -s, --search <term>     Search quotes by keyword
  -a, --author <name>     Filter by author
      --json              Output as JSON
  -V, --version           Show version
  -h, --help              Show help
```

**Examples:**

```bash
# Random quote
dev-fortune

# Random quote in Korean
dev-fortune --lang ko

# Filter by category
dev-fortune --category debugging

# Search by keyword
dev-fortune --search "simplicity"

# List all quotes as JSON
dev-fortune --list --json

# Filter by author
dev-fortune --author "Knuth"
```

---

## API Server

**Start the server:**

```bash
npm run server
# Server runs at http://localhost:3000
```

**Endpoints overview:**

| Method | Endpoint                     | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | `/api/quotes/random`         | Get a random quote                 |
| GET    | `/api/quotes`                | List all quotes (supports filters) |
| GET    | `/api/quotes/:id`            | Get quote by ID                    |
| GET    | `/api/categories`            | List available categories          |
| GET    | `/api/languages`             | List supported languages           |
| GET    | `/health`                    | Health check                       |

Query parameters: `lang`, `category`, `author`, `search`, `limit`, `offset`

Full API documentation with request/response schemas: [API.md](API.md)

Interactive Swagger UI is available at `http://localhost:3000/api-docs` when the server is running.

---

## Web Frontend

**Development server:**

```bash
npm run web:dev
# Opens at http://localhost:5173
```

**Production build:**

```bash
npm run web:build
# Output in web/dist/
```

Built with React, Vite, and Tailwind CSS. Automatically deployed to GitHub Pages via the `web-deploy.yml` workflow.

---

## Docker

**Start the full stack (API + Web):**

```bash
docker-compose up
```

**Development mode with hot reload:**

```bash
docker-compose -f docker-compose.dev.yml up
```

Services:
- `api` — Express API server on port `3000`
- `web` — React frontend on port `5173` (dev) / `80` (prod)

Individual images:
```bash
# API server
docker build -f Dockerfile -t dev-fortune-api .

# Web frontend
docker build -f Dockerfile.web -t dev-fortune-web .
```

---

## TUI Interactive Mode

An interactive terminal UI built with [Ink](https://github.com/vadimdemedes/ink):

```bash
dev-fortune --tui
```

Navigate quotes, filter by category or language, and copy to clipboard — all from your terminal.

---

## Bot Integrations

### Slack

```bash
cd integrations/slack
npm install
SLACK_BOT_TOKEN=xoxb-... SLACK_APP_TOKEN=xapp-... node index.js
```

Supports `/fortune` slash command and automatic daily quote posting.

### Discord

```bash
cd integrations/discord
npm install
DISCORD_TOKEN=... node index.js
```

Supports `!fortune`, `!fortune --lang ko`, and `!fortune --category motivation` commands.

Configuration details and deployment guides are in `integrations/slack/README.md` and `integrations/discord/README.md`.

---

## Multilingual Support

Quotes are available in three languages. Pass `--lang <code>` on the CLI or `?lang=<code>` on the API.

| Code | Language | File                    |
|------|----------|-------------------------|
| `en` | English  | `data/quotes-en.json`   |
| `ko` | Korean   | `data/quotes-ko.json`   |
| `ja` | Japanese | `data/quotes-ja.json`   |

Each quote entry includes `text`, `author`, `category`, and `source` fields. Quote files are validated on every pull request via the `validate-quotes.yml` workflow.

---

## Contributing

Contributions are welcome — new quotes, translations, bug fixes, and feature additions alike.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request. By participating you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

Contributors are tracked in `data/contributors.json` and recognized in the project.

---

## License

MIT © 2026 [mongsill6](https://github.com/mongsill6)

---

## Built With

| Layer         | Technology                                                  |
|---------------|-------------------------------------------------------------|
| CLI           | [Node.js](https://nodejs.org), [Commander.js](https://github.com/tj/commander.js) |
| TUI           | [Ink](https://github.com/vadimdemedes/ink)                  |
| API           | [Express](https://expressjs.com), [Swagger UI](https://swagger.io/tools/swagger-ui/) |
| Frontend      | [React](https://react.dev), [Vite](https://vitejs.dev), [Tailwind CSS](https://tailwindcss.com) |
| Testing       | [Jest](https://jestjs.io)                                   |
| Container     | [Docker](https://www.docker.com), [docker-compose](https://docs.docker.com/compose/) |
| CI/CD         | [GitHub Actions](https://github.com/features/actions)      |
| Package       | [npm](https://www.npmjs.com) (ESM)                         |
| Bots          | [Slack Bolt](https://slack.dev/bolt-js/), [discord.js](https://discord.js.org) |
