import React, { useState, useEffect } from "react";
import { FaSun, FaMoon, FaPlus, FaBolt, FaMicrophone } from "react-icons/fa";
import { useSpeechInput } from "./useSpeechInput";
import "./styles.css";

const SUGGESTIONS = [
  "2 boiled eggs",
  "100g grilled chicken",
  "1 bowl of rice",
  "1 banana",
  "100g paneer",
];

export default function FoodEntryForm({ foodItems, onSubmit, onCalculate, showCalculate }) {
  const [newItem, setNewItem] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("cc.dark") === "1");
  const { listening, supported: micSupported, toggle: toggleMic } = useSpeechInput(setNewItem);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("cc.dark", darkMode ? "1" : "0");
  }, [darkMode]);

  function handleAddSubmit(e) {
    e.preventDefault();
    if (newItem.trim() === "") return;
    onSubmit(newItem.trim());
    setNewItem("");
  }

  return (
    <>
      {/* Hero banner */}
      <div className="hero">
        <div className="hero-overlay" />
        <button
          type="button"
          className="theme-toggle-icon"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle theme"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
        <div className="hero-content">
          <span className="hero-badge"><FaBolt /> AI-powered</span>
          <h1 className="hero-title">
            Calorie<span className="accent">Counter</span>
          </h1>
          <p className="hero-tagline">Say or type what you ate — get instant calories &amp; macros.</p>
        </div>
      </div>

      <div className="panel-body">
        <form className="food-entry-form" onSubmit={handleAddSubmit}>
          <label htmlFor="item" className="sr-only">Food item and quantity</label>
          <div className={`input-wrap ${listening ? "is-listening" : ""}`}>
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              type="text"
              placeholder={listening ? "Listening… speak now" : "e.g. 2 eggs, 100g rice, a banana..."}
              id="item"
            />
            <div className="input-actions">
              {micSupported && (
                <button
                  type="button"
                  className={`btn btn-mic ${listening ? "listening" : ""}`}
                  onClick={toggleMic}
                  aria-label={listening ? "Stop listening" : "Speak your food"}
                  aria-pressed={listening}
                >
                  <FaMicrophone />
                </button>
              )}
              <button className="btn btn-add" type="submit" aria-label="Add food item">
                <FaPlus />
              </button>
            </div>
          </div>
          {micSupported && (
            <p className="mic-hint">
              {listening ? "Listening — say your food, then tap +" : "Tip: tap the mic and just say it."}
            </p>
          )}

          {showCalculate && (
            <button
              className="btn btn-primary btn-calc"
              type="button"
              onClick={onCalculate}
              disabled={foodItems.length === 0}
            >
              <FaBolt /> Calculate Calories
            </button>
          )}
        </form>

        {/* Quick-add suggestions */}
        <div className="suggestions">
          <span className="suggestions-label">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => onSubmit(s)}>
              <FaPlus className="chip-plus" /> {s}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
