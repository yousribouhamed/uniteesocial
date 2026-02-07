
import { config } from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    console.log(`Loading .env.local from ${envPath}`);
    config({ path: envPath });
} else {
    console.error(".env.local not found!");
    process.exit(1);
}

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const GEMINI_KEY = process.env.GOOGLE_AI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;

console.log("\n--- API Key Status ---");
console.log(`APIFY_API_TOKEN: ${APIFY_TOKEN ? "✅ Present" : "❌ Missing"}`);
console.log(`GOOGLE_AI_API_KEY: ${GEMINI_KEY ? "✅ Present" : "❌ Missing"}`);
console.log(`OPENAI_API_KEY: ${OPENAI_KEY ? "✅ Present" : "❌ Missing"}`);
console.log(`ANTHROPIC_API_KEY: ${CLAUDE_KEY ? "✅ Present" : "❌ Missing"}`);

async function testGemini() {
    if (!GEMINI_KEY) return console.log("Skipping Gemini test (no key)");
    console.log("\n--- Testing Gemini (gemini-1.5-flash) ---");
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello, confirm you are working." }] }]
                })
            }
        );
        const data = await response.json();
        if (response.ok) {
            console.log("✅ Gemini Success:", data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().slice(0, 50) + "...");
        } else {
            console.error("❌ Gemini Failed:", JSON.stringify(data.error, null, 2));
        }
    } catch (e) {
        console.error("❌ Gemini Error:", e);
    }
}

async function testOpenAI() {
    if (!OPENAI_KEY) return console.log("Skipping OpenAI test (no key)");
    console.log("\n--- Testing OpenAI (gpt-4o-mini) ---");
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 10
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log("✅ OpenAI Success:", data.choices?.[0]?.message?.content?.trim());
        } else {
            console.error("❌ OpenAI Failed:", JSON.stringify(data.error, null, 2));
        }
    } catch (e) {
        console.error("❌ OpenAI Error:", e);
    }
}

async function testClaude() {
    if (!CLAUDE_KEY) return console.log("Skipping Claude test (no key)");
    console.log("\n--- Testing Claude (claude-3-sonnet-20240229) ---");
    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": CLAUDE_KEY,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-3-sonnet-20240229",
                max_tokens: 10,
                messages: [{ role: "user", content: "Hello" }]
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log("✅ Claude Success:", data.content?.[0]?.text?.trim());
        } else {
            console.error("❌ Claude Failed:", JSON.stringify(data.error, null, 2));
        }
    } catch (e) {
        console.error("❌ Claude Error:", e);
    }
}

async function runTests() {
    await testGemini();
    await testOpenAI();
    await testClaude();
}

runTests();
