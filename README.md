# Moniepoint Live Dashboard

Private deploy-ready dashboard app for Collins.

## Run locally

```bash
npm start
```

Open `http://localhost:8787`.

## Optional password protection

```bash
DASHBOARD_PASSWORD="choose-a-password" npm start
```

## Data refresh

The dashboard reads `public/data/dashboard-data.json` through `/api/data`.
Benny can regenerate that file from the Moniepoint report pipeline after new emails are processed.

## Deploy

Deploy this folder to a private Node-compatible host such as Render, Railway, Fly.io, VPS, or Vercel serverless adaptation.
Set environment variable `DASHBOARD_PASSWORD` before sharing the URL.

Current generated data: 2026-08-20T23:57:38
