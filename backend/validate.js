const MAX_PROMPT_CHARS = 2000;

// Validate the user prompt before spending an OpenAI token. Pure + testable.
function validatePrompt(raw) {
  const prompt = typeof raw === "string" ? raw.trim() : "";
  if (!prompt) return { ok: false, error: "A non-empty 'prompt' is required." };
  if (prompt.length > MAX_PROMPT_CHARS) {
    return { ok: false, error: `Prompt too long (max ${MAX_PROMPT_CHARS} characters).` };
  }
  return { ok: true, prompt };
}

module.exports = { validatePrompt, MAX_PROMPT_CHARS };
