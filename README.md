# The Discord Copilot 🤖

A "Vibe Coded" system to control the personality and rules of a Discord Bot using a modern Web Dashboard.

## 🌟 Features
- **🧠 Brain**: Define your bot's persona (System Instructions) in real-time.
- **🛡️ Security**: Allow-list specific Discord channels; the bot ignores everything else.
- **🔒 Secure Auth**: Email/Password authentication restricts Dashboard access to Admins only.
- **📜 Logs**: Watch chat interactions happen live on the Dashboard (Supabase Realtime).
- **🧹 Memory Control**: Reset the bot's conversation context with a single click.
- **🤖 AI**: Powered by Google Gemini (Flash 1.5/2.5) for fast, intelligent responses.

## 🛠️ Tech Stack
- **Web App**: Next.js 14, Tailwind CSS, Shadcn/UI.
- **Bot**: Node.js, Discord.js v14, Google Generative AI SDK.
- **Backend**: Supabase (PostgreSQL + Realtime).

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ installed.
- **Supabase Project**: With `profiles`, `bot_config`, and `chat_logs` tables.
- **Discord App**: Create one at [Discord Developer Portal](https://discord.com/developers/applications).
- **Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/).

### 2. Installation

#### 🖥️ Web Dashboard
The Control Center for your bot.

1.  Navigate to the web folder:
    ```bash
    cd web
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment:
    Create `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  Run development server:
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`.
    **(Note: You will be redirected to Login. Use the Sign Up link or create a user in Supabase Authentication dashboard).**

#### 🤖 Discord Bot
The agent living in your server.

1.  Navigate to the bot folder:
    ```bash
    cd bot
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment:
    Create `.env`:
    ```env
    DISCORD_TOKEN=your_discord_bot_token
    GEMINI_API_KEY=your_gemini_api_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    ```
4.  Start the bot:
    ```bash
    node index.js
    ```

---

## 📖 Usage Guide

1.  **Invite Bot**: Use the OAuth2 URL Generator in Discord Dev Portal (Scopes: `bot`, Perms: `Send Messages`, `View Channels`).
2.  **Configure Channel**:
    - In Discord, Right-click channel -> **Copy Channel ID** (Enable Developer Mode in User Settings if missing).
    - In Web Dashboard -> **Configuration** -> Add the ID.
3.  **Set Personality**:
    - In Web Dashboard -> **Brain** -> Write instructions (e.g., "You are a very rude pirate"). -> Save.
4.  **Chat**:
    - Talk in the allowed channel. The bot will respond in character!
    - Watch the **Logs** tab in the dashboard to see it happen live.

## 🤝 Troubleshooting
- **Bot Not Replying?** Check if the Channel ID is in the "Allowed Channels" list.
- **Crash on Start?** Ensure `bot_config` table has at least one row (Save something in the Dashboard first).
- **Empty Logs?** Ensure Supabase Realtime is enabled for the `chat_logs` table.
- **Bot Still a Pirate?** Click "Clear Memory" in the Logs tab to wipe the old context (the bot uses persistent database logs).
