import React, { useEffect, useState } from "react";
import "./styles.css";
import FoodEntryForm from "./FoodEntryForm";
import FoodList from "./FoodList";
import CalorieResponse from "./CalorieResponse";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function MainApp() {
  const [foodItems, setFoodItems] = useState([]);
  const [showResponse, setShowResponse] = useState(false);
  const [cachedResponse, setCachedResponse] = useState(null);
  const [shouldUseCache, setShouldUseCache] = useState(false);

  function addFoodItem(title) {
    setFoodItems((currentItems) => [
      ...currentItems,
      { id: crypto.randomUUID(), title },
    ]);
  }

  function editFoodItem(id, newTitle) {
    setFoodItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      )
    );
  }

  function deleteFoodItem(id) {
    setFoodItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  function handleCalculate(triggerSource = null) {
    if (triggerSource === "USE_CACHE" && cachedResponse) {
      setShouldUseCache(true);
      setShowResponse(true);
    } else {
      setShouldUseCache(false);
      setShowResponse(true);
    }
  }

  return (
    <div className="container">
      <FoodEntryForm
        foodItems={foodItems}
        onSubmit={addFoodItem}
        handleCalculate={handleCalculate}
        showCalculate={!showResponse}
        setShowResponse={setShowResponse}
      />
      {!showResponse ? (
        <FoodList
          foodItems={foodItems}
          deleteFoodItem={deleteFoodItem}
          editFoodItem={editFoodItem}
        />
      ) : (
        <CalorieResponse
          foodItems={foodItems}
          setShowResponse={setShowResponse}
          setFoodItems={setFoodItems}
          shouldUseCache={shouldUseCache}
          cachedResponse={cachedResponse}
          setCachedResponse={setCachedResponse}
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
