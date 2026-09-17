export default function WorkoutPage() {
  const workoutPlans = [
    {
      day: "Monday",
      target: "Chest & Triceps",
      routines: [
        "Push-ups - 3 sets of 15 reps",
        "Dumbbell Bench Press - 3 sets of 10 reps",
        "Tricep Dips - 3 sets of 12 reps",
        "Plank - 60 seconds"
      ]
    },
    {
      day: "Tuesday",
      target: "Back & Biceps",
      routines: [
        "Pull-ups or Lat Pulldowns - 3 sets of 10 reps",
        "Dumbbell Rows - 3 sets of 12 reps",
        "Bicep Curls - 3 sets of 15 reps",
        "Russian Twists - 3 sets of 20 reps"
      ]
    },
    {
      day: "Wednesday",
      target: "Rest & Active Recovery",
      routines: [
        "Light Yoga / Stretching for 20 minutes",
        "Brisk Walk - 30 minutes"
      ]
    },
    {
      day: "Thursday",
      target: "Legs & Core",
      routines: [
        "Squats - 4 sets of 12 reps",
        "Lunges - 3 sets of 15 reps per leg",
        "Calf Raises - 3 sets of 20 reps",
        "Crunches - 3 sets of 25 reps"
      ]
    },
    {
      day: "Friday",
      target: "Shoulders & Cardio",
      routines: [
        "Overhead Press - 3 sets of 10 reps",
        "Lateral Raises - 3 sets of 15 reps",
        "Jump Rope - 10 minutes",
        "Burpees - 3 sets of 10 reps"
      ]
    }
  ];

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-2">Workout Routines</h1>
      <p className="text-zinc-500 mb-6">Here is your built-in fitness plan for optimal weight gain and toning.</p>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 shadow-sm border border-blue-100 dark:border-blue-900/50 mb-8">
        <h2 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">AI Trainer Suggestion 💡</h2>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Since you are aiming to build muscle and increase your weight healthily, ensure you are eating at least 300-500 extra calories above your maintenance level. Focus on lifting heavier weights with lower reps (8-12) to stimulate muscle growth!
        </p>
      </div>

      <div className="space-y-4">
        {workoutPlans.map(plan => (
          <div key={plan.day} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{plan.day}</h2>
              <span className="bg-zinc-100 dark:bg-zinc-700 text-xs px-3 py-1 rounded-full font-medium">{plan.target}</span>
            </div>
            <ul className="space-y-2">
              {plan.routines.map((routine, idx) => (
                <li key={idx} className="flex gap-2 items-start text-sm">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{routine}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
