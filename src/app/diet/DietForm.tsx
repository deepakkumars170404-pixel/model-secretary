"use client";

import { useState } from "react";
import foodDatabase from "./foods.json";

export default function DietForm({ action }: { action: (formData: FormData) => void }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    
    // Check if the exact name matches our database to auto-fill calories
    const match = foodDatabase.find(f => f.name === val);
    if (match) {
      setCalories(match.cal.toString());
    }
  };

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-500">Search Food (2000+ Indian options available)</label>
        <input 
          name="name" 
          value={name}
          onChange={handleNameChange}
          list="food-database"
          placeholder="Search Paneer, Chicken, Kuzhambu, Kothu..." 
          required 
          className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent w-full"
          autoComplete="off"
        />
        <datalist id="food-database">
          {foodDatabase.map((m, idx) => (
            <option key={idx} value={m.name}>~{m.cal} kcal</option>
          ))}
        </datalist>
      </div>
      
      <div className="flex gap-2">
        <input 
          name="calories" 
          type="number" 
          value={calories}
          onChange={e => setCalories(e.target.value)}
          placeholder="Calories (Auto-fills if selected)" 
          required 
          className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent flex-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium">Add Meal</button>
      </div>
    </form>
  );
}
