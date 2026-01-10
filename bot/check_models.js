require('dotenv').config();

async function check() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Checking models for key ending in...", key.slice(-4));

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Error or No Models:", data);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

check();
