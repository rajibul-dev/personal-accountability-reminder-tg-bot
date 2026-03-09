# Telegram Accountability Reminder Bot

Small Telegram bot that posts a daily accountability reminder in a group chat.

Built as a personal tool for a small group to report daily progress toward their goals.

## Stack

- Node.js
- TypeScript
- Express
- Grammy (Telegram Bot API)

## How it works

The bot runs a small Express server and exposes endpoints:

```
GET /run → triggers reminder message
GET /test → sends a test message
GET / → health check
```

A cron service can call `/run` to trigger the reminder automatically.

## Deployment

Designed to run on any lightweight Node environment
(e.g. Fly.io, Render, Railway).
