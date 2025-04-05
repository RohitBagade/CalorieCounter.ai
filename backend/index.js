// index.js (Enhanced Debugging for AI response issue)
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

app.post("/chat", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    console.log("[DEBUG] Received user input:", userPrompt);

    if (!API_KEY) {
      console.error("[ERROR] Missing API Key. Ensure OPENAI_API_KEY is set in the .env file.");
      return res.status(500).json({ error: "Missing API Key. Check .env file." });
    }

    const formattedPrompt = `For each food item listed, return only a JSON array with the following fields: 
    - food: Name of the food item
    - quantity: Provided quantity
    - calories: Estimated calorie value
    - protein: Estimated protein in grams
    - carbs: Estimated carbs in grams
    - fats: Estimated fats in grams
    
    Strictly return JSON only, without any explanations or extra text.
    If product is not available, don't add that into the list.
    
    Now process this input:
    ${userPrompt}`;

    console.log("[DEBUG] Formatted prompt sent to AI:", formattedPrompt);

    const response = await axios.post(
      API_URL,
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful nutrition assistant. Respond with JSON only." },
          { role: "user", content: formattedPrompt }
        ],
        temperature: 0.5,
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      }
    );

    console.log("[DEBUG] Raw AI response received:", JSON.stringify(response.data, null, 2));

    if (!response.data.choices || response.data.choices.length === 0) {
      console.error("[ERROR] Invalid AI response structure:", JSON.stringify(response.data, null, 2));
      return res.status(500).json({ error: "Invalid AI response structure", details: response.data });
    }

    const jsonResponse = response.data.choices[0].message.content.trim();
    console.log("[DEBUG] Parsed AI JSON response:", jsonResponse);

    try {
      res.json({ response: JSON.parse(jsonResponse) });
    } catch (parseError) {
      console.error("[ERROR] Failed to parse AI JSON response:", jsonResponse);
      return res.status(500).json({ error: "AI response is not valid JSON", details: jsonResponse });
    }
  } catch (error) {
    console.error("[ERROR] Exception in AI response fetching:", error);
    if (error.response) {
      console.error("[ERROR] API Response Status:", error.response.status);
      console.error("[ERROR] API Response Data:", JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).json({ error: "Failed to get AI response", details: error.response ? error.response.data : error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`[INFO] Server running on port ${PORT}`));
