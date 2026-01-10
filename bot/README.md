# Discord Bot Setup Guide

## 1. Get your Discord Token
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** (top right) and give it a name (e.g., "Discord Copilot").
3. Go to the **Bot** tab in the left sidebar.
4. Click **Reset Token** to generate a new token. **Copy this string immediately**—that is your `DISCORD_TOKEN`.

## 2. Important Settings
While in the **Bot** tab, scroll down to **Privileged Gateway Intents**:
- [x] **Message Content Intent**: Toggle this **ON**.
- [x] **Server Members Intent**: Helpful to have ON.
- Click **Save Changes**.

## 3. Invite the Bot
1. Go to the **OAuth2** tab > **URL Generator**.
2. Scopes: Check `bot`.
3. Bot Permissions: Check `Send Messages`, `Read Messages/View Channels`.
4. Copy the generated URL and paste it in your browser to invite the bot to your server.

## 4. Local Setup
1. Rename `.env.example` to `.env`.
2. Open `.env` and paste your token:
   ```
   DISCORD_TOKEN=your_token_starts_with_M...
   ```
3. Run `npm install` and then `node index.js`.

## Troubleshooting
**"No results found" / Can't select a server?**
- You need **Manage Server** permissions to invite a bot.
- If you don't have a server, create one for free: click the **+** icon on the left sidebar of your Discord app.
- Once created, refresh the invite page.
