import React, { useEffect, useState } from "react";
import "./styles.css";
import FoodEntryForm from "./FoodEntryForm";
import FoodList from "./FoodList";
import CalorieResponse from "./CalorieResponse";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const STORAGE_KEY = "cc.foodItems";

function MainApp() {
  // Persist the food list so a refresh doesn't wipe it.
  const [foodItems, setFoodItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foodItems));
  }, [foodItems]);

  function addFoodItem(title) {
    setFoodItems((items) => [...items, { id: crypto.randomUUID(), title }]);
  }

  function editFoodItem(id, newTitle) {
    setFoodItems((items) => items.map((it) => (it.id === id ? { ...it, title: newTitle } : it)));
  }

  function deleteFoodItem(id) {
    setFoodItems((items) => items.filter((it) => it.id !== id));
  }

  return (
    <div className="container">
      <FoodEntryForm
        foodItems={foodItems}
        onSubmit={addFoodItem}
        onCalculate={() => setShowResponse(true)}
        showCalculate={!showResponse}
      />
      {!showResponse ? (
        <FoodList foodItems={foodItems} deleteFoodItem={deleteFoodItem} editFoodItem={editFoodItem} />
      ) : (
        <CalorieResponse
          foodItems={foodItems}
          setShowResponse={setShowResponse}
          setFoodItems={setFoodItems}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}
