import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import DietForm from "./DietForm";

export default async function DietPage() {
  const meals = await prisma.meal.findMany({
    orderBy: { eatenAt: 'desc' }
  });
  
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  async function addMeal(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const calories = parseInt(formData.get("calories") as string);
    
    if (name && calories) {
      await prisma.meal.create({
        data: { name, calories }
      });
      revalidatePath("/diet");
      revalidatePath("/");
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Diet Tracker</h1>
      
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-8 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-xl font-bold mb-1">{totalCalories} <span className="text-sm font-normal text-zinc-500">kcal total</span></h2>
        <p className="text-zinc-500 text-sm mb-4">Total calories logged.</p>
        
        <DietForm action={addMeal} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Meal History</h2>
      <div className="flex flex-col gap-3">
        {meals.map(meal => (
          <div key={meal.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="font-medium">{meal.name}</p>
              <p className="text-xs text-zinc-500">{new Date(meal.eatenAt).toLocaleTimeString()}</p>
            </div>
            <div className="font-bold">{meal.calories} kcal</div>
          </div>
        ))}
        {meals.length === 0 && (
          <p className="text-zinc-500 text-sm">No meals logged yet.</p>
        )}
      </div>
    </div>
  );
}
