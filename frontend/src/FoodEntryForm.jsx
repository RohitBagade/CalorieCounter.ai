import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import "./styles.css";

export default function FoodEntryForm({ foodItems, onSubmit, onCalculate, showCalculate }) {
  const [newItem, setNewItem] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("cc.dark") === "1");

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
      <button
        type="button"
        className="theme-toggle-icon"
        onClick={() => setDarkMode((prev) => !prev)}
        aria-label="Toggle theme"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      <form className="food-entry-form" onSubmit={handleAddSubmit}>
        <div className="form-row">
          <h1 className="header">Calorie Counter</h1>
          <label htmlFor="item" className="sr-only">Food item and quantity</label>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            type="text"
            placeholder="Enter food item and quantity..."
            id="item"
          />
        </div>

        <button className="btn" type="submit">
          Add Food Item
        </button>

        {showCalculate && (
          <button
            className="btn"
            type="button"
            onClick={onCalculate}
            disabled={foodItems.length === 0}
          >
            Calculate Calories
          </button>
        )}
      </form>
    </>
  );
}
