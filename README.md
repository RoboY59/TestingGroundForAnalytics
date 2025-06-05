# TestingGroundForAnalytics

This project provides a small Express server that exposes several endpoints to
query data from the Clash of Clans API. Before running the server, create a
`.env` file based on the provided `.env.example` and supply the required values.

## Environment variables

```
PORT=3000            # Port on which the server will run
COC_API_KEY=your_api_key
CLAN_TAG=your_clan_tag
```

The `PORT` variable is optional &ndash; if omitted the server defaults to
`3000`.

## Running the server

Install dependencies and start the server:

```bash
npm install
npm start
```
