import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FaArrowLeft, FaFire, FaDrumstickBite, FaBreadSlice, FaTint } from "react-icons/fa";

export default function CalorieResponse({ foodItems, setShowResponse, setFoodItems }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 5 : prev));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [progress]);

  const fetchResponse = async () => {
    setProgress(10);
    const prompt = foodItems.map((item) => item.title).join("\n");
    try {
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:8080/chat";
      const { data } = await axios.post(apiUrl, { prompt });
      setProgress(100);
      return data.response || [];
    } catch (error) {
      console.error("[ERROR] Failed to fetch AI response:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const { data: response = [], error, isLoading } = useQuery({
    // Keyed on the food list → React Query caches identical lists automatically.
    queryKey: ["fetchResponse", foodItems],
    queryFn: fetchResponse,
    enabled: foodItems.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (response.length) setShowResponse(true);
  }, [response, setShowResponse]);

  const handleBackClick = () => {
    setShowResponse(false);
    setTimeout(() => {
      setFoodItems([...foodItems]);
    }, 100);
  };

  const total = (field) =>
    response.reduce((sum, item) => {
      const value = item[field];
      if (typeof value === "string") {
        const num = parseFloat(value);
        return !isNaN(num) ? sum + num : sum;
      }
      return sum + (value || 0);
    }, 0);

  if (isLoading) {
    return (
      <div className="response">
        <h2>Fetching Calorie Data...</h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    const msg =
      error.response?.data?.error ||
      "Couldn't reach the calorie service. Check your connection and try again.";
    return (
      <div className="response">
        <div className="response-header">
          <h2>Something went wrong</h2>
          <button type="button" className="back-icon" onClick={handleBackClick} aria-label="Go back">
            <FaArrowLeft />
          </button>
        </div>
        <p>{msg}</p>
      </div>
    );
  }

  const cals = Math.round(total("calories"));
  const macros = [
    { key: "protein", label: "Protein", grams: total("protein"), icon: <FaDrumstickBite />, cls: "m-protein" },
    { key: "carbs", label: "Carbs", grams: total("carbs"), icon: <FaBreadSlice />, cls: "m-carbs" },
    { key: "fats", label: "Fats", grams: total("fats"), icon: <FaTint />, cls: "m-fats" },
  ];
  const macroSum = macros.reduce((s, m) => s + m.grams, 0) || 1;

  return (
    <div className="response">
      <div className="response-header">
        <h2>AI Calorie Breakdown</h2>
        <button type="button" className="back-icon" onClick={handleBackClick} aria-label="Go back">
          <FaArrowLeft />
        </button>
      </div>

      <div className="macro-summary">
        <div className="cal-hero">
          <FaFire className="cal-fire" />
          <div className="cal-text">
            <span className="cal-num">{cals}</span>
            <span className="cal-label">total calories</span>
          </div>
        </div>
        <div className="macro-cards">
          {macros.map((m) => (
            <div key={m.key} className={`macro-card ${m.cls}`}>
              <span className="macro-icon">{m.icon}</span>
              <span className="macro-grams">{m.grams.toFixed(1)}g</span>
              <span className="macro-label">{m.label}</span>
              <div className="macro-bar">
                <div className="macro-fill" style={{ width: `${(m.grams / macroSum) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="table-wrap">
      <table className="calorie-table">
        <thead>
          <tr>
            <th>Food Item</th>
            <th>Quantity</th>
            <th>Calories</th>
            <th>Protein (g)</th>
            <th>Carbs (g)</th>
            <th>Fats (g)</th>
          </tr>
        </thead>
        <tbody>
          {response.map((item, index) => (
            <tr key={index}>
              <td>{item.food}</td>
              <td>{item.quantity}</td>
              <td>{item.calories}</td>
              <td>{item.protein || "-"}</td>
              <td>{item.carbs || "-"}</td>
              <td>{item.fats || "-"}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan="2"><strong>Total</strong></td>
            <td><strong>{Math.round(total("calories"))}</strong></td>
            <td><strong>{total("protein").toFixed(1)}g</strong></td>
            <td><strong>{total("carbs").toFixed(1)}g</strong></td>
            <td><strong>{total("fats").toFixed(1)}g</strong></td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}
