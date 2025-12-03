import dotenv from 'dotenv';
import path from 'path';

// Load env from the correct path (server/.env)
dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("❌ No GEMINI_API_KEY found in environment");
        return;
    }
    console.log("🔹 Checking models for key ending in...", key.slice(-4));

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
            return;
        }

        console.log("\n✅ Available Models:");
        if (data.models) {
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("No models found in response:", data);
        }
    } catch (err: any) {
        console.error("❌ Fetch Error:", err.message);
    }
}
check();
