import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ApiKeySettings from "@/components/ApiKeySettings";

export default async function ProfilePage() {
  let profile = await prisma.userProfile.findFirst();
  if (!profile) {
    profile = await prisma.userProfile.create({ data: {} });
  }

  async function updateProfile(formData: FormData) {
    "use server";
    const heightCm = parseFloat(formData.get("heightCm") as string) || null;
    const weightKg = parseFloat(formData.get("weightKg") as string) || null;
    const goalWeightKg = parseFloat(formData.get("goalWeightKg") as string) || null;
    
    // Simple AI Smart Suggestion logic for weight gain
    let dailyCalories = 2500;
    let idealWeightMin = null;
    let idealWeightMax = null;

    if (heightCm && weightKg) {
      // Basic BMR calculation + surplus for weight gain
      const bmr = 10 * weightKg + 6.25 * heightCm - 5 * 25 + 5; // Assumed male, 25 years old
      dailyCalories = Math.round((bmr * 1.55) + 500); // 1.55 activity level + 500 cal surplus
      
      // Calculate Ideal Weight Range (BMI 18.5 - 24.9)
      const heightM = heightCm / 100;
      idealWeightMin = Math.round(18.5 * (heightM * heightM) * 10) / 10;
      idealWeightMax = Math.round(24.9 * (heightM * heightM) * 10) / 10;
    }

    await prisma.userProfile.update({
      where: { id: profile!.id },
      data: {
        heightCm,
        weightKg,
        goalWeightKg: goalWeightKg || idealWeightMax, // Default goal to top of ideal range if none set
        dailyCalories,
        dailyWaterMl: weightKg ? Math.round(weightKg * 35) : 3000 // 35ml per kg
      }
    });
    revalidatePath("/profile");
    revalidatePath("/");
  }

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <ApiKeySettings />

      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-6 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-4">Body Metrics</h2>
        <form action={updateProfile} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Height (cm)</label>
            <input 
              name="heightCm" 
              type="number" 
              defaultValue={profile.heightCm || ''} 
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Current Weight (kg)</label>
            <input 
              name="weightKg" 
              type="number" 
              defaultValue={profile.weightKg || ''} 
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Goal Weight (kg)</label>
            <input 
              name="goalWeightKg" 
              type="number" 
              defaultValue={profile.goalWeightKg || ''} 
              className="w-full border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium mt-2">
            Save & Get AI Suggestions
          </button>
        </form>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/50">
        <h2 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">AI Trainer Suggestions</h2>
        <ul className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
          {profile.heightCm && (
            <li>⚖️ <strong>Ideal Weight:</strong> {Math.round(18.5 * Math.pow(profile.heightCm / 100, 2) * 10)/10} - {Math.round(24.9 * Math.pow(profile.heightCm / 100, 2) * 10)/10} kg (Based on healthy BMI)</li>
          )}
          <li>🔥 <strong>Target Calories:</strong> {profile.dailyCalories || '--'} kcal / day</li>
          <li>💧 <strong>Water Intake:</strong> {profile.dailyWaterMl || '--'} ml / day</li>
          <li className="pt-2 text-blue-900/60 dark:text-blue-200/60 italic">These targets are optimized for healthy weight gain based on your metrics!</li>
        </ul>
      </div>
    </div>
  );
}
