import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

export default function CalorieResponse({ foodItems, setShowResponse, setFoodItems, shouldUseCache, cachedResponse, setCachedResponse }) {
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
      const { data } = await axios.post(
        import.meta.env.VITE_REACT_APP_API_URL,
        { prompt }
      );
      setProgress(100);
      setCachedResponse(data.response || []);
      return data.response || [];
    } catch (error) {
      console.error("[ERROR] Failed to fetch AI response:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const { data: response = [], error, isLoading } = useQuery({
    queryKey: ["fetchResponse", foodItems, shouldUseCache],
    queryFn: shouldUseCache && cachedResponse ? () => cachedResponse : fetchResponse,
    enabled: foodItems.length > 0,
    onSuccess: (data) => {
      setShowResponse(true);
    },
  });

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
    return (
      <div className="response">
        <h2>Error fetching AI response.</h2>
        <p>Please check your internet connection and try again.</p>
        <pre>{JSON.stringify(error.response?.data || error.message, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="response">
      <div className="response-header">
        <h2>AI Calorie Breakdown</h2>
        <div className="back-icon" onClick={handleBackClick}>
          <FaArrowLeft />
        </div>
      </div>
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
  );
}
