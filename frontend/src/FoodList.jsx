import React from "react";
import { FaUtensils } from "react-icons/fa";
import FoodItem from "./FoodItem";
import "./styles.css";

export default function FoodList({ foodItems, deleteFoodItem, editFoodItem }) {
  if (foodItems.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><FaUtensils /></div>
        <p className="empty-title">Your plate is empty</p>
        <p className="empty-hint">Add a food above, or tap a suggestion to get started.</p>
      </div>
    );
  }

  return (
    <ul className="list">
      {foodItems.map((item) => (
        <FoodItem {...item} key={item.id} deleteFoodItem={deleteFoodItem} editFoodItem={editFoodItem} />
      ))}
    </ul>
  );
}
