// CalorieCounter.ai — backend. Extracts food macros via OpenAI.
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const PORT = process.env.PORT || 8080;
const MAX_PROMPT_CHARS = 2000;

// Fail fast — don't boot a server that can't do its one job.
if (!API_KEY) {
  console.error("[FATAL] OPENAI_API_KEY is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "16kb" }));

// CORS: only allow the known frontend origin(s). Comma-separated CORS_ORIGIN in prod.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));

// Rate limit the (paid) AI endpoint so a public deploy can't drain the OpenAI budget.
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a few minutes." },
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/chat", chatLimiter, async (req, res) => {
  // Validate input before spending a token.
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  if (!prompt) return res.status(400).json({ error: "A non-empty 'prompt' is required." });
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ error: `Prompt too long (max ${MAX_PROMPT_CHARS} characters).` });
  }

  const instruction = `From the given list of meals or ingredients, extract and standardize each food entry.
Return JSON shaped exactly as: { "items": [ { "food": string, "quantity": string, "calories": number, "protein": number, "carbs": number, "fats": number } ] }
- food: standardized name (e.g. "boiled chicken breast")
- quantity: as given by the user (e.g. "100gm", "2 eggs")
- calories/protein/carbs/fats: totals for that quantity using nutritional standards (grams for macros)
Exclude any item that is unrecognizable or ambiguous.

Input:
${prompt}`;

  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: "You are a precise nutrition assistant. Respond with JSON only." },
          { role: "user", content: instruction },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }, // guarantees parseable JSON
      },
      { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" }, timeout: 30000 }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) return res.status(502).json({ error: "The AI returned an empty response. Try again." });

    const parsed = JSON.parse(content); // json_object mode → always valid JSON
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return res.json({ response: items });
  } catch (error) {
    // Log details server-side; never leak provider internals to the client.
    console.error("[ERROR] /chat failed:", error.response?.status, error.response?.data || error.message);
    return res.status(502).json({ error: "Couldn't analyze that right now. Please try again." });
  }
});

app.listen(PORT, () => console.log(`[INFO] Server running on port ${PORT} (model: ${MODEL})`));
