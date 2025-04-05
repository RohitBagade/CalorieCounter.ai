import React, { useState } from "react";
import "./styles.css";

export default function FoodItem({ id, title, deleteFoodItem, editFoodItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  function handleEditSubmit(e) {
    e.preventDefault();
    editFoodItem(id, newTitle);
    setIsEditing(false);
  }

  return (
    <li key={id} className="food-item">
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="edit-form">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-group">Save</button>
          <button type="button" className="btn btn-group" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <span>{title}</span>
          <button onClick={() => setIsEditing(true)} className="btn btn-edit">Edit</button>
          <button onClick={() => deleteFoodItem(id)} className="btn btn-danger">Delete</button>
        </>
      )}
    </li>
  );
}