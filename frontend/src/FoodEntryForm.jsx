import React, { useState, useRef, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import "./styles.css";

export default function FoodEntryForm({ foodItems, onSubmit, handleCalculate, showCalculate, setShowResponse }) {
  const [newItem, setNewItem] = useState("");
  const previousFoodListRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  function handleAddSubmit(e) {
    e.preventDefault();
    if (newItem.trim() === "") return;
    onSubmit(newItem);
    setNewItem("");
  }

  function handleCalorieCount() {
    if (foodItems.length === 0) {
      alert("Please add some food items!");
      return;
    }

    const currentFoodListString = JSON.stringify(foodItems);
    const previousList = previousFoodListRef.current;

    if (previousList === currentFoodListString) {
      handleCalculate("USE_CACHE");
    } else {
      handleCalculate();
    }

    previousFoodListRef.current = currentFoodListString; // Update after check
    setShowResponse(true);
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

      <form className="food-entry-form">
        <div className="form-row">
          <h1 className="header">Calorie Counter</h1>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            type="text"
            placeholder="Enter food item and quantity..."
            id="item"
          />
        </div>

        <button className="btn" onClick={handleAddSubmit}>
          Add Food Item
        </button>

        {showCalculate && (
          <button className="btn" type="button" onClick={handleCalorieCount} disabled={foodItems.length === 0}>
            Calculate Calories
          </button>
        )}
      </form>
    </>
  );
}
