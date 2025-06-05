# TestingGroundForAnalytics

This project provides an Express.js server that queries the Clash of Clans API and serves a small frontend.

## Setup

1. Copy the example environment file and fill in your credentials:

   ```bash
   cp .env.example .env
   # edit .env and set COC_API_KEY, CLAN_TAG and optionally PORT
   ```

2. Install dependencies and start the server:

   ```bash
   npm install
   npm start
   ```

## Available scripts

- `npm start` – launches the server on the configured port (default `3000`).
- `npm run dev` – runs the server with nodemon for development.
- `npm test` – executes the Jest test suite.

## Project structure

- `server.js` – main server with API routes.
- `public/` – static frontend files.
- `__tests__/` – Jest tests.
- `.env.example` – template for environment variables.


