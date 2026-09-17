import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export default async function TimelinePage() {
  const pics = await prisma.transformationPic.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function uploadPic(formData: FormData) {
    "use server";
    const file = formData.get("file") as File;
    const monthYear = formData.get("monthYear") as string;
    
    if (file && file.size > 0 && monthYear) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);
      
      fs.writeFileSync(uploadPath, buffer);
      const imageUrl = `/uploads/${fileName}`;

      // Mock AI Style Analysis based on the uploaded pic
      const aiStyleAdvice = `
Based on your uploaded picture:
👔 **Colors**: Dark blue, emerald green, and charcoal grey will perfectly complement your skin tone.
👖 **Pants**: A slim-fit beige chino or a classic dark wash denim will match well with those colors.
⌚ **Accessories**: A silver-tone analog watch or a minimalist leather band watch.
👟 **Shoes**: White leather sneakers for a casual look, or tan loafers for a smart-casual upgrade.
`;

      await prisma.transformationPic.create({
        data: {
          monthYear,
          imageUrl,
          aiStyleAdvice,
        }
      });
      revalidatePath("/timeline");
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">Monthly Timeline</h1>

      <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm mb-8 border border-zinc-100 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-2">Upload Transformation Pic</h2>
        <p className="text-sm text-zinc-500 mb-4">Upload your picture to track progress and get AI styling suggestions.</p>
        <form action={uploadPic} className="flex flex-col gap-3">
          <input 
            name="monthYear" 
            placeholder="e.g., September 2026" 
            required 
            className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent"
          />
          <input 
            name="file" 
            type="file" 
            accept="image/*"
            required 
            className="border border-zinc-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-transparent"
          />
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-xl font-medium mt-1">
            Upload & Analyze
          </button>
        </form>
      </div>

      <h2 className="text-xl font-bold mb-4">Your Upgraded Versions</h2>
      <div className="space-y-6">
        {pics.map(pic => (
          <div key={pic.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="p-4 bg-zinc-200 dark:bg-zinc-800 font-bold text-center">
              {pic.monthYear}
            </div>
            <img src={pic.imageUrl} alt={pic.monthYear} className="w-full h-auto object-cover max-h-96" />
            
            {pic.aiStyleAdvice && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">✨ AI Stylist Suggestions</h3>
                <div className="text-sm space-y-2 whitespace-pre-wrap">
                  {pic.aiStyleAdvice.trim()}
                </div>
              </div>
            )}
          </div>
        ))}
        {pics.length === 0 && (
          <p className="text-zinc-500 text-center py-4">No transformation pictures uploaded yet. Start tracking your journey!</p>
        )}
      </div>
    </div>
  );
}
