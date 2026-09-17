import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function TimetablePage() {
  let reminders = await prisma.reminder.findMany({
    orderBy: { time: 'asc' }
  });

  if (reminders.length === 0) {
    const defaultReminders = [
      { type: 'wakeup', time: '06:30', message: 'Wake up and shine! ☀️', isActive: true },
      { type: 'water', time: '07:00', message: 'Drink 500ml water 💧', isActive: true },
      { type: 'workout', time: '07:30', message: 'Morning Workout Routine 💪', isActive: true },
      { type: 'meal', time: '09:00', message: 'Breakfast time 🍎', isActive: true },
      { type: 'water', time: '11:00', message: 'Drink 500ml water 💧', isActive: true },
      { type: 'meal', time: '13:00', message: 'Lunch time 🍛', isActive: true },
      { type: 'water', time: '15:00', message: 'Drink 500ml water 💧', isActive: true },
      { type: 'meal', time: '16:30', message: 'Evening snack 🥪', isActive: true },
      { type: 'workout', time: '18:00', message: 'Evening walk / stretch 🚶', isActive: true },
      { type: 'meal', time: '20:00', message: 'Dinner time 🍲', isActive: true },
      { type: 'sleep', time: '22:30', message: 'Wind down for bed 🌙', isActive: true },
    ];
    await prisma.reminder.createMany({ data: defaultReminders });
    reminders = await prisma.reminder.findMany({ orderBy: { time: 'asc' } });
  }

  async function addReminder(formData: FormData) {
    "use server";
    const type = formData.get("type") as string;
    const time = formData.get("time") as string;
    const message = formData.get("message") as string;
    
    if (type && time && message) {
      await prisma.reminder.create({
        data: { type, time, message, isActive: true }
      });
      revalidatePath("/timetable");
      revalidatePath("/");
    }
  }

  async function toggleReminder(id: string, currentStatus: boolean) {
    "use server";
    await prisma.reminder.update({
      where: { id },
      data: { isActive: !currentStatus }
    });
    revalidatePath("/timetable");
  }

  async function deleteReminder(id: string) {
    "use server";
    await prisma.reminder.delete({ where: { id } });
    revalidatePath("/timetable");
    revalidatePath("/");
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Daily Timetable</h1>

      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-8 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-4">Add Reminder</h2>
        <form action={addReminder} className="flex flex-col gap-3">
          <select name="type" className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent">
            <option value="meal">🍎 Meal</option>
            <option value="water">💧 Water</option>
            <option value="workout">💪 Workout</option>
            <option value="wakeup">☀️ Wake up</option>
            <option value="sleep">🌙 Sleep</option>
          </select>
          <div className="flex gap-2">
            <input 
              name="time" 
              type="time" 
              required 
              className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent flex-1"
            />
            <input 
              name="message" 
              placeholder="Message" 
              required 
              className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent flex-[2]"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium mt-1">Add to Schedule</button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {reminders.map(r => (
          <div key={r.id} className={`flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border ${r.isActive ? 'border-zinc-200 dark:border-zinc-700' : 'border-dashed border-zinc-200 opacity-50'}`}>
            <div className="font-bold text-lg">{r.time}</div>
            <div className="flex-1">
              <p className="font-medium">{r.message}</p>
              <p className="text-xs text-zinc-500 capitalize">{r.type}</p>
            </div>
            <form action={deleteReminder.bind(null, r.id)}>
              <button type="submit" className="text-red-500 hover:bg-red-50 p-2 rounded-full">✕</button>
            </form>
          </div>
        ))}
        {reminders.length === 0 && (
          <p className="text-zinc-500 text-sm">Your timetable is empty. Add a reminder above!</p>
        )}
      </div>
    </div>
  );
}
