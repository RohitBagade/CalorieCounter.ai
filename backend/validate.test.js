const test = require("node:test");
const assert = require("node:assert");
const { validatePrompt } = require("./validate");

test("rejects empty string", () => {
  assert.equal(validatePrompt("").ok, false);
});

test("rejects non-string input", () => {
  assert.equal(validatePrompt(undefined).ok, false);
  assert.equal(validatePrompt(42).ok, false);
});

test("trims and accepts valid input", () => {
  const r = validatePrompt("  2 boiled eggs  ");
  assert.equal(r.ok, true);
  assert.equal(r.prompt, "2 boiled eggs");
});

test("rejects prompts over the length cap", () => {
  assert.equal(validatePrompt("x".repeat(2001)).ok, false);
  assert.equal(validatePrompt("x".repeat(2000)).ok, true);
});
