import React from "react";
import FoodItem from "./FoodItem";
import "./styles.css";

export default function FoodList({ foodItems, deleteFoodItem, editFoodItem }) {
  return (
    <ul className="list">
      {foodItems.length === 0 && "No food items added yet."}
      {foodItems.map((item) => (
        <FoodItem {...item} key={item.id} deleteFoodItem={deleteFoodItem} editFoodItem={editFoodItem} />
      ))}
    </ul>
  );
}
