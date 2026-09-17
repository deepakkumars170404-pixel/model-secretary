import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  // Try to fetch user profile
  let profile = await prisma.userProfile.findFirst();
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        name: "My Profile",
        dailyCalories: 2500, // Example default for weight gain
        dailyWaterMl: 3000,
      }
    });
  }

  // Fetch today's meals (simple logic: all meals for now, since we aren't filtering by date yet)
  const meals = await prisma.meal.findMany();
  const totalCaloriesEaten = meals.reduce((sum, meal) => sum + meal.calories, 0);

  // Fetch next active reminder
  const nextReminder = await prisma.reminder.findFirst({
    where: { isActive: true },
    orderBy: { time: 'asc' }
  });

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
      <p className="text-zinc-500 mb-8">Here is your daily summary</p>

      {/* Calories Summary Card */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-6 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-3">Diet & Calories 🍎</h2>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold">{totalCaloriesEaten}</span>
          <span className="text-zinc-500 mb-1">/ {profile.dailyCalories || 2500} kcal</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 mt-4">
          <div 
            className="bg-blue-500 h-2.5 rounded-full" 
            style={{ width: `${Math.min(100, (totalCaloriesEaten / (profile.dailyCalories || 2500)) * 100)}%` }}
          ></div>
        </div>
        <Link href="/diet" className="block mt-4 text-sm text-blue-500 font-medium">Log a meal →</Link>
      </div>

      {/* Next Reminder Card */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-6 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-3">Up Next 📅</h2>
        {nextReminder ? (
          <div className="flex items-center gap-4">
            <div className="bg-zinc-100 dark:bg-zinc-700 p-3 rounded-xl font-bold">
              {nextReminder.time}
            </div>
            <div>
              <p className="font-medium">{nextReminder.message}</p>
              <p className="text-sm text-zinc-500 capitalize">{nextReminder.type}</p>
            </div>
          </div>
        ) : (
          <p className="text-zinc-500">No reminders set for today.</p>
        )}
        <Link href="/timetable" className="block mt-4 text-sm text-blue-500 font-medium">Manage timetable →</Link>
      </div>

      {/* AI Assistant Button */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/50">
        <h2 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">AI Assistant 🤖</h2>
        <p className="text-blue-800/70 dark:text-blue-200/70 text-sm mb-4">
          Ask me anything! I can give you diet advice, style tips, or help you plan your workouts.
        </p>
        <Link href="/chat" className="inline-block bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
          Open Chat
        </Link>
      </div>
    </div>
  );
}
