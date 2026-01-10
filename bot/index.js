require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini
// CAUTION: Ensure GEMINI_API_KEY is in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "MISSING_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Cache for System Instructions and Allowed Channels
let systemInstructions = "You are a helpful assistant.";
let allowedChannels = new Set();

async function fetchConfig() {
    console.log('Fetching bot config...');
    // Use maybeSingle() to avoid crash if no rows exist
    const { data, error } = await supabase
        .from('bot_config')
        .select('system_instructions, allowed_channels')
        .maybeSingle();

    if (error) {
        console.error('Error fetching config:', error.message);
        return;
    }

    if (data) {
        systemInstructions = data.system_instructions || systemInstructions;
        allowedChannels = new Set(data.allowed_channels || []);
        console.log('Config updated from DB.');
    } else {
        console.log('No config found in DB, using defaults.');
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await fetchConfig();
    // Refresh config every minute
    setInterval(fetchConfig, 60000);
});

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check allow-list
    if (!allowedChannels.has(message.channel.id)) {
        return;
    }

    try {
        // 1. Fetch Context (Last 5 messages)
        const messages = await message.channel.messages.fetch({ limit: 6 }); // +1 for current
        // Simple history formatting for Gemini
        const history = messages.reverse().map(m => {
            const role = m.author.id === client.user.id ? 'Model' : 'User';
            // Simplify content to avoid excessive tokens or format issues
            return `${role}: ${m.content}`;
        }).join('\n');

        // 2. Generate Response
        // Enhanced prompt to ensure it follows system instructions strictly
        const prompt = `
System Instructions: ${systemInstructions}

Current Conversation:
${history}

Model Response:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let responseContent = response.text();

        // 3. Send Response
        // Split if too long (Discord limit 2000)
        if (responseContent.length > 2000) {
            responseContent = responseContent.substring(0, 1997) + '...';
        }
        await message.reply(responseContent);

        // 4. Log to Supabase
        const { error } = await supabase.from('chat_logs').insert({
            user_handle: message.author.tag,
            message_content: message.content,
            bot_response: responseContent,
            timestamp: new Date().toISOString()
        });

        if (error) console.error('Error logging chat:', error);

    } catch (err) {
        console.error('Error processing message:', err);
        // Optional: message.reply("I had trouble thinking of a response.");
    }
});

client.login(process.env.DISCORD_TOKEN);
